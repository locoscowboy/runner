import { Router } from 'express';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/race/current
 * Get the currently active race
 */
router.get('/current', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('races')
      .select('*')
      .in('state', ['betting', 'running'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!data) {
      return res.json({ race: null });
    }

    // Get bets for this race
    const { data: bets } = await supabase
      .from('bets')
      .select('*')
      .eq('race_id', data.race_id)
      .order('created_at', { ascending: true });

    res.json({
      race: data,
      bets: bets || [],
    });
  } catch (error) {
    logger.error('Error fetching current race:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/race/history
 * Get race history
 */
router.get('/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const { data, error } = await supabase
      .from('races')
      .select('*')
      .eq('state', 'finished')
      .order('resolved_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.json({ races: data || [] });
  } catch (error) {
    logger.error('Error fetching race history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/race/:id
 * Get specific race by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const raceId = parseInt(req.params.id);

    const { data: race, error: raceError } = await supabase
      .from('races')
      .select('*')
      .eq('race_id', raceId)
      .single();

    if (raceError) throw raceError;

    const { data: bets } = await supabase
      .from('bets')
      .select('*')
      .eq('race_id', raceId)
      .order('created_at', { ascending: true });

    res.json({
      race,
      bets: bets || [],
    });
  } catch (error) {
    logger.error('Error fetching race:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

