import { Router } from 'express';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/stats/recent-winners
 * Get recent winners
 */
router.get('/recent-winners', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('recent_winners')
      .select('*')
      .limit(10);

    if (error) throw error;

    res.json({ winners: data || [] });
  } catch (error) {
    logger.error('Error fetching recent winners:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/stats/top-players
 * Get top players by total winnings
 */
router.get('/top-players', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('top_players')
      .select('*')
      .limit(10);

    if (error) throw error;

    res.json({ players: data || [] });
  } catch (error) {
    logger.error('Error fetching top players:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/stats/player/:pubkey
 * Get stats for a specific player
 */
router.get('/player/:pubkey', async (req, res) => {
  try {
    const { pubkey } = req.params;

    const { data, error } = await supabase
      .from('player_stats')
      .select('*')
      .eq('pubkey', pubkey)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.json({ stats: data || null });
  } catch (error) {
    logger.error('Error fetching player stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

