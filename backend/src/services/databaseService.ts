import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

export interface Race {
  id: number;
  race_id: number;
  state: 'betting' | 'running' | 'finished';
  server_seed: string;
  server_seed_hash: string;
  resolution_slot: number;
  total_pot: number;
  winner_pubkey?: string;
  prize?: number;
  rake?: number;
  random_seed?: string;
  betting_deadline: string;
  created_at: string;
  resolved_at?: string;
}

export class DatabaseService {
  /**
   * Get current active race (betting or running)
   */
  static async getCurrentRace(): Promise<Race | null> {
    const { data, error } = await supabase
      .from('races')
      .select('*')
      .in('state', ['betting', 'running'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error('Error fetching current race:', error);
      return null;
    }

    return data;
  }

  /**
   * Create a new race record
   */
  static async createRace(params: {
    raceId: number;
    serverSeed: string;
    serverSeedHash: string;
    resolutionSlot: number;
    bettingDeadline: Date;
  }): Promise<Race | null> {
    const { data, error } = await supabase
      .from('races')
      .insert({
        race_id: params.raceId,
        state: 'betting',
        server_seed: params.serverSeed,
        server_seed_hash: params.serverSeedHash,
        resolution_slot: params.resolutionSlot,
        betting_deadline: params.bettingDeadline.toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating race:', error);
      return null;
    }

    logger.info(`Race ${params.raceId} created in database`);
    return data;
  }

  /**
   * Update race state
   */
  static async updateRaceState(
    raceId: number,
    state: 'betting' | 'running' | 'finished'
  ): Promise<void> {
    const { error } = await supabase
      .from('races')
      .update({ state })
      .eq('race_id', raceId);

    if (error) {
      logger.error(`Error updating race ${raceId} state:`, error);
    }
  }

  /**
   * Update race with resolution data
   */
  static async resolveRace(params: {
    raceId: number;
    winnerPubkey: string;
    prize: number;
    rake: number;
    randomSeed: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('races')
      .update({
        state: 'finished',
        winner_pubkey: params.winnerPubkey,
        prize: params.prize,
        rake: params.rake,
        random_seed: params.randomSeed,
        resolved_at: new Date().toISOString(),
      })
      .eq('race_id', params.raceId);

    if (error) {
      logger.error(`Error resolving race ${params.raceId}:`, error);
    }
  }

  /**
   * Add bet to database
   */
  static async addBet(params: {
    raceId: number;
    playerPubkey: string;
    amount: number;
    txSignature: string;
  }): Promise<void> {
    const { error } = await supabase.from('bets').insert({
      race_id: params.raceId,
      player_pubkey: params.playerPubkey,
      amount: params.amount,
      tx_signature: params.txSignature,
    });

    if (error) {
      logger.error('Error adding bet:', error);
    }
  }

  /**
   * Update player stats
   */
  static async updatePlayerStats(
    pubkey: string,
    wagered: number = 0,
    won: number = 0,
    isWin: boolean = false
  ): Promise<void> {
    const { error } = await supabase.rpc('increment_player_stats', {
      p_pubkey: pubkey,
      p_wagered: wagered,
      p_won: won,
      p_is_win: isWin,
    });

    if (error) {
      logger.error('Error updating player stats:', error);
    }
  }
}

