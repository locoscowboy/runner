import { getProgram } from '../config/solana';
import { DatabaseService } from '../services/databaseService';
import { logger } from '../utils/logger';

export function startProgramListener(): void {
  const program = getProgram();

  // Listen to BetPlaced events
  program.addEventListener('BetPlaced', async (event, slot) => {
    logger.info('🎲 BetPlaced event received', {
      raceId: event.raceId.toString(),
      player: event.player.toString(),
      amount: event.amount.toString(),
      totalPot: event.totalPot.toString(),
      slot,
    });

    try {
      // Add bet to database
      await DatabaseService.addBet({
        raceId: event.raceId.toNumber(),
        playerPubkey: event.player.toString(),
        amount: event.amount.toNumber(),
        txSignature: 'pending', // We don't have signature in event
      });

      // Update player stats
      await DatabaseService.updatePlayerStats(
        event.player.toString(),
        event.amount.toNumber(),
        0,
        false
      );
    } catch (error) {
      logger.error('Error processing BetPlaced event:', error);
    }
  });

  // Listen to BettingEnded events
  program.addEventListener('BettingEnded', async (event, slot) => {
    logger.info('🏁 BettingEnded event received', {
      raceId: event.raceId.toString(),
      totalPot: event.totalPot.toString(),
      playersCount: event.playersCount.toString(),
      slot,
    });
  });

  // Listen to RaceResolved events
  program.addEventListener('RaceResolved', async (event, slot) => {
    logger.info('🎉 RaceResolved event received', {
      raceId: event.raceId.toString(),
      winner: event.winner.toString(),
      prize: event.prize.toString(),
      rake: event.rake.toString(),
      slot,
    });

    try {
      // Update race in database
      await DatabaseService.resolveRace({
        raceId: event.raceId.toNumber(),
        winnerPubkey: event.winner.toString(),
        prize: event.prize.toNumber(),
        rake: event.rake.toNumber(),
        randomSeed: Buffer.from(event.randomSeed).toString('hex'),
      });

      // Update winner stats
      await DatabaseService.updatePlayerStats(
        event.winner.toString(),
        0,
        event.prize.toNumber(),
        true
      );
    } catch (error) {
      logger.error('Error processing RaceResolved event:', error);
    }
  });

  logger.info('✅ Program listener started');
}

