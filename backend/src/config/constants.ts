import { PublicKey } from '@solana/web3.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const PROGRAM_ID = new PublicKey(
  process.env.PROGRAM_ID || '5DZS318TbttrDoKdVLeCE4dMcUjMjw9fkvUV2u1vKtRe'
);

export const BETTING_DURATION_SECONDS = parseInt(
  process.env.BETTING_DURATION_SECONDS || '60'
);

export const WAITING_DURATION_SECONDS = parseInt(
  process.env.WAITING_DURATION_SECONDS || '15'
);

export const RESOLUTION_SLOT_OFFSET = parseInt(
  process.env.RESOLUTION_SLOT_OFFSET || '50'
);

export const RAKE_BPS = parseInt(process.env.RAKE_BPS || '150');

export const MIN_BET_LAMPORTS = 10_000_000; // 0.01 SOL
export const MAX_BET_LAMPORTS = 5_000_000_000; // 5 SOL

// PDA Seeds
export const GLOBAL_STATE_SEED = 'global_state';
export const RACE_SEED = 'race';
export const ESCROW_SEED = 'escrow';

