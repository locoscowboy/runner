use anchor_lang::prelude::*;
use sha3::{Digest, Keccak256};
use crate::constants::*;
use crate::errors::*;
use crate::state::*;
use crate::events::*;

#[derive(Accounts)]
pub struct ResolveRace<'info> {
    #[account(
        mut,
        seeds = [GLOBAL_STATE_SEED],
        bump = global_state.bump,
        has_one = authority,
        has_one = fee_wallet
    )]
    pub global_state: Account<'info, GlobalState>,
    
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
    /// CHECK: Escrow PDA holding race funds
    pub escrow: UncheckedAccount<'info>,
    
    /// CHECK: SlotHashes sysvar
    #[account(address = anchor_lang::solana_program::sysvar::slot_hashes::ID)]
    pub slot_hashes: AccountInfo<'info>,
    
    #[account(mut)]
    /// CHECK: Winner account (validated in logic)
    pub winner: AccountInfo<'info>,
    
    #[account(mut)]
    /// CHECK: Fee wallet from global state
    pub fee_wallet: AccountInfo<'info>,
    
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<ResolveRace>, server_seed: Vec<u8>) -> Result<()> {
    let race = &mut ctx.accounts.race;
    let global_state = &ctx.accounts.global_state;
    let clock = Clock::get()?;
    
    // Verify race state
    require!(
        race.state == RaceState::Running,
        RunnerError::InvalidRaceState
    );
    
    // Verify we have players
    require!(!race.players.is_empty(), RunnerError::NoPlayers);
    
    // Verify resolution slot reached
    require!(
        clock.slot >= race.resolution_slot,
        RunnerError::ResolutionSlotNotReached
    );
    
    // 1. Verify server seed matches committed hash
    let mut hasher = Keccak256::new();
    hasher.update(&server_seed);
    let computed_hash: [u8; 32] = hasher.finalize().into();
    require!(
        computed_hash == race.server_seed_hash,
        RunnerError::InvalidServerSeed
    );
    
    // 2. Get slot hash from resolution_slot
    let slot_hash = get_slot_hash(&ctx.accounts.slot_hashes, race.resolution_slot)?;
    
    // 3. Combine entropy sources
    let mut entropy_data = Vec::new();
    entropy_data.extend_from_slice(&server_seed);
    entropy_data.extend_from_slice(&slot_hash);
    entropy_data.extend_from_slice(&race.race_id.to_le_bytes());
    
    // 4. Generate final random value
    let mut hasher = Keccak256::new();
    hasher.update(&entropy_data);
    let final_hash: [u8; 32] = hasher.finalize().into();
    let random_value = u64::from_le_bytes(
        final_hash[0..8].try_into().unwrap()
    );
    
    // 5. Select winner using weighted random
    let winner_ticket = random_value % race.total_pot;
    let mut cumulative = 0u64;
    let mut winner_pubkey: Option<Pubkey> = None;
    
    for player in &race.players {
        cumulative = cumulative
            .checked_add(player.bet_amount)
            .ok_or(RunnerError::ArithmeticOverflow)?;
        
        if cumulative > winner_ticket {
            winner_pubkey = Some(player.pubkey);
            break;
        }
    }
    
    let winner_key = winner_pubkey.ok_or(RunnerError::WinnerNotFound)?;
    
    // Verify winner account matches
    require!(
        winner_key == ctx.accounts.winner.key(),
        RunnerError::WinnerNotFound
    );
    
    // 6. Calculate rake and prize
    let rake = race.total_pot
        .checked_mul(global_state.rake_bps as u64)
        .ok_or(RunnerError::ArithmeticOverflow)?
        .checked_div(BPS_DENOMINATOR)
        .ok_or(RunnerError::ArithmeticOverflow)?;
    
    let prize = race.total_pot
        .checked_sub(rake)
        .ok_or(RunnerError::ArithmeticOverflow)?;
    
    // 7. Transfer prize to winner
    **ctx.accounts.escrow.try_borrow_mut_lamports()? -= prize;
    **ctx.accounts.winner.try_borrow_mut_lamports()? += prize;
    
    // 8. Transfer rake to fee wallet
    **ctx.accounts.escrow.try_borrow_mut_lamports()? -= rake;
    **ctx.accounts.fee_wallet.try_borrow_mut_lamports()? += rake;
    
    // 9. Update race state
    race.state = RaceState::Finished;
    race.winner = Some(winner_key);
    race.prize = prize;
    race.random_seed = final_hash;
    race.resolved_at = clock.unix_timestamp;
    
    // 10. Update global stats
    let global_state_mut = &mut ctx.accounts.global_state;
    global_state_mut.total_races += 1;
    
    emit!(RaceResolved {
        race_id: race.race_id,
        winner: winner_key,
        prize,
        rake,
        random_seed: final_hash,
    });
    
    msg!(
        "Race {} resolved! Winner: {}, Prize: {} lamports",
        race.race_id,
        winner_key,
        prize
    );
    
    Ok(())
}

/// Helper function to get slot hash from SlotHashes sysvar
fn get_slot_hash(slot_hashes_account: &AccountInfo, target_slot: u64) -> Result<[u8; 32]> {
    let data = slot_hashes_account.try_borrow_data()?;
    
    // SlotHashes format: 8-byte header + array of (slot: u64, hash: [u8; 32])
    let num_entries = ((data.len() - 8) / 40).min(512);
    
    for i in 0..num_entries {
        let offset = 8 + (i * 40);
        let slot_bytes: [u8; 8] = data[offset..offset + 8]
            .try_into()
            .map_err(|_| RunnerError::SlotHashNotFound)?;
        let slot = u64::from_le_bytes(slot_bytes);
        
        if slot == target_slot {
            let hash: [u8; 32] = data[offset + 8..offset + 40]
                .try_into()
                .map_err(|_| RunnerError::SlotHashNotFound)?;
            return Ok(hash);
        }
    }
    
    Err(RunnerError::SlotHashNotFound.into())
}

