import { Header } from '@/components/layout/Header';
import { ChatPanel } from '@/components/layout/ChatPanel';
import { StatsPanel } from '@/components/layout/StatsPanel';
import { RaceContainer } from '@/components/race/RaceContainer';

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Chat */}
        <div className="w-80 border-r border-border">
          <ChatPanel />
        </div>

        {/* Center - Race area */}
        <div className="flex-1 overflow-y-auto">
          <RaceContainer />
        </div>

        {/* Right sidebar - Stats */}
        <div className="w-80 border-l border-border">
          <StatsPanel />
        </div>
      </main>
    </div>
  );
}

