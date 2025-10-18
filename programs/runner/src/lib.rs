use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("5DZS318TbttrDoKdVLeCE4dMcUjMjw9fkvUV2u1vKtRe");

#[program]
pub mod runner {
    use super::*;

    /// Initialize the global state (one-time setup)
    pub fn initialize_global_state(
        ctx: Context<InitializeGlobalState>,
        rake_bps: u16,
    ) -> Result<()> {
        instructions::initialize_global_state::handler(ctx, rake_bps)
    }

    /// Initialize a new race
    pub fn initialize_race(
        ctx: Context<InitializeRace>,
        server_seed_hash: [u8; 32],
        resolution_slot: u64,
    ) -> Result<()> {
        instructions::initialize_race::handler(ctx, server_seed_hash, resolution_slot)
    }

    /// Place a bet on the current race
    pub fn place_bet(ctx: Context<PlaceBet>, amount: u64) -> Result<()> {
        instructions::place_bet::handler(ctx, amount)
    }

    /// End the betting phase (called by authority)
    pub fn end_betting(ctx: Context<EndBetting>) -> Result<()> {
        instructions::end_betting::handler(ctx)
    }

    /// Resolve the race using slot hash + server seed
    pub fn resolve_race(ctx: Context<ResolveRace>, server_seed: Vec<u8>) -> Result<()> {
        instructions::resolve_race::handler(ctx, server_seed)
    }
}

