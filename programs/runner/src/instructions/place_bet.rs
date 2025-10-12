use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::constants::*;
use crate::errors::*;
use crate::state::*;
use crate::events::*;

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(
        mut,
        seeds = [RACE_SEED, race.race_id.to_le_bytes().as_ref()],
        bump = race.bump,
    )]
    pub race: Account<'info, Race>,
    
    #[account(
        mut,
        seeds = [ESCROW_SEED, race.race_id.to_le_bytes().as_ref()],
        bump,
    )]
    /// CHECK: Escrow PDA for holding bets
    pub escrow: AccountInfo<'info>,
    
    #[account(mut)]
    pub player: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<PlaceBet>, amount: u64) -> Result<()> {
    let race = &mut ctx.accounts.race;
    let clock = Clock::get()?;
    
    // Verify race state
    require!(
        race.state == RaceState::Betting,
        RunnerError::InvalidRaceState
    );
    
    // Verify deadline not passed
    require!(
        clock.unix_timestamp < race.deadline,
        RunnerError::BettingEnded
    );
    
    // Verify bet amount
    require!(amount >= MIN_BET_AMOUNT, RunnerError::BetTooLow);
    require!(amount <= MAX_BET_AMOUNT, RunnerError::BetTooHigh);
    
    // Verify max players not reached
    require!(
        race.players.len() < MAX_PLAYERS_PER_RACE,
        RunnerError::MaxPlayersReached
    );
    
    // Transfer SOL to escrow
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.player.to_account_info(),
                to: ctx.accounts.escrow.to_account_info(),
            },
        ),
        amount,
    )?;
    
    // Add player to race
    race.players.push(Player {
        pubkey: ctx.accounts.player.key(),
        bet_amount: amount,
    });
    
    race.total_pot = race.total_pot
        .checked_add(amount)
        .ok_or(RunnerError::ArithmeticOverflow)?;
    
    emit!(BetPlaced {
        race_id: race.race_id,
        player: ctx.accounts.player.key(),
        amount,
        total_pot: race.total_pot,
    });
    
    msg!(
        "Player {} placed bet of {} lamports. Total pot: {}",
        ctx.accounts.player.key(),
        amount,
        race.total_pot
    );
    
    Ok(())
}

