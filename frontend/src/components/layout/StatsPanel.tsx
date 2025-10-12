'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { formatSol, shortenAddress } from '@/lib/utils/format';

export function StatsPanel() {
  const [recentWinners, setRecentWinners] = useState<any[]>([]);
  const [topPlayers, setTopPlayers] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    // Fetch recent winners
    const { data: winners } = await supabase
      .from('recent_winners')
      .select('*')
      .limit(10);

    // Fetch top players
    const { data: players } = await supabase
      .from('top_players')
      .select('*')
      .limit(10);

    if (winners) setRecentWinners(winners);
    if (players) setTopPlayers(players);
  }

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Recent Winners */}
      <div className="flex-1 border-b border-border p-4">
        <h2 className="font-semibold mb-4">🏆 Last Winners</h2>
        
        <div className="space-y-3">
          {recentWinners.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              No winners yet
            </div>
          ) : (
            recentWinners.map((winner, i) => (
              <div key={i} className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-primary font-mono">
                    {shortenAddress(winner.winner_pubkey)}
                  </span>
                  <span className="text-green-400 font-semibold">
                    +{formatSol(winner.prize)} SOL
                  </span>
                </div>
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>Race #{winner.race_id}</span>
                  <span>{winner.players_count} players</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Players */}
      <div className="flex-1 p-4">
        <h2 className="font-semibold mb-4">⭐ Top Players</h2>
        
        <div className="space-y-3">
          {topPlayers.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              No stats yet
            </div>
          ) : (
            topPlayers.map((player, i) => (
              <div key={i} className="text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">#{i + 1}</span>
                    <span className="font-mono">
                      {shortenAddress(player.pubkey)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {player.wins_count} wins
                  </span>
                  <span className="text-green-400 font-semibold">
                    {formatSol(player.total_won)} SOL
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

