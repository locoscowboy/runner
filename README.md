# 🏃 Runner - Web3 Jackpot Game on Solana

Un mini-jeu Web3 inspiré de SolPot.com et Flip.gg - Courses automatiques avec jackpot toutes les ~2 minutes.

## 🎯 Concept

Runner est une plateforme de courses automatiques sur Solana :
- **Phase Betting (60s)** : Les joueurs misent en SOL, chances proportionnelles au montant
- **Phase Running** : Tirage provably fair (Server Seed + Future Slot Hash)
- **Phase Waiting (15s)** : Pause avant la prochaine course

Winner takes all - Rake de 1.5%

## 🏗️ Stack Technique

- **Frontend**: Next.js 14 + TypeScript + Tailwind + Phaser 3
- **Smart Contract**: Anchor (Rust) sur Solana
- **Backend**: Node.js/Bun + Supabase (PostgreSQL + Real-time)
- **Wallets**: Phantom, Backpack via wallet-adapter

## 📁 Structure du Projet

```
runner/
├── frontend/          # Next.js app
├── backend/           # Orchestrateur Node.js
├── programs/          # Anchor smart contracts
└── supabase/          # Database schema & migrations
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Rust + Solana CLI + Anchor 0.29+
- Supabase account

### Installation

```bash
# Install all dependencies
npm install

# Setup frontend
cd frontend && npm install

# Setup backend
cd backend && npm install

# Build smart contract
cd programs && anchor build
```

### Development

```bash
# Start Supabase locally (optional)
npx supabase start

# Start backend orchestrator
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev
```

## 🎮 Roadmap MVP

- [x] Architecture et stack
- [ ] Smart contract (Anchor)
- [ ] Supabase schema
- [ ] Backend orchestrator
- [ ] Frontend UI/UX
- [ ] Phaser animation
- [ ] Tests & Deploy devnet

## 📄 License

MIT

## 🤝 Contributing

Built with ❤️ for the Solana ecosystem

