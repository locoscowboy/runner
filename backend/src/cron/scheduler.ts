import cron from 'node-cron';
import { DatabaseService } from '../services/databaseService';
import { RaceOrchestrator } from '../services/raceOrchestrator';
import { logger } from '../utils/logger';
import { WAITING_DURATION_SECONDS } from '../config/constants';

let isProcessing = false;

/**
 * Main scheduler that checks race state every 3 seconds
 */
export function startScheduler(): void {
  // Run every 3 seconds
  cron.schedule('*/3 * * * * *', async () => {
    if (isProcessing) {
      return; // Skip if already processing
    }

    try {
      isProcessing = true;
      await checkAndProcessRace();
    } catch (error) {
      logger.error('Scheduler error:', error);
    } finally {
      isProcessing = false;
    }
  });

  logger.info('✅ Race scheduler started (checking every 3 seconds)');
}

/**
 * Check current race state and take appropriate action
 */
async function checkAndProcessRace(): Promise<void> {
  const currentRace = await DatabaseService.getCurrentRace();

  // No active race → create one
  if (!currentRace) {
    logger.info('No active race found. Creating new race...');
    await RaceOrchestrator.initializeRace();
    return;
  }

  const now = new Date();
  const deadline = new Date(currentRace.betting_deadline);

  // Race in BETTING state
  if (currentRace.state === 'betting') {
    if (now >= deadline) {
      logger.info(`Race ${currentRace.race_id} betting period ended`);
      await RaceOrchestrator.endBetting(currentRace.race_id);
      
      // Immediately schedule resolution
      setTimeout(async () => {
        await RaceOrchestrator.resolveRace(currentRace.race_id);
        
        // After resolution, wait WAITING_DURATION then create new race
        setTimeout(async () => {
          logger.info('Waiting period ended. Starting new race...');
          await RaceOrchestrator.initializeRace();
        }, WAITING_DURATION_SECONDS * 1000);
      }, 2000); // Small delay to ensure state change propagated
    }
  }

  // Race in RUNNING state - waiting for resolution
  // (resolution is triggered automatically after end_betting)
}

