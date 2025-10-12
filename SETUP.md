# 🏃 Runner - Setup Guide

Guide complet pour démarrer le développement de Runner.

## 📋 Prérequis

### Logiciels requis
- **Node.js** 20+ ([télécharger](https://nodejs.org/))
- **Rust** + **Solana CLI** ([guide installation](https://docs.solana.com/cli/install-solana-cli-tools))
- **Anchor** 0.29+ ([guide installation](https://www.anchor-lang.com/docs/installation))
- **Supabase CLI** (optionnel pour local) ([guide installation](https://supabase.com/docs/guides/cli))

### Comptes requis
- **Supabase** : Créer un projet sur [supabase.com](https://supabase.com)
- **Helius** (optionnel) : RPC Solana amélioré sur [helius.dev](https://helius.dev)

---

## 🚀 Installation

### 1. Cloner et installer les dépendances

```bash
# Installer toutes les dépendances
npm install

# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install
```

### 2. Configuration Solana

```bash
# Configurer pour devnet
solana config set --url devnet

# Créer un wallet pour le backend (authority)
solana-keygen new --outfile backend-authority.json

# Airdrop SOL pour les tests
solana airdrop 2 backend-authority.json
```

### 3. Compiler et déployer le smart contract

```bash
# Se placer dans le dossier programs
cd programs

# Build le programme Anchor
anchor build

# Récupérer le Program ID
solana address -k target/deploy/runner-keypair.json

# Mettre à jour le Program ID dans :
# - Anchor.toml
# - programs/runner/src/lib.rs (declare_id!)

# Rebuild après mise à jour
anchor build

# Déployer sur devnet
anchor deploy --provider.cluster devnet
```

### 4. Configuration Supabase

```bash
# Se connecter à Supabase
npx supabase login

# Lier au projet (remplacer par votre project ref)
npx supabase link --project-ref your-project-ref

# Pousser les migrations
npx supabase db push
```

### 5. Variables d'environnement

#### Backend (`.env`)

```bash
cd backend
cp .env.example .env

# Éditer .env et remplir:
# - AUTHORITY_PRIVATE_KEY (contenu de backend-authority.json)
# - FEE_WALLET_PUBKEY
# - PROGRAM_ID
# - SUPABASE_URL
# - SUPABASE_SERVICE_KEY
```

#### Frontend (`.env.local`)

```bash
cd frontend
cp .env.local.example .env.local

# Éditer .env.local et remplir:
# - NEXT_PUBLIC_PROGRAM_ID
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 6. Initialiser le programme

```bash
# Depuis la racine du projet
cd backend
npm run build

# Initialiser le global state
npx tsx ../scripts/init-global-state.ts
```

---

## 🎮 Lancer l'application

### Terminal 1 : Backend

```bash
cd backend
npm run dev
```

Le backend devrait afficher :
- ✅ Server listening on port 3001
- ✅ Race scheduler started
- ✅ Program listener started

### Terminal 2 : Frontend

```bash
cd frontend
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

---

## 🧪 Tests

### Tester le smart contract

```bash
cd programs
anchor test
```

### Tester le backend

```bash
cd backend
npm run test
```

### Tester manuellement

1. Connecter un wallet (Phantom recommandé)
2. Assurer d'avoir du SOL devnet : `solana airdrop 1`
3. Placer un pari via l'interface
4. Observer les logs backend pour voir la course se dérouler

---

## 📁 Structure du projet

```
runner/
├── frontend/          # Next.js app
├── backend/           # Node.js orchestrator
├── programs/          # Anchor smart contract
├── supabase/          # Database migrations
└── scripts/           # Utility scripts
```

---

## 🐛 Dépannage

### Erreur "Program ID mismatch"
→ Vérifier que le Program ID est le même partout (Anchor.toml, .env, lib.rs)

### Erreur "Insufficient funds"
→ Airdrop SOL : `solana airdrop 2`

### Erreur Supabase connection
→ Vérifier les URLs et keys dans les .env

### Smart contract ne se déploie pas
→ Vérifier solana config : `solana config get`

---

## 📚 Ressources

- [Anchor Book](https://book.anchor-lang.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

---

## 🤝 Support

Besoin d'aide ? Ouvre une issue sur GitHub.

