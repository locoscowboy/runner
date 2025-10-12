use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct GlobalState {
    /// Authority that can manage races
    pub authority: Pubkey,
    
    /// Wallet that receives rake fees
    pub fee_wallet: Pubkey,
    
    /// Rake percentage in basis points (150 = 1.5%)
    pub rake_bps: u16,
    
    /// Current race ID counter
    pub current_race_id: u64,
    
    /// Total number of races completed
    pub total_races: u64,
    
    /// Bump seed for PDA
    pub bump: u8,
}

impl GlobalState {
    /// Size in bytes for account allocation
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        32 + // fee_wallet
        2 +  // rake_bps
        8 +  // current_race_id
        8 +  // total_races
        1;   // bump
}

