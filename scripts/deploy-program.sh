#!/bin/bash

echo "🚀 Deploying Runner program to Solana devnet..."

cd programs

# Build the program
echo "📦 Building program..."
anchor build

# Deploy to devnet
echo "🌐 Deploying to devnet..."
anchor deploy --provider.cluster devnet

# Get program ID
PROGRAM_ID=$(solana address -k target/deploy/runner-keypair.json)
echo "✅ Program deployed!"
echo "📝 Program ID: $PROGRAM_ID"

echo ""
echo "⚠️  Update these files with the new Program ID:"
echo "  - Anchor.toml"
echo "  - backend/.env (PROGRAM_ID)"
echo "  - frontend/.env.local (NEXT_PUBLIC_PROGRAM_ID)"
echo "  - programs/runner/src/lib.rs (declare_id!)"

cd ..

