/// Seed for global state PDA
pub const GLOBAL_STATE_SEED: &[u8] = b"global_state";

/// Seed for race PDA
pub const RACE_SEED: &[u8] = b"race";

/// Seed for escrow PDA
pub const ESCROW_SEED: &[u8] = b"escrow";

/// Maximum number of players per race (to limit account size)
pub const MAX_PLAYERS_PER_RACE: usize = 100;

/// Minimum bet amount (0.01 SOL = 10_000_000 lamports)
pub const MIN_BET_AMOUNT: u64 = 10_000_000;

/// Maximum bet amount (5 SOL = 5_000_000_000 lamports)
pub const MAX_BET_AMOUNT: u64 = 5_000_000_000;

/// Default rake in basis points (150 = 1.5%)
pub const DEFAULT_RAKE_BPS: u16 = 150;

/// Basis points denominator (10000 = 100%)
pub const BPS_DENOMINATOR: u64 = 10_000;

