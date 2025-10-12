export const MIN_BET_LAMPORTS = parseInt(
  process.env.NEXT_PUBLIC_MIN_BET || '10000000'
);

export const MAX_BET_LAMPORTS = parseInt(
  process.env.NEXT_PUBLIC_MAX_BET || '5000000000'
);

export const BETTING_DURATION_SECONDS = 60;
export const WAITING_DURATION_SECONDS = 15;

