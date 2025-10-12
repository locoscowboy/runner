import { PublicKey, SystemProgram } from '@solana/web3.js';
import BN from 'bn.js';
import { getProgram, getAuthorityKeypair, getFeeWalletPubkey, connection } from '../config/solana';
import {
  BETTING_DURATION_SECONDS,
  RESOLUTION_SLOT_OFFSET,
  GLOBAL_STATE_SEED,
  RACE_SEED,
  ESCROW_SEED,
} from '../config/constants';
import { SeedService } from './seedService';
import { DatabaseService } from './databaseService';
import { logger } from '../utils/logger';

export class RaceOrchestrator {
  /**
   * Initialize a new race
   */
  static async initializeRace(): Promise<void> {
    try {
      const program = getProgram();
      const authority = getAuthorityKeypair();

      // Get global state to know current race ID
      const [globalStatePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(GLOBAL_STATE_SEED)],
        program.programId
      );

      const globalState = await program.account.globalState.fetch(globalStatePDA);
      const raceId = globalState.currentRaceId.toNumber();

      // Generate server seed
      const { seed, hash } = SeedService.generateSeedPair();

      // Calculate resolution slot
      const currentSlot = await connection.getSlot();
      const resolutionSlot = currentSlot + RESOLUTION_SLOT_OFFSET;

      // Calculate betting deadline
      const bettingDeadline = new Date(
        Date.now() + BETTING_DURATION_SECONDS * 1000
      );

      // Get race PDA
      const [racePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(RACE_SEED), new BN(raceId).toArrayLike(Buffer, 'le', 8)],
        program.programId
      );

      logger.info(`Initializing race ${raceId}...`);

      // Call smart contract
      const tx = await program.methods
        .initializeRace(Array.from(hash), new BN(resolutionSlot))
        .accounts({
          globalState: globalStatePDA,
          race: racePDA,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      logger.info(`Race ${raceId} initialized on-chain. TX: ${tx}`);

      // Save to database
      await DatabaseService.createRace({
        raceId,
        serverSeed: seed.toString('hex'),
        serverSeedHash: hash.toString('hex'),
        resolutionSlot,
        bettingDeadline,
      });

      logger.info(`✅ Race ${raceId} fully initialized and ready for bets`);
    } catch (error) {
      logger.error('Error initializing race:', error);
      throw error;
    }
  }

  /**
   * End betting phase for a race
   */
  static async endBetting(raceId: number): Promise<void> {
    try {
      const program = getProgram();
      const authority = getAuthorityKeypair();

      const [globalStatePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(GLOBAL_STATE_SEED)],
        program.programId
      );

      const [racePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(RACE_SEED), new BN(raceId).toArrayLike(Buffer, 'le', 8)],
        program.programId
      );

      logger.info(`Ending betting for race ${raceId}...`);

      const tx = await program.methods
        .endBetting()
        .accounts({
          globalState: globalStatePDA,
          race: racePDA,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      logger.info(`Betting ended for race ${raceId}. TX: ${tx}`);

      // Update database
      await DatabaseService.updateRaceState(raceId, 'running');

      logger.info(`✅ Race ${raceId} now in RUNNING state`);
    } catch (error) {
      logger.error(`Error ending betting for race ${raceId}:`, error);
      throw error;
    }
  }

  /**
   * Resolve a race (determine winner and payout)
   */
  static async resolveRace(raceId: number): Promise<void> {
    try {
      const program = getProgram();
      const authority = getAuthorityKeypair();
      const feeWallet = getFeeWalletPubkey();

      // Get race data from database
      const raceData = await DatabaseService.getCurrentRace();
      if (!raceData || raceData.race_id !== raceId) {
        throw new Error(`Race ${raceId} not found in database`);
      }

      // Wait for resolution slot to be available
      const currentSlot = await connection.getSlot();
      if (currentSlot < raceData.resolution_slot) {
        const slotsToWait = raceData.resolution_slot - currentSlot;
        const waitTime = slotsToWait * 400; // ~400ms per slot
        logger.info(`Waiting ${waitTime}ms for resolution slot...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }

      // Get PDAs
      const [globalStatePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(GLOBAL_STATE_SEED)],
        program.programId
      );

      const [racePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(RACE_SEED), new BN(raceId).toArrayLike(Buffer, 'le', 8)],
        program.programId
      );

      const [escrowPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(ESCROW_SEED), new BN(raceId).toArrayLike(Buffer, 'le', 8)],
        program.programId
      );

      // Fetch race to get winner (we need to calculate it first, or let contract do it)
      const race = await program.account.race.fetch(racePDA);
      
      // For now, we pass the first player as winner account
      // The contract will verify the actual winner
      const winnerPubkey = race.players[0]?.pubkey || authority.publicKey;

      // Reveal server seed
      const serverSeed = Buffer.from(raceData.server_seed, 'hex');

      logger.info(`Resolving race ${raceId}...`);

      // SlotHashes sysvar
      const SLOT_HASHES_SYSVAR = new PublicKey(
        'SysvarS1otHashes111111111111111111111111111'
      );

      const tx = await program.methods
        .resolveRace(Array.from(serverSeed))
        .accounts({
          globalState: globalStatePDA,
          race: racePDA,
          escrow: escrowPDA,
          slotHashes: SLOT_HASHES_SYSVAR,
          winner: winnerPubkey,
          feeWallet: feeWallet,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      logger.info(`Race ${raceId} resolved! TX: ${tx}`);
      logger.info(`✅ Winner determination and payout completed`);
    } catch (error) {
      logger.error(`Error resolving race ${raceId}:`, error);
      throw error;
    }
  }
}

