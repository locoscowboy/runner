import express from 'express';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { startScheduler } from './cron/scheduler';
import { startProgramListener } from './listeners/programListener';
import raceRoutes from './api/race.routes';
import statsRoutes from './api/stats.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Routes
app.use('/api/race', raceRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, async () => {
  logger.info(`🚀 Runner Backend listening on port ${PORT}`);
  logger.info(`📡 Network: ${process.env.SOLANA_NETWORK}`);
  logger.info(`🎮 Program ID: ${process.env.PROGRAM_ID}`);
  
  // Start race scheduler
  logger.info('⏰ Starting race scheduler...');
  startScheduler();
  
  // Start listening to program events
  logger.info('👂 Starting program listener...');
  startProgramListener();
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  process.exit(0);
});

