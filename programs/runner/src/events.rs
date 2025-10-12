use anchor_lang::prelude::*;

#[event]
pub struct RaceInitialized {
    pub race_id: u64,
    pub server_seed_hash: [u8; 32],
    pub resolution_slot: u64,
    pub deadline: i64,
}

#[event]
pub struct BetPlaced {
    pub race_id: u64,
    pub player: Pubkey,
    pub amount: u64,
    pub total_pot: u64,
}

#[event]
pub struct BettingEnded {
    pub race_id: u64,
    pub total_pot: u64,
    pub players_count: u64,
}

#[event]
pub struct RaceResolved {
    pub race_id: u64,
    pub winner: Pubkey,
    pub prize: u64,
    pub rake: u64,
    pub random_seed: [u8; 32],
}

