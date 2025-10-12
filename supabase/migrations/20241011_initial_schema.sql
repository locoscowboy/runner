-- Runner Initial Schema
-- Created: 2024-10-11

-- Table: races
CREATE TABLE races (
  id BIGSERIAL PRIMARY KEY,
  race_id BIGINT UNIQUE NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('betting', 'running', 'finished')),
  server_seed TEXT NOT NULL,
  server_seed_hash TEXT NOT NULL,
  resolution_slot BIGINT NOT NULL,
  total_pot BIGINT DEFAULT 0,
  winner_pubkey TEXT,
  prize BIGINT,
  rake BIGINT,
  random_seed TEXT,
  betting_deadline TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Indexes for races
CREATE INDEX idx_races_race_id ON races(race_id);
CREATE INDEX idx_races_state ON races(state);
CREATE INDEX idx_races_created_at ON races(created_at DESC);

-- Table: bets
CREATE TABLE bets (
  id BIGSERIAL PRIMARY KEY,
  race_id BIGINT NOT NULL,
  player_pubkey TEXT NOT NULL,
  amount BIGINT NOT NULL,
  chance_percentage NUMERIC(5,2),
  ticket_start BIGINT,
  ticket_end BIGINT,
  tx_signature TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for bets
CREATE INDEX idx_bets_race_id ON bets(race_id);
CREATE INDEX idx_bets_player ON bets(player_pubkey);
CREATE INDEX idx_bets_created_at ON bets(created_at DESC);

-- Table: chat_messages
CREATE TABLE chat_messages (
  id BIGSERIAL PRIMARY KEY,
  user_pubkey TEXT NOT NULL,
  username TEXT,
  message TEXT NOT NULL CHECK (LENGTH(message) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for chat
CREATE INDEX idx_chat_created_at ON chat_messages(created_at DESC);

-- Table: player_stats
CREATE TABLE player_stats (
  pubkey TEXT PRIMARY KEY,
  total_wagered BIGINT DEFAULT 0,
  total_won BIGINT DEFAULT 0,
  total_races BIGINT DEFAULT 0,
  wins_count BIGINT DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to update player stats
CREATE OR REPLACE FUNCTION increment_player_stats(
  p_pubkey TEXT,
  p_wagered BIGINT DEFAULT 0,
  p_won BIGINT DEFAULT 0,
  p_is_win BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO player_stats (
    pubkey,
    total_wagered,
    total_won,
    total_races,
    wins_count,
    last_played_at,
    updated_at
  ) VALUES (
    p_pubkey,
    p_wagered,
    p_won,
    CASE WHEN p_wagered > 0 OR p_won > 0 THEN 1 ELSE 0 END,
    CASE WHEN p_is_win THEN 1 ELSE 0 END,
    NOW(),
    NOW()
  )
  ON CONFLICT (pubkey) DO UPDATE SET
    total_wagered = player_stats.total_wagered + p_wagered,
    total_won = player_stats.total_won + p_won,
    total_races = player_stats.total_races + CASE WHEN p_wagered > 0 OR p_won > 0 THEN 1 ELSE 0 END,
    wins_count = player_stats.wins_count + CASE WHEN p_is_win THEN 1 ELSE 0 END,
    last_played_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- View: recent_winners
CREATE VIEW recent_winners AS
SELECT 
  r.race_id,
  r.winner_pubkey,
  r.prize,
  r.total_pot,
  r.resolved_at,
  (SELECT COUNT(*) FROM bets WHERE bets.race_id = r.race_id) as players_count
FROM races r
WHERE r.state = 'finished' AND r.winner_pubkey IS NOT NULL
ORDER BY r.resolved_at DESC
LIMIT 10;

-- View: top_players
CREATE VIEW top_players AS
SELECT 
  pubkey,
  total_won,
  total_wagered,
  wins_count,
  total_races,
  CASE 
    WHEN total_wagered > 0 THEN ROUND((total_won::numeric / total_wagered) * 100, 2)
    ELSE 0
  END as roi_percentage
FROM player_stats
ORDER BY total_won DESC
LIMIT 10;

-- Enable Row Level Security
ALTER TABLE races ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

-- Policies (read-only for public, insert allowed for authenticated)
CREATE POLICY "Allow read access to all" ON races FOR SELECT USING (true);
CREATE POLICY "Allow read access to all" ON bets FOR SELECT USING (true);
CREATE POLICY "Allow read access to all" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Allow read access to all" ON player_stats FOR SELECT USING (true);

CREATE POLICY "Allow insert to authenticated" ON chat_messages 
  FOR INSERT WITH CHECK (true);

-- Note: Insert for races/bets will be done via service role from backend

