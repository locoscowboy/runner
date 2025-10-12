use anchor_lang::prelude::*;

#[error_code]
pub enum RunnerError {
    #[msg("The race is not in the correct state for this operation")]
    InvalidRaceState,

    #[msg("Betting deadline has not been reached yet")]
    BettingNotEnded,

    #[msg("Betting deadline has already passed")]
    BettingEnded,

    #[msg("Bet amount is below the minimum")]
    BetTooLow,

    #[msg("Bet amount exceeds the maximum")]
    BetTooHigh,

    #[msg("Maximum number of players reached")]
    MaxPlayersReached,

    #[msg("Resolution slot has not been reached yet")]
    ResolutionSlotNotReached,

    #[msg("Server seed does not match the committed hash")]
    InvalidServerSeed,

    #[msg("Slot hash not found in SlotHashes sysvar")]
    SlotHashNotFound,

    #[msg("No players in the race")]
    NoPlayers,

    #[msg("Winner not found (should never happen)")]
    WinnerNotFound,

    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,

    #[msg("Invalid authority")]
    InvalidAuthority,
}

