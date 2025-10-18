import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import dotenv from 'dotenv';
import { Runner } from '../types/runner';
import IDL from '../idl/runner.json';
import { PROGRAM_ID } from './constants';

// Load environment variables
dotenv.config();

// Initialize connection
export const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  {
    commitment: 'confirmed',
    wsEndpoint: process.env.SOLANA_WS_URL,
  }
);

// Load authority keypair from env
export function getAuthorityKeypair(): Keypair {
  const privateKeyString = process.env.AUTHORITY_PRIVATE_KEY;
  if (!privateKeyString) {
    throw new Error('AUTHORITY_PRIVATE_KEY not set in environment');
  }
  
  const privateKeyArray = JSON.parse(privateKeyString);
  return Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
}

// Get fee wallet pubkey
export function getFeeWalletPubkey(): PublicKey {
  const pubkeyString = process.env.FEE_WALLET_PUBKEY;
  if (!pubkeyString) {
    throw new Error('FEE_WALLET_PUBKEY not set in environment');
  }
  return new PublicKey(pubkeyString);
}

// Initialize Anchor provider and program
export function getProgram(): Program<Runner> {
  const authorityKeypair = getAuthorityKeypair();
  const wallet = new Wallet(authorityKeypair);
  
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });
  
  return new Program<Runner>(IDL as Runner, provider);
}

