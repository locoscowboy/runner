use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum RaceState {
    Betting,
    Running,
    Finished,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Player {
    pub pubkey: Pubkey,
    pub bet_amount: u64,
}

#[account]
pub struct Race {
    /// Unique race identifier
    pub race_id: u64,
    
    /// Current state of the race
    pub state: RaceState,
    
    /// Hash of the server seed (committed before betting ends)
    pub server_seed_hash: [u8; 32],
    
    /// Solana slot number for resolution
    pub resolution_slot: u64,
    
    /// Betting deadline timestamp
    pub deadline: i64,
    
    /// Total pot in lamports
    pub total_pot: u64,
    
    /// List of players and their bets
    pub players: Vec<Player>,
    
    /// Winner's public key (after resolution)
    pub winner: Option<Pubkey>,
    
    /// Prize amount paid to winner
    pub prize: u64,
    
    /// Final random seed (for verification)
    pub random_seed: [u8; 32],
    
    /// Creation timestamp
    pub created_at: i64,
    
    /// Resolution timestamp
    pub resolved_at: i64,
    
    /// Bump seed for PDA
    pub bump: u8,
}

impl Race {
    /// Calculate space needed (dynamic based on players)
    pub fn space(max_players: usize) -> usize {
        8 + // discriminator
        8 + // race_id
        1 + // state (enum)
        32 + // server_seed_hash
        8 + // resolution_slot
        8 + // deadline
        8 + // total_pot
        4 + (max_players * (32 + 8)) + // players vec (pubkey + amount)
        1 + 32 + // winner (Option<Pubkey>)
        8 + // prize
        32 + // random_seed
        8 + // created_at
        8 + // resolved_at
        1 // bump
    }
}

impl Default for RaceState {
    fn default() -> Self {
        RaceState::Betting
    }
}

