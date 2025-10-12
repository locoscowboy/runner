# Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```bash
# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_WS_URL=wss://api.devnet.solana.com
SOLANA_NETWORK=devnet

# Program Configuration
PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS

# Authority Keypair (JSON array format)
# Generate with: solana-keygen new --outfile authority.json
# Then: cat authority.json
AUTHORITY_PRIVATE_KEY=[1,2,3,...] # Your keypair array here

# Fee Wallet (receives rake)
FEE_WALLET_PUBKEY=YourFeeWalletPublicKeyHere

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here

# Race Configuration
BETTING_DURATION_SECONDS=60
WAITING_DURATION_SECONDS=15
RESOLUTION_SLOT_OFFSET=50
RAKE_BPS=150

# Server
PORT=3001
```

## How to get these values:

1. **AUTHORITY_PRIVATE_KEY**: 
   ```bash
   solana-keygen new --outfile authority.json
   cat authority.json
   ```

2. **FEE_WALLET_PUBKEY**: Your Solana wallet address where rake fees will be sent

3. **SUPABASE_URL** and **SUPABASE_*_KEY**: 
   - Create a project at https://supabase.com
   - Go to Settings > API
   - Copy the URL and keys

