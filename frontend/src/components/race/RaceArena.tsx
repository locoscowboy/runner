'use client';

import type { Race } from '@/types';

interface Props {
  race: Race;
}

export function RaceArena({ race }: Props) {
  return (
    <div className="bg-card border border-border rounded-lg p-8 min-h-[400px] flex items-center justify-center">
      {/* Placeholder for Phaser game */}
      <div className="text-center space-y-4">
        <div className="text-4xl">🏁</div>
        <div className="text-xl font-bold">
          {race.state === 'betting' && 'Place your bets!'}
          {race.state === 'running' && 'Race in progress...'}
          {race.state === 'finished' && 'Race finished!'}
        </div>
        <div className="text-sm text-muted-foreground">
          Phaser animation will be here
        </div>
      </div>
    </div>
  );
}

