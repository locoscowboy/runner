# 🚀 Runner - Prochaines étapes

Guide pour développer les parties restantes du MVP de manière gamifiée.

---

## 🎯 Mission 1 : Déployer et tester (PRIORITÉ MAXIMALE)

### Objectif
Avoir une version fonctionnelle sur devnet dans les 3-5 prochaines heures.

### Checklist

#### ⚙️ Setup initial (30 min)
- [ ] Installer toutes les dépendances (`npm install` à la racine)
- [ ] Configurer Solana CLI pour devnet
- [ ] Créer wallet authority backend
- [ ] Créer projet Supabase
- [ ] Copier et remplir les fichiers `.env`

#### 🔨 Build & Deploy Smart Contract (1h)
```bash
cd programs
anchor build
# Mettre à jour Program ID partout
anchor deploy --provider.cluster devnet
```

#### 🗄️ Setup Database (15 min)
```bash
# Pousser migrations Supabase
npx supabase db push

# Ou créer les tables manuellement via dashboard
```

#### 🎮 Initialiser le programme (15 min)
```bash
cd backend
npm run build
npx tsx ../scripts/init-global-state.ts
```

#### 🚀 Lancer l'app (5 min)
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

#### ✅ Test complet (30 min)
- [ ] Ouvrir http://localhost:3000
- [ ] Connecter wallet Phantom (devnet)
- [ ] Attendre qu'une course démarre
- [ ] Placer un pari
- [ ] Observer les logs backend
- [ ] Vérifier dans Supabase que tout est enregistré
- [ ] Attendre la fin de la course
- [ ] Vérifier que le gagnant reçoit le prize

### 🏆 Récompense
✅ **Achievement unlocked** : "First Race" 
→ Tu as un jeu qui fonctionne end-to-end !

---

## 🎨 Mission 2 : Intégrer Phaser (Expérience visuelle)

### Objectif
Ajouter une animation centrale engageante pour les courses.

### Approche simplifiée (4h)

#### 1. Créer le wrapper Phaser (1h)

```typescript
// frontend/src/components/animation/PhaserGame.tsx

'use client';

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import type { Race } from '@/types';

interface Props {
  race: Race;
  onComplete?: () => void;
}

export function PhaserGame({ race, onComplete }: Props) {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    // Configuration Phaser
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: 800,
      height: 400,
      backgroundColor: '#1a1a2e',
      scene: {
        create: createScene,
        update: updateScene,
      },
    };

    phaserGameRef.current = new Phaser.Game(config);

    return () => {
      phaserGameRef.current?.destroy(true);
    };
  }, [race]);

  function createScene(this: Phaser.Scene) {
    // Animation selon l'état
    if (race.state === 'betting') {
      // Texte "PLACE YOUR BETS"
      this.add.text(400, 200, 'PLACE YOUR BETS!', {
        fontSize: '32px',
        color: '#fff',
      }).setOrigin(0.5);
    } else if (race.state === 'running') {
      // Animation de tirage
      showRunningAnimation(this);
    } else {
      // Afficher gagnant
      showWinner(this);
    }
  }

  function updateScene(this: Phaser.Scene) {
    // Animations continues si nécessaire
  }

  function showRunningAnimation(scene: Phaser.Scene) {
    // Simple barre de progression qui se remplit
    const bar = scene.add.rectangle(100, 200, 0, 30, 0x00ff00);
    
    scene.tweens.add({
      targets: bar,
      width: 600,
      duration: 3000,
      ease: 'Power2',
      onComplete: () => {
        onComplete?.();
      },
    });
  }

  function showWinner(scene: Phaser.Scene) {
    if (!race.winner_pubkey) return;
    
    scene.add.text(400, 200, 'WINNER!', {
      fontSize: '48px',
      color: '#00ff00',
    }).setOrigin(0.5);
    
    // Afficher adresse gagnant
    const shortAddr = race.winner_pubkey.slice(0, 4) + '...' + race.winner_pubkey.slice(-4);
    scene.add.text(400, 260, shortAddr, {
      fontSize: '24px',
      color: '#fff',
    }).setOrigin(0.5);
  }

  return <div ref={gameRef} className="w-full h-full" />;
}
```

#### 2. Intégrer dans RaceArena (15 min)

```typescript
// frontend/src/components/race/RaceArena.tsx

'use client';

import { PhaserGame } from '@/components/animation/PhaserGame';
import type { Race } from '@/types';

interface Props {
  race: Race;
}

export function RaceArena({ race }: Props) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <PhaserGame race={race} />
    </div>
  );
}
```

#### 3. Améliorer progressivement (2h)
- [ ] Ajouter sprites (runners)
- [ ] Animation de course plus élaborée
- [ ] Particules pour le gagnant
- [ ] Sound effects (optionnel)

### 🏆 Récompense
✅ **Achievement unlocked** : "Visual Master"
→ Ton jeu a maintenant une identité visuelle !

---

## 🐛 Mission 3 : Fixer les bugs potentiels

### Bugs probables à vérifier

#### 1. Race resolution avec winner account
**Problème** : Actuellement, on passe le premier player comme winner, mais le contract calcule le vrai winner.

**Solution** :
- Soit : Calculer le winner côté backend avant d'appeler resolve_race
- Soit : Passer tous les players potentiels et laisser le contract choisir

#### 2. Gestion des cas limites
- [ ] Que se passe-t-il si aucun joueur ne parie ?
- [ ] Que se passe-t-il si un seul joueur parie ?
- [ ] Timeout si slot hash pas disponible ?

#### 3. UI/UX
- [ ] Feedback visuel pendant transactions
- [ ] Gestion erreurs wallet
- [ ] Messages d'erreur user-friendly

---

## 📊 Mission 4 : Monitoring & Analytics

### Setup Sentry (optionnel, 30 min)

```typescript
// frontend/src/app/layout.tsx
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Ajouter logging backend

```typescript
// backend/src/services/raceOrchestrator.ts

// Logger chaque étape importante
logger.info('Race initialized', {
  raceId,
  serverSeedHash,
  resolutionSlot,
});

logger.info('Race resolved', {
  raceId,
  winner,
  prize,
  totalPot,
});
```

---

## 🚀 Mission 5 : Déploiement Production

### Frontend (Vercel)

```bash
cd frontend
vercel --prod
```

### Backend (Railway)

```bash
cd backend
railway login
railway init
railway up
```

### Database (Supabase)
→ Déjà hosted, juste vérifier les variables d'env

---

## 🎯 Ordre recommandé d'exécution

### Phase 1 : Fonctionnel (Jour 1)
1. ✅ Setup & Deploy smart contract
2. ✅ Test course complète
3. ✅ Fixer bugs critiques

### Phase 2 : Polish (Jour 2)
4. ✅ Intégrer Phaser
5. ✅ Améliorer UI/UX
6. ✅ Ajouter monitoring

### Phase 3 : Launch (Jour 3)
7. ✅ Tests finaux
8. ✅ Deploy production
9. ✅ Marketing & feedback

---

## 💡 Tips pour avancer efficacement

### 🔥 Mode Focus
1. Désactive notifications
2. Travaille par blocs de 90 min
3. Teste après chaque feature
4. Commit régulièrement

### 🐛 Debugging
- Utilise les logs backend (Winston)
- Check Solana Explorer pour les transactions
- Supabase dashboard pour les données
- Console browser pour frontend

### 🚨 Si tu bloques
1. Lis les error messages complètement
2. Check la documentation Anchor/Solana
3. Vérifie les Program IDs
4. Confirme que le wallet a du SOL

---

## ✅ Definition of Done (MVP)

Le MVP est complet quand :
- [ ] Smart contract déployé sur devnet
- [ ] Backend orchestrator tourne 24/7
- [ ] Frontend accessible publiquement
- [ ] Course se déroule automatiquement
- [ ] Utilisateurs peuvent parier
- [ ] Gagnant reçoit le prize
- [ ] Stats affichées en temps réel
- [ ] Animation Phaser intégrée
- [ ] Zéro bug critique

---

## 🎉 Let's ship this!

Tu as tout ce qu'il faut pour finaliser Runner. 

**Prochaine action** : Lance `SETUP.md` et suis les étapes !

Besoin d'aide ? Je suis là pour t'accompagner à chaque étape. 🚀

