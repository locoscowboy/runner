# Frontend Environment Variables

Create a `.env.local` file in the `frontend/` directory with the following variables:

```bash
# Solana Configuration
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# Program Configuration
NEXT_PUBLIC_PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS

# Supabase Configuration (Public keys only)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Optional: Analytics, etc.
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## How to get these values:

1. **NEXT_PUBLIC_PROGRAM_ID**: Same as the deployed program ID (will be generated after `anchor deploy`)

2. **NEXT_PUBLIC_SUPABASE_URL** and **NEXT_PUBLIC_SUPABASE_ANON_KEY**: 
   - Same Supabase project as backend
   - Go to Settings > API
   - Copy the URL and **anon** key (NOT the service role key)

3. **NEXT_PUBLIC_BACKEND_URL**: 
   - Local dev: `http://localhost:3001`
   - Production: Your deployed backend URL (e.g., Railway, Render)

## Important Notes:

- All variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Never put sensitive keys (private keys, service role keys) in frontend .env
- The `.env.local` file is gitignored and should never be committed

