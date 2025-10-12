use anchor_lang::prelude::*;
use crate::constants::*;
use crate::state::*;
use crate::events::*;

#[derive(Accounts)]
pub struct InitializeRace<'info> {
    #[account(
        mut,
        seeds = [GLOBAL_STATE_SEED],
        bump = global_state.bump,
        has_one = authority
    )]
    pub global_state: Account<'info, GlobalState>,
    
    #[account(
        init,
        payer = authority,
        space = Race::space(MAX_PLAYERS_PER_RACE),
        seeds = [
            RACE_SEED,
            global_state.current_race_id.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub race: Account<'info, Race>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitializeRace>,
    server_seed_hash: [u8; 32],
    resolution_slot: u64,
) -> Result<()> {
    let global_state = &mut ctx.accounts.global_state;
    let race = &mut ctx.accounts.race;
    let clock = Clock::get()?;
    
    race.race_id = global_state.current_race_id;
    race.state = RaceState::Betting;
    race.server_seed_hash = server_seed_hash;
    race.resolution_slot = resolution_slot;
    race.deadline = clock.unix_timestamp + 60; // 60 seconds betting phase
    race.total_pot = 0;
    race.players = Vec::new();
    race.winner = None;
    race.prize = 0;
    race.random_seed = [0; 32];
    race.created_at = clock.unix_timestamp;
    race.resolved_at = 0;
    race.bump = ctx.bumps.race;
    
    // Increment race counter
    global_state.current_race_id += 1;
    
    emit!(RaceInitialized {
        race_id: race.race_id,
        server_seed_hash,
        resolution_slot,
        deadline: race.deadline,
    });
    
    msg!("Race {} initialized", race.race_id);
    
    Ok(())
}

