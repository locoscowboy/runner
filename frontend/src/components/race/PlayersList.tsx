'use client';

import { formatSol, shortenAddress, formatPercent } from '@/lib/utils/format';
import type { Bet } from '@/types';

interface Props {
  bets: Bet[];
  totalPot: number;
}

export function PlayersList({ bets, totalPot }: Props) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">
        Players ({bets.length})
      </h3>

      {bets.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No players yet. Be the first to join!
        </div>
      ) : (
        <div className="space-y-2">
          {bets.map((bet, i) => {
            const chance = totalPot > 0 ? (bet.amount / totalPot) * 100 : 0;
            
            return (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-md"
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground">#{i + 1}</div>
                  <div className="font-mono text-sm">
                    {shortenAddress(bet.player_pubkey)}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Bet: </span>
                    <span className="font-semibold">{formatSol(bet.amount)} SOL</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Chance: </span>
                    <span className="font-semibold text-green-400">
                      {formatPercent(chance)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

