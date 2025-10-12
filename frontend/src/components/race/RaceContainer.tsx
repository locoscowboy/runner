'use client';

import { useEffect, useState } from 'react';
import { RaceStats } from './RaceStats';
import { RaceArena } from './RaceArena';
import { BettingInput } from './BettingInput';
import { PlayersList } from './PlayersList';
import { supabase } from '@/lib/supabase/client';
import type { Race, Bet } from '@/types';

export function RaceContainer() {
  const [currentRace, setCurrentRace] = useState<Race | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentRace();
    subscribeToRaceUpdates();
  }, []);

  async function fetchCurrentRace() {
    try {
      const { data: race } = await supabase
        .from('races')
        .select('*')
        .in('state', ['betting', 'running'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (race) {
        setCurrentRace(race);
        
        // Fetch bets for this race
        const { data: raceBets } = await supabase
          .from('bets')
          .select('*')
          .eq('race_id', race.race_id)
          .order('created_at', { ascending: true });

        if (raceBets) setBets(raceBets);
      }
    } catch (error) {
      console.error('Error fetching race:', error);
    } finally {
      setLoading(false);
    }
  }

  function subscribeToRaceUpdates() {
    // Subscribe to races changes
    const raceSubscription = supabase
      .channel('races-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'races',
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setCurrentRace(payload.new as Race);
          }
        }
      )
      .subscribe();

    // Subscribe to bets changes
    const betsSubscription = supabase
      .channel('bets-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bets',
        },
        (payload) => {
          const newBet = payload.new as Bet;
          setBets((prev) => [...prev, newBet]);
        }
      )
      .subscribe();

    return () => {
      raceSubscription.unsubscribe();
      betsSubscription.unsubscribe();
    };
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">🏃</div>
          <div className="text-muted-foreground">Loading race...</div>
        </div>
      </div>
    );
  }

  if (!currentRace) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">⏳</div>
          <div className="text-muted-foreground">Waiting for next race...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <RaceStats race={currentRace} bets={bets} />
      <RaceArena race={currentRace} />
      {currentRace.state === 'betting' && (
        <BettingInput raceId={currentRace.race_id} />
      )}
      <PlayersList bets={bets} totalPot={currentRace.total_pot} />
    </div>
  );
}

