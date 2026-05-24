-- illProvIt Database Schema v1.0
-- Run this in Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ────────────────────────────────────────────────────────────
-- ENUMS
-- ────────────────────────────────────────────────────────────
CREATE TYPE circle_status AS ENUM ('pending', 'active', 'completed', 'canceled');
CREATE TYPE member_status AS ENUM ('active', 'eliminated_spectator');
CREATE TYPE proof_status AS ENUM ('pending', 'verified', 'invalidated');
CREATE TYPE bomb_status  AS ENUM ('active', 'defused', 'detonated', 'blocked');
CREATE TYPE tx_type AS ENUM (
  'buy_in', 'admin_fee', 'payout', 'refund', 'coin_purchase',
  'power_move_spend', 'platform_fee', 'stripe_fee'
);
CREATE TYPE notification_type AS ENUM (
  'strike_received', 'bomb_incoming', 'bomb_detonated', 'bomb_defused',
  'shield_activated', 'personal_challenge', 'proof_invalidated',
  'circle_started', 'circle_ended', 'winner_announced', 'new_member'
);
CREATE TYPE power_move_key AS ENUM (
  'strike_back', 'personal_challenge', 'strike_shield',
  'spy_mode', 'double_points', 'strike_bomb', 'crown_flex'
);

-- ────────────────────────────────────────────────────────────
-- USERS
-- ────────────────────────────────────────────────────────────
CREATE TABLE users (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username            TEXT UNIQUE NOT NULL,
  display_name        TEXT,
  avatar_url          TEXT,
  stripe_customer_id  TEXT UNIQUE,
  stripe_account_id   TEXT UNIQUE,
  coin_balance        INT NOT NULL DEFAULT 0 CHECK (coin_balance >= 0),
  win_streak          INT NOT NULL DEFAULT 0,
  total_wins          INT NOT NULL DEFAULT 0,
  total_earned        NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_18_verified      BOOLEAN NOT NULL DEFAULT FALSE,
  date_of_birth       DATE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- BADGES
-- ────────────────────────────────────────────────────────────
CREATE TABLE badges (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  icon        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#00FF88'
);

INSERT INTO badges (key, name, description, icon, color) VALUES
  ('first_blood',    'First Blood',     'Win your first circle',                '🩸', '#FF003C'),
  ('locked_in',      'Locked In',       'Complete a circle without a strike',   '🔒', '#00FF88'),
  ('undefeated',     'Undefeated',      '3 consecutive circle wins',            '👑', '#FFD700'),
  ('big_pot_energy', 'Big Pot Energy',  'Win a pot over $100',                  '💰', '#00FF88'),
  ('bomb_squad',     'Bomb Squad',      'Deploy 10 strike bombs',               '💣', '#FF003C'),
  ('ghost',          'Ghost',           'Use Spy Mode 5 times',                 '👁️', '#00CFFF'),
  ('shield_wall',    'Shield Wall',     'Block 3 bombs with shields',           '🛡️', '#00CFFF'),
  ('savage',         'Savage',          'Eliminate 5 players via strike bomb',  '⚡', '#FF003C'),
  ('flexer',         'Flexer',          'Use Crown Flex 10 times',              '👑', '#FFD700');

CREATE TABLE user_badges (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id   UUID NOT NULL REFERENCES badges(id),
  earned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- ────────────────────────────────────────────────────────────
-- CIRCLES
-- ────────────────────────────────────────────────────────────
CREATE TABLE circles (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id        UUID NOT NULL REFERENCES users(id),
  name              TEXT NOT NULL,
  challenge         TEXT NOT NULL,
  buy_in_amount     NUMERIC(10,2) NOT NULL CHECK (buy_in_amount >= 1),
  admin_fee         NUMERIC(10,2) NOT NULL DEFAULT 1.99,
  platform_fee_pct  NUMERIC(4,2) NOT NULL DEFAULT 10.00,
  invite_code       TEXT UNIQUE NOT NULL DEFAULT UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6)),
  is_public         BOOLEAN NOT NULL DEFAULT FALSE,
  status            circle_status NOT NULL DEFAULT 'pending',
  max_members       INT DEFAULT 50,
  start_date        TIMESTAMPTZ NOT NULL,
  end_date          TIMESTAMPTZ NOT NULL,
  pot_total         NUMERIC(10,2) NOT NULL DEFAULT 0,
  winner_id         UUID REFERENCES users(id),
  stripe_payment_intent_ids TEXT[] DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- ────────────────────────────────────────────────────────────
-- CIRCLE MEMBERS
-- ────────────────────────────────────────────────────────────
CREATE TABLE circle_members (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id         UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status            member_status NOT NULL DEFAULT 'active',
  strike_count      INT NOT NULL DEFAULT 0 CHECK (strike_count BETWEEN 0 AND 3),
  score             INT NOT NULL DEFAULT 0,
  rank              INT,
  has_shield        BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_payment_intent_id TEXT,
  paid_at           TIMESTAMPTZ,
  eliminated_at     TIMESTAMPTZ,
  joined_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(circle_id, user_id)
);

-- ────────────────────────────────────────────────────────────
-- PROOFS
-- ────────────────────────────────────────────────────────────
CREATE TABLE proofs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id           UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url           TEXT NOT NULL,
  watermark_text      TEXT NOT NULL,
  status              proof_status NOT NULL DEFAULT 'pending',
  points_awarded      INT NOT NULL DEFAULT 10,
  bullshit_votes_count INT NOT NULL DEFAULT 0,
  has_crown_flex      BOOLEAN NOT NULL DEFAULT FALSE,
  has_double_points   BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE proof_votes (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proof_id  UUID NOT NULL REFERENCES proofs(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  voted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(proof_id, user_id)
);

-- ────────────────────────────────────────────────────────────
-- STRIKES
-- ────────────────────────────────────────────────────────────
CREATE TABLE strikes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id   UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason      TEXT NOT NULL DEFAULT 'missed_proof',
  issued_by   TEXT NOT NULL DEFAULT 'system',
  issued_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- POWER MOVES
-- ────────────────────────────────────────────────────────────
CREATE TABLE power_moves (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         power_move_key UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  icon        TEXT NOT NULL,
  coin_cost   INT NOT NULL CHECK (coin_cost > 0)
);

INSERT INTO power_moves (key, name, description, icon, coin_cost) VALUES
  ('strike_back',       'Strike Back',       'Remove 1 strike. Once per challenge.',          '⚡', 200),
  ('personal_challenge','Personal Challenge','Force a 24hr mini-challenge on a target.',      '🎯', 150),
  ('strike_shield',     'Strike Shield',     'Block the next incoming strike or bomb.',       '🛡️', 300),
  ('spy_mode',          'Spy Mode',          'See a competitor''s last submission timestamp.','👁️', 100),
  ('double_points',     'Double Points',     '2x proof points for 24 hours.',                '🔥', 250),
  ('strike_bomb',       'Strike Bomb',       'Target has 2hrs to prove it or take a strike.','💣', 500),
  ('crown_flex',        'Crown Flex',        'Neon crown on your proof post for 24hrs.',     '👑',  50);

CREATE TABLE active_power_moves (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id    UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  move_key     power_move_key NOT NULL,
  expires_at   TIMESTAMPTZ,
  used_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- STRIKE BOMBS
-- ────────────────────────────────────────────────────────────
CREATE TABLE strike_bombs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id     UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  attacker_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status        bomb_status NOT NULL DEFAULT 'active',
  detonates_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '2 hours'),
  resolved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- PERSONAL CHALLENGES
-- ────────────────────────────────────────────────────────────
CREATE TABLE personal_challenges (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id    UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  challenger_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_text TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  deadline_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- COIN PACKS
-- ────────────────────────────────────────────────────────────
CREATE TABLE coin_packs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  coins        INT NOT NULL,
  bonus_coins  INT NOT NULL DEFAULT 0,
  price_cents  INT NOT NULL,
  is_featured  BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO coin_packs (name, coins, bonus_coins, price_cents, is_featured) VALUES
  ('Starter',  100,    0, 99,   FALSE),
  ('Hustle',   300,    0, 249,  FALSE),
  ('Grinder',  700,   50, 499,  TRUE),
  ('Beast',   1500,  150, 999,  FALSE),
  ('Legend',  4000,  500, 2499, FALSE);

CREATE TABLE coin_transactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount      INT NOT NULL,
  type        TEXT NOT NULL,
  description TEXT,
  circle_id   UUID REFERENCES circles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- TRANSACTIONS (MONEY)
-- ────────────────────────────────────────────────────────────
CREATE TABLE transactions (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id            UUID REFERENCES circles(id),
  user_id              UUID REFERENCES users(id),
  type                 tx_type NOT NULL,
  amount               NUMERIC(10,2) NOT NULL,
  stripe_payment_id    TEXT,
  stripe_transfer_id   TEXT,
  description          TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ────────────────────────────────────────────────────────────
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  circle_id   UUID REFERENCES circles(id),
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- SPONSORS
-- ────────────────────────────────────────────────────────────
CREATE TABLE sponsors (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  logo_url     TEXT,
  contract_fee NUMERIC(10,2) NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sponsored_circles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id   UUID NOT NULL REFERENCES circles(id),
  sponsor_id  UUID NOT NULL REFERENCES sponsors(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- INDEXES
-- ────────────────────────────────────────────────────────────
CREATE INDEX idx_circle_members_circle ON circle_members(circle_id);
CREATE INDEX idx_circle_members_user   ON circle_members(user_id);
CREATE INDEX idx_proofs_circle         ON proofs(circle_id);
CREATE INDEX idx_proofs_user           ON proofs(user_id);
CREATE INDEX idx_proofs_submitted      ON proofs(submitted_at DESC);
CREATE INDEX idx_strikes_circle        ON strikes(circle_id);
CREATE INDEX idx_strikes_user          ON strikes(user_id);
CREATE INDEX idx_strike_bombs_target   ON strike_bombs(target_id, status);
CREATE INDEX idx_notifications_user    ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_coin_tx_user          ON coin_transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_circle   ON transactions(circle_id);

-- ────────────────────────────────────────────────────────────
-- VIEWS
-- ────────────────────────────────────────────────────────────
CREATE VIEW circle_leaderboard AS
SELECT
  cm.circle_id,
  cm.user_id,
  u.username,
  u.avatar_url,
  cm.score,
  cm.strike_count,
  cm.status,
  cm.has_shield,
  ROW_NUMBER() OVER (PARTITION BY cm.circle_id ORDER BY cm.score DESC, cm.strike_count ASC) AS rank
FROM circle_members cm
JOIN users u ON u.id = cm.user_id;

CREATE VIEW circle_pot_summary AS
SELECT
  c.id AS circle_id,
  c.name,
  c.buy_in_amount,
  c.pot_total,
  COUNT(cm.id) AS member_count,
  COUNT(cm.id) * c.buy_in_amount AS gross_pot,
  ROUND(COUNT(cm.id) * c.buy_in_amount * 0.1, 2) AS platform_fee,
  ROUND(COUNT(cm.id) * c.buy_in_amount * 0.029 + 0.30, 2) AS stripe_fee,
  ROUND(COUNT(cm.id) * c.buy_in_amount * 0.871 - 0.30, 2) AS estimated_winner_payout
FROM circles c
LEFT JOIN circle_members cm ON cm.circle_id = c.id AND cm.status = 'active'
GROUP BY c.id;

CREATE VIEW active_threats AS
SELECT
  sb.*,
  u_attacker.username AS attacker_username,
  u_target.username   AS target_username
FROM strike_bombs sb
JOIN users u_attacker ON u_attacker.id = sb.attacker_id
JOIN users u_target   ON u_target.id   = sb.target_id
WHERE sb.status = 'active' AND sb.detonates_at > NOW();

-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────
ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE circles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE proofs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE proof_votes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE strikes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_power_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE strike_bombs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_challenges ENABLE ROW LEVEL SECURITY;

-- Users: read own + public profiles
CREATE POLICY "users_select_own"   ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_select_public" ON users FOR SELECT USING (TRUE);
CREATE POLICY "users_update_own"   ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_own"   ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Circles: public can see public circles; members see their circles
CREATE POLICY "circles_select" ON circles FOR SELECT USING (
  is_public = TRUE OR id IN (
    SELECT circle_id FROM circle_members WHERE user_id = auth.uid()
  ) OR creator_id = auth.uid()
);
CREATE POLICY "circles_insert" ON circles FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "circles_update" ON circles FOR UPDATE USING (auth.uid() = creator_id);

-- Circle members: see members of circles you belong to
CREATE POLICY "circle_members_select" ON circle_members FOR SELECT USING (
  circle_id IN (SELECT circle_id FROM circle_members WHERE user_id = auth.uid())
);
CREATE POLICY "circle_members_insert" ON circle_members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Proofs: members of the circle can see proofs
CREATE POLICY "proofs_select" ON proofs FOR SELECT USING (
  circle_id IN (SELECT circle_id FROM circle_members WHERE user_id = auth.uid())
);
CREATE POLICY "proofs_insert" ON proofs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications: own only
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Coin transactions: own only
CREATE POLICY "coin_tx_select" ON coin_transactions FOR SELECT USING (auth.uid() = user_id);

-- Transactions: own only
CREATE POLICY "transactions_select" ON transactions FOR SELECT USING (auth.uid() = user_id);

-- Strike bombs: see bombs in circles you belong to
CREATE POLICY "bombs_select" ON strike_bombs FOR SELECT USING (
  circle_id IN (SELECT circle_id FROM circle_members WHERE user_id = auth.uid())
);

-- Proof votes: members only
CREATE POLICY "proof_votes_select" ON proof_votes FOR SELECT USING (
  proof_id IN (SELECT id FROM proofs WHERE circle_id IN (
    SELECT circle_id FROM circle_members WHERE user_id = auth.uid()
  ))
);
CREATE POLICY "proof_votes_insert" ON proof_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
