import { PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { connection } from './connection';
import IDL from './idl/runner.json';
import { Runner } from '@/types/runner';

export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID || 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'
);

export function useProgram() {
  const wallet = useAnchorWallet();

  if (!wallet) return null;

  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  return new Program(IDL as Runner, PROGRAM_ID, provider);
}

// PDA helpers
export const GLOBAL_STATE_SEED = 'global_state';
export const RACE_SEED = 'race';
export const ESCROW_SEED = 'escrow';

export function getGlobalStatePDA() {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_STATE_SEED)],
    PROGRAM_ID
  )[0];
}

export function getRacePDA(raceId: number) {
  const raceIdBuffer = Buffer.alloc(8);
  raceIdBuffer.writeBigUInt64LE(BigInt(raceId));
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from(RACE_SEED), raceIdBuffer],
    PROGRAM_ID
  )[0];
}

export function getEscrowPDA(raceId: number) {
  const raceIdBuffer = Buffer.alloc(8);
  raceIdBuffer.writeBigUInt64LE(BigInt(raceId));
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from(ESCROW_SEED), raceIdBuffer],
    PROGRAM_ID
  )[0];
}

