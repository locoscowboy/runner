use anchor_lang::prelude::*;
use crate::constants::*;
use crate::state::*;

#[derive(Accounts)]
pub struct InitializeGlobalState<'info> {
    #[account(
        init,
        payer = authority,
        space = GlobalState::LEN,
        seeds = [GLOBAL_STATE_SEED],
        bump
    )]
    pub global_state: Account<'info, GlobalState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// CHECK: Fee wallet can be any account
    pub fee_wallet: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeGlobalState>, rake_bps: u16) -> Result<()> {
    let global_state = &mut ctx.accounts.global_state;
    
    global_state.authority = ctx.accounts.authority.key();
    global_state.fee_wallet = ctx.accounts.fee_wallet.key();
    global_state.rake_bps = rake_bps;
    global_state.current_race_id = 1;
    global_state.total_races = 0;
    global_state.bump = ctx.bumps.global_state;
    
    msg!("Global state initialized with rake: {} bps", rake_bps);
    
    Ok(())
}

