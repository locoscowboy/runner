'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { formatSol, formatPercent, formatTimeRemaining } from '@/lib/utils/format';
import type { Race, Bet } from '@/types';

interface Props {
  race: Race;
  bets: Bet[];
}

export function RaceStats({ race, bets }: Props) {
  const { publicKey } = useWallet();
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const deadline = new Date(race.betting_deadline).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((deadline - now) / 1000));
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [race]);

  // Calculate user's bet info
  const userBets = publicKey
    ? bets.filter((bet) => bet.player_pubkey === publicKey.toBase58())
    : [];
  const userTotalWager = userBets.reduce((sum, bet) => sum + bet.amount, 0);
  const userChance =
    race.total_pot > 0 ? (userTotalWager / race.total_pot) * 100 : 0;

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Jackpot Value */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="text-sm text-muted-foreground mb-1">Jackpot Value</div>
        <div className="text-2xl font-bold text-primary">
          {formatSol(race.total_pot)} SOL
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {bets.length} player{bets.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Your Wager */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="text-sm text-muted-foreground mb-1">Your Wager</div>
        <div className="text-2xl font-bold">
          {userTotalWager > 0 ? formatSol(userTotalWager) : '0.00'} SOL
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {userBets.length} bet{userBets.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Your Chance */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="text-sm text-muted-foreground mb-1">Your Chance</div>
        <div className="text-2xl font-bold text-green-400">
          {formatPercent(userChance)}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          to win {formatSol(race.total_pot * 0.985)} SOL
        </div>
      </div>

      {/* Time Remaining */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="text-sm text-muted-foreground mb-1">
          {race.state === 'betting' ? 'Time Remaining' : 'Status'}
        </div>
        {race.state === 'betting' ? (
          <>
            <div className="text-2xl font-bold font-mono">
              {formatTimeRemaining(timeRemaining)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Until race starts
            </div>
          </>
        ) : race.state === 'running' ? (
          <>
            <div className="text-2xl font-bold text-yellow-400">RUNNING</div>
            <div className="text-xs text-muted-foreground mt-1">
              Determining winner...
            </div>
          </>
        ) : (
          <>
            <div className="text-2xl font-bold text-green-400">FINISHED</div>
            <div className="text-xs text-muted-foreground mt-1">
              Waiting for next race
            </div>
          </>
        )}
      </div>
    </div>
  );
}

