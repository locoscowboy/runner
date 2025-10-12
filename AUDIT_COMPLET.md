# 🔍 AUDIT COMPLET - Runner Codebase

## ✅ Points Forts (Architecture solide)

### 1. Cohérence des PDA Seeds ✅
**Rust** (programs/runner/src/constants.rs) :
```rust
pub const GLOBAL_STATE_SEED: &[u8] = b"global_state";
pub const RACE_SEED: &[u8] = b"race";
pub const ESCROW_SEED: &[u8] = b"escrow";
```

**Backend** (backend/src/config/constants.ts) :
```typescript
export const GLOBAL_STATE_SEED = 'global_state';
export const RACE_SEED = 'race';
export const ESCROW_SEED = 'escrow';
```

**Frontend** (frontend/src/lib/solana/program.ts) :
```typescript
export const GLOBAL_STATE_SEED = 'global_state';
export const RACE_SEED = 'race';
export const ESCROW_SEED = 'escrow';
```

✅ **Verdict** : Parfaitement alignés

---

### 2. Cohérence des Constants ✅
**MIN/MAX BET** identiques partout (10M et 5B lamports)
**RAKE_BPS** cohérent (150 = 1.5%)

---

### 3. Architecture Smart Contract ✅
- 5 instructions bien définies
- Events cohérents
- Error handling complet
- State management propre

---

### 4. Database Schema ✅
- Tables bien structurées
- Views optimisées
- Real-time configuré
- RLS activé

---

## 🚨 Problèmes Critiques à Fixer

### ❌ PROBLÈME #1 : Escrow PDA jamais initialisé

**Localisation** : `programs/runner/src/instructions/place_bet.rs`

**Problème** :
```rust
#[account(
    mut,
    seeds = [ESCROW_SEED, race.race_id.to_le_bytes().as_ref()],
    bump,
)]
/// CHECK: Escrow PDA for holding bets
pub escrow: AccountInfo<'info>,
```

L'escrow est référencé mais **jamais créé**. Quand un joueur essaie de parier, Anchor va chercher ce PDA qui n'existe pas → **ERREUR**.

**Solutions possibles** :

#### Option A : Créer l'escrow dans initialize_race ⭐ RECOMMANDÉ
```rust
// Dans initialize_race.rs
#[derive(Accounts)]
pub struct InitializeRace<'info> {
    // ... existing accounts
    
    #[account(
        init,
        payer = authority,
        space = 8,  // Juste un marker account
        seeds = [ESCROW_SEED, global_state.current_race_id.to_le_bytes().as_ref()],
        bump
    )]
    pub escrow: SystemAccount<'info>,
}
```

#### Option B : Init-if-needed dans place_bet
```rust
#[account(
    init_if_needed,
    payer = player,
    space = 8,
    seeds = [ESCROW_SEED, race.race_id.to_le_bytes().as_ref()],
    bump
)]
pub escrow: SystemAccount<'info>,
```

#### Option C : Simple PDA sans init (le plus simple) ⭐⭐ ULTRA SIMPLE
```rust
// Pas besoin d'init ! Un PDA peut recevoir des lamports sans être initialisé
// Garder tel quel mais retirer `bump` car on ne l'a pas stocké
```

**Recommandation** : **Option C** - Les PDAs peuvent recevoir des lamports sans être initialisés. Il suffit de retirer le `bump` constraint.

---

### ❌ PROBLÈME #2 : Backend ne peut pas deviner le winner

**Localisation** : `backend/src/services/raceOrchestrator.ts:170`

**Problème** :
```typescript
// For now, we pass the first player as winner account
// The contract will verify the actual winner
const winnerPubkey = race.players[0]?.pubkey || authority.publicKey;
```

Le smart contract vérifie que le winner passé est correct (ligne 112 de resolve_race.rs). Si on passe le mauvais winner → **ERREUR**.

**Solutions** :

#### Option A : Calculer le winner dans le backend ⭐ RECOMMANDÉ
```typescript
// Avant d'appeler resolve_race
function calculateWinner(
  serverSeed: Buffer,
  slotHash: Buffer,
  raceId: number,
  players: Array<{pubkey: PublicKey, betAmount: BN}>,
  totalPot: BN
): PublicKey {
  // Même algo que le smart contract
  const entropy = Buffer.concat([
    serverSeed,
    slotHash,
    Buffer.from(new BN(raceId).toArray('le', 8))
  ]);
  
  const hash = keccak256(entropy);
  const randomValue = new BN(hash.slice(0, 8), 'le');
  const winnerTicket = randomValue.mod(totalPot);
  
  let cumulative = new BN(0);
  for (const player of players) {
    cumulative = cumulative.add(player.betAmount);
    if (cumulative.gt(winnerTicket)) {
      return player.pubkey;
    }
  }
  
  throw new Error('Winner not found');
}

// Dans resolveRace:
const slotHash = await getSlotHashFromChain(race.resolution_slot);
const winner = calculateWinner(
  Buffer.from(raceData.server_seed, 'hex'),
  slotHash,
  raceId,
  race.players,
  race.totalPot
);
```

#### Option B : Utiliser remainingAccounts
Passer tous les joueurs potentiels et laisser le contract choisir (plus complexe).

**Recommandation** : **Option A** - Calculer dans le backend (même logique que le contract).

---

### ⚠️ PROBLÈME #3 : Dépendances manquantes

#### Backend package.json
```json
// MANQUANT :
"@noble/hashes": "^1.3.3"  // Pour keccak256 dans seedService
```

#### Frontend package.json
```json
// MANQUANT :
"tailwindcss-animate": "^1.0.7"  // Pour animations Tailwind
```

---

### ⚠️ PROBLÈME #4 : Import BN dans backend

**Localisation** : `backend/src/services/raceOrchestrator.ts:2`

**Actuel** :
```typescript
import BN from 'bn.js';
```

**Problème** : `bn.js` n'est pas une dépendance directe.

**Solution** :
```typescript
import { BN } from '@coral-xyz/anchor';
```

✅ Anchor expose BN, pas besoin de dépendance séparée.

---

### ℹ️ PROBLÈME #5 : IDL vides

**Localisation** :
- `backend/src/idl/runner.json`
- `frontend/src/lib/solana/idl/runner.json`

**Actuel** : Fichiers vides avec juste la structure de base.

**Solution** : Après `anchor build`, copier l'IDL généré :
```bash
cp target/idl/runner.json backend/src/idl/
cp target/idl/runner.json frontend/src/lib/solana/idl/
```

---

## 📋 Checklist de Fixes Prioritaires

### 🔥 URGENT (avant premier test)
- [ ] **Fix #1** : Escrow PDA (retirer bump ou init)
- [ ] **Fix #2** : Calculer winner dans backend
- [ ] **Fix #3** : Ajouter dépendances manquantes
- [ ] **Fix #4** : Corriger import BN

### ⚡ IMPORTANT (avant deploy)
- [ ] **Fix #5** : Copier IDL après build
- [ ] Tester place_bet avec vrai wallet
- [ ] Tester resolve_race bout en bout
- [ ] Vérifier que slot hash est accessible

### 🎨 NICE TO HAVE
- [ ] Ajouter retry logic si tx échoue
- [ ] Meilleure gestion d'erreur frontend
- [ ] Toast notifications au lieu d'alerts

---

## 🔧 Solutions Détaillées

### Solution #1 : Escrow PDA (Option C - Simple)

**Fichier** : `programs/runner/src/instructions/place_bet.rs`

**Avant** :
```rust
#[account(
    mut,
    seeds = [ESCROW_SEED, race.race_id.to_le_bytes().as_ref()],
    bump,  // ❌ PROBLÈME : bump pas stocké
)]
/// CHECK: Escrow PDA for holding bets
pub escrow: AccountInfo<'info>,
```

**Après** :
```rust
#[account(
    mut,
    seeds = [ESCROW_SEED, race.race_id.to_le_bytes().as_ref()],
    bump  // ✅ OK : va calculer le bump à la volée
)]
/// CHECK: Escrow PDA for holding bets
pub escrow: SystemAccount<'info>,
```

**OU Encore plus simple** :
```rust
/// CHECK: Escrow PDA for holding bets
#[account(
    mut,
    seeds = [ESCROW_SEED, race.race_id.to_le_bytes().as_ref()],
    bump
)]
pub escrow: SystemAccount<'info>,
```

---

### Solution #2 : Winner Calculation

**Créer** : `backend/src/utils/winnerCalculation.ts`

```typescript
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { keccak_256 } from '@noble/hashes/sha3';

export function calculateWinner(
  serverSeed: Buffer,
  slotHash: Buffer,
  raceId: number,
  players: Array<{ pubkey: PublicKey; betAmount: BN }>,
  totalPot: BN
): PublicKey {
  // 1. Combine entropy sources (same as smart contract)
  const raceIdBuffer = Buffer.alloc(8);
  raceIdBuffer.writeBigUInt64LE(BigInt(raceId));
  
  const entropy = Buffer.concat([serverSeed, slotHash, raceIdBuffer]);
  
  // 2. Hash with keccak256
  const hash = keccak_256(entropy);
  
  // 3. Convert to u64
  const randomValue = new BN(Buffer.from(hash.slice(0, 8)), 'le');
  
  // 4. Weighted random selection
  const winnerTicket = randomValue.mod(totalPot);
  
  let cumulative = new BN(0);
  for (const player of players) {
    cumulative = cumulative.add(player.betAmount);
    if (cumulative.gt(winnerTicket)) {
      return player.pubkey;
    }
  }
  
  throw new Error('Winner calculation failed - should never happen');
}

// Helper pour récupérer slot hash
export async function getSlotHash(
  connection: Connection,
  targetSlot: number
): Promise<Buffer> {
  const SLOT_HASHES_SYSVAR = new PublicKey(
    'SysvarS1otHashes111111111111111111111111111'
  );
  
  const accountInfo = await connection.getAccountInfo(SLOT_HASHES_SYSVAR);
  if (!accountInfo) throw new Error('SlotHashes sysvar not found');
  
  const data = accountInfo.data;
  const numEntries = Math.min((data.length - 8) / 40, 512);
  
  for (let i = 0; i < numEntries; i++) {
    const offset = 8 + i * 40;
    const slot = data.readBigUInt64LE(offset);
    
    if (Number(slot) === targetSlot) {
      return data.slice(offset + 8, offset + 40);
    }
  }
  
  throw new Error(`Slot hash not found for slot ${targetSlot}`);
}
```

**Utiliser dans** : `backend/src/services/raceOrchestrator.ts`

```typescript
import { calculateWinner, getSlotHash } from '../utils/winnerCalculation';

// Dans resolveRace():
const slotHash = await getSlotHash(connection, raceData.resolution_slot);
const serverSeed = Buffer.from(raceData.server_seed, 'hex');

const winner = calculateWinner(
  serverSeed,
  slotHash,
  raceId,
  race.players,
  race.totalPot
);

// Utiliser `winner` au lieu de race.players[0]
```

---

### Solution #3 : Dépendances

**Backend** : `backend/package.json`
```json
{
  "dependencies": {
    // ... existing
    "@noble/hashes": "^1.3.3"
  }
}
```

**Frontend** : `frontend/package.json`
```json
{
  "dependencies": {
    // ... existing
    "tailwindcss-animate": "^1.0.7"
  }
}
```

---

### Solution #4 : Import BN

**Fichier** : `backend/src/services/raceOrchestrator.ts`

**Avant** :
```typescript
import BN from 'bn.js';
```

**Après** :
```typescript
import { BN } from '@coral-xyz/anchor';
```

---

## 📊 Résumé de l'Audit

| Catégorie | État | Notes |
|-----------|------|-------|
| **Architecture** | ✅ Excellente | Séparation claire, modules bien définis |
| **PDA Seeds** | ✅ Cohérents | Identiques Rust/TS |
| **Constants** | ✅ Cohérents | MIN/MAX bet alignés |
| **Smart Contract** | ⚠️ 1 fix | Escrow PDA (facile) |
| **Backend** | ⚠️ 2 fixes | Winner calc + imports |
| **Frontend** | ⚠️ 1 fix | Dépendance manquante |
| **Database** | ✅ Parfait | Schema bien structuré |
| **Real-time** | ✅ Configuré | Supabase ready |

### Score Global : 85/100 ⭐⭐⭐⭐

**Points forts** :
- Architecture propre et scalable
- Séparation des responsabilités
- Code typé (TypeScript + Rust)
- Documentation complète

**Points à améliorer** :
- 4 fixes critiques à appliquer
- Tests à ajouter
- Error handling à améliorer

---

## 🚀 Plan d'Action Immédiat

### Phase 1 : Fixes Critiques (1-2h)
1. ✅ Fix escrow PDA (5 min)
2. ✅ Créer winnerCalculation.ts (30 min)
3. ✅ Ajouter dépendances (5 min)
4. ✅ Corriger imports BN (2 min)

### Phase 2 : Test Initial (1h)
1. Compiler smart contract
2. Copier IDL
3. Déployer sur devnet
4. Init global state
5. Tester première course

### Phase 3 : Itération (variable)
- Fixer bugs découverts
- Améliorer UX
- Ajouter Phaser
- Deploy production

---

## ✅ Conclusion

**Le code est solide à 85%**. Les 4 problèmes identifiés sont facilement fixables en 1-2 heures.

L'architecture globale est **excellente** et prête pour la production après ces corrections.

**Prêt à fixer ?** On attaque ensemble ! 🔥

