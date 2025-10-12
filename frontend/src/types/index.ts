export interface Race {
  id: number;
  race_id: number;
  state: 'betting' | 'running' | 'finished';
  server_seed_hash: string;
  resolution_slot: number;
  total_pot: number;
  winner_pubkey?: string;
  prize?: number;
  betting_deadline: string;
  created_at: string;
  resolved_at?: string;
}

export interface Bet {
  id: number;
  race_id: number;
  player_pubkey: string;
  amount: number;
  chance_percentage?: number;
  tx_signature: string;
  created_at: string;
}

export interface PlayerStats {
  pubkey: string;
  total_wagered: number;
  total_won: number;
  total_races: number;
  wins_count: number;
}

