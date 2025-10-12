use anchor_lang::prelude::*;
use crate::constants::*;
use crate::errors::*;
use crate::state::*;
use crate::events::*;

#[derive(Accounts)]
pub struct EndBetting<'info> {
    #[account(
        seeds = [GLOBAL_STATE_SEED],
        bump = global_state.bump,
        has_one = authority
    )]
    pub global_state: Account<'info, GlobalState>,
    
    #[account(
        mut,
        seeds = [RACE_SEED, race.race_id.to_le_bytes().as_ref()],
        bump = race.bump,
    )]
    pub race: Account<'info, Race>,
    
    pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<EndBetting>) -> Result<()> {
    let race = &mut ctx.accounts.race;
    let clock = Clock::get()?;
    
    // Verify state
    require!(
        race.state == RaceState::Betting,
        RunnerError::InvalidRaceState
    );
    
    // Verify deadline passed
    require!(
        clock.unix_timestamp >= race.deadline,
        RunnerError::BettingNotEnded
    );
    
    // Change state to Running
    race.state = RaceState::Running;
    
    emit!(BettingEnded {
        race_id: race.race_id,
        total_pot: race.total_pot,
        players_count: race.players.len() as u64,
    });
    
    msg!(
        "Betting ended for race {}. Total pot: {} with {} players",
        race.race_id,
        race.total_pot,
        race.players.len()
    );
    
    Ok(())
}

