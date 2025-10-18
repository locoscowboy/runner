import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import * as path from 'path';
import dotenv from 'dotenv';
import type { Runner } from '../backend/src/types/runner';
import IDL from '../backend/src/idl/runner.json';

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const PROGRAM_ID = new PublicKey(process.env.PROGRAM_ID!);
const RPC_URL = process.env.SOLANA_RPC_URL!;

async function main() {
  console.log('🔧 Initializing global state...\n');

  // Load authority keypair
  const authorityPrivateKey = JSON.parse(process.env.AUTHORITY_PRIVATE_KEY!);
  const authority = Keypair.fromSecretKey(Uint8Array.from(authorityPrivateKey));

  console.log('Authority:', authority.publicKey.toBase58());

  // Setup connection and provider
  const connection = new Connection(RPC_URL, 'confirmed');
  const wallet = new Wallet(authority);
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  const program = new Program<Runner>(IDL as Runner, provider);

  // Fee wallet (same as authority for now)
  const feeWallet = new PublicKey(process.env.FEE_WALLET_PUBKEY!);

  // Get global state PDA
  const [globalStatePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('global_state')],
    PROGRAM_ID
  );

  console.log('Global State PDA:', globalStatePDA.toBase58());
  console.log('Fee Wallet:', feeWallet.toBase58());

  try {
    // Check if already initialized
    const globalState = await program.account.globalState.fetch(globalStatePDA);
    console.log('\n⚠️  Global state already initialized!');
    console.log('Current race ID:', globalState.currentRaceId.toString());
    return;
  } catch (error) {
    // Not initialized yet, continue
  }

  // Initialize global state
  const rakeBps = 150; // 1.5%

  console.log(`\nInitializing with rake: ${rakeBps} bps (${rakeBps / 100}%)`);

  const tx = await program.methods
    .initializeGlobalState(rakeBps)
    .accounts({
      globalState: globalStatePDA,
      authority: authority.publicKey,
      feeWallet: feeWallet,
      systemProgram: SystemProgram.programId,
    })
    .signers([authority])
    .rpc();

  console.log('\n✅ Global state initialized!');
  console.log('Transaction:', tx);

  // Fetch and display
  const globalState = await program.account.globalState.fetch(globalStatePDA);
  console.log('\nGlobal State:');
  console.log('  Authority:', globalState.authority.toBase58());
  console.log('  Fee Wallet:', globalState.feeWallet.toBase58());
  console.log('  Rake BPS:', globalState.rakeBps);
  console.log('  Current Race ID:', globalState.currentRaceId.toString());
  console.log('  Total Races:', globalState.totalRaces.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

