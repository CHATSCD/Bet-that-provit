-- illProvIt Database Functions v1.0

-- ────────────────────────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_updated_at   BEFORE UPDATE ON users   FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER circles_updated_at BEFORE UPDATE ON circles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ────────────────────────────────────────────────────────────
-- NEW USER HANDLER (called from auth trigger)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || SUBSTRING(NEW.id::TEXT, 1, 8)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ────────────────────────────────────────────────────────────
-- ISSUE_STRIKE
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION issue_strike(
  p_circle_id UUID,
  p_user_id   UUID,
  p_reason    TEXT DEFAULT 'missed_proof',
  p_issued_by TEXT DEFAULT 'system'
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_member        circle_members%ROWTYPE;
  v_shield_active BOOLEAN;
  v_new_count     INT;
BEGIN
  -- Lock member row
  SELECT * INTO v_member FROM circle_members
  WHERE circle_id = p_circle_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Member not found');
  END IF;

  IF v_member.status = 'eliminated_spectator' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already eliminated');
  END IF;

  -- Check for active shield
  IF v_member.has_shield THEN
    UPDATE circle_members SET has_shield = FALSE
    WHERE circle_id = p_circle_id AND user_id = p_user_id;

    INSERT INTO notifications (user_id, type, title, body, circle_id)
    VALUES (p_user_id, 'shield_activated', 'Shield Activated', 'Your Strike Shield blocked the attack.', p_circle_id);

    RETURN jsonb_build_object('success', true, 'blocked', true, 'shield_used', true);
  END IF;

  -- Issue strike
  v_new_count := v_member.strike_count + 1;

  INSERT INTO strikes (circle_id, user_id, reason, issued_by)
  VALUES (p_circle_id, p_user_id, p_reason, p_issued_by);

  UPDATE circle_members
  SET strike_count = v_new_count,
      status = CASE WHEN v_new_count >= 3 THEN 'eliminated_spectator' ELSE 'active' END,
      eliminated_at = CASE WHEN v_new_count >= 3 THEN NOW() ELSE NULL END
  WHERE circle_id = p_circle_id AND user_id = p_user_id;

  -- Notify user
  INSERT INTO notifications (user_id, type, title, body, circle_id)
  VALUES (
    p_user_id, 'strike_received',
    'Strike ' || v_new_count || ' of 3',
    CASE WHEN v_new_count >= 3 THEN 'You have been eliminated. You can still spectate and use Strike Bombs.'
         ELSE 'One more and you''re in Death Row.' END,
    p_circle_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'blocked', false,
    'new_strike_count', v_new_count,
    'eliminated', v_new_count >= 3
  );
END;
$$;

-- ────────────────────────────────────────────────────────────
-- CALCULATE_PAYOUT
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION calculate_payout(p_circle_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_circle        circles%ROWTYPE;
  v_member_count  INT;
  v_gross_pot     NUMERIC(10,2);
  v_stripe_fee    NUMERIC(10,2);
  v_platform_fee  NUMERIC(10,2);
  v_winner_payout NUMERIC(10,2);
BEGIN
  SELECT * INTO v_circle FROM circles WHERE id = p_circle_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Circle not found');
  END IF;

  SELECT COUNT(*) INTO v_member_count FROM circle_members WHERE circle_id = p_circle_id;

  v_gross_pot    := v_member_count * v_circle.buy_in_amount;
  v_stripe_fee   := ROUND(v_gross_pot * 0.029 + 0.30, 2);
  v_platform_fee := ROUND(v_gross_pot * (v_circle.platform_fee_pct / 100), 2);
  v_winner_payout := v_gross_pot - v_stripe_fee - v_platform_fee;

  RETURN jsonb_build_object(
    'success', true,
    'member_count', v_member_count,
    'gross_pot', v_gross_pot,
    'stripe_fee', v_stripe_fee,
    'platform_fee', v_platform_fee,
    'winner_payout', v_winner_payout
  );
END;
$$;

-- ────────────────────────────────────────────────────────────
-- ADD_COINS
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION add_coins(
  p_user_id    UUID,
  p_amount     INT,
  p_type       TEXT,
  p_description TEXT DEFAULT NULL,
  p_circle_id  UUID DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_new_balance INT;
BEGIN
  UPDATE users SET coin_balance = coin_balance + p_amount WHERE id = p_user_id
  RETURNING coin_balance INTO v_new_balance;

  INSERT INTO coin_transactions (user_id, amount, type, description, circle_id)
  VALUES (p_user_id, p_amount, p_type, p_description, p_circle_id);

  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$$;

-- ────────────────────────────────────────────────────────────
-- SPEND_COINS
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION spend_coins(
  p_user_id    UUID,
  p_amount     INT,
  p_type       TEXT,
  p_description TEXT DEFAULT NULL,
  p_circle_id  UUID DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_current_balance INT;
  v_new_balance     INT;
BEGIN
  SELECT coin_balance INTO v_current_balance FROM users WHERE id = p_user_id FOR UPDATE;

  IF v_current_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient coins', 'balance', v_current_balance);
  END IF;

  UPDATE users SET coin_balance = coin_balance - p_amount WHERE id = p_user_id
  RETURNING coin_balance INTO v_new_balance;

  INSERT INTO coin_transactions (user_id, amount, type, description, circle_id)
  VALUES (p_user_id, -p_amount, p_type, p_description, p_circle_id);

  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$$;

-- ────────────────────────────────────────────────────────────
-- USE_STRIKE_SHIELD
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION use_strike_shield(p_user_id UUID, p_circle_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_spend JSONB;
BEGIN
  -- Check membership
  IF NOT EXISTS (SELECT 1 FROM circle_members WHERE circle_id = p_circle_id AND user_id = p_user_id AND status = 'active') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not an active member');
  END IF;

  IF EXISTS (SELECT 1 FROM circle_members WHERE circle_id = p_circle_id AND user_id = p_user_id AND has_shield = TRUE) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Shield already active');
  END IF;

  v_spend := spend_coins(p_user_id, 300, 'power_move', 'Strike Shield', p_circle_id);
  IF NOT (v_spend->>'success')::BOOLEAN THEN RETURN v_spend; END IF;

  UPDATE circle_members SET has_shield = TRUE WHERE circle_id = p_circle_id AND user_id = p_user_id;

  RETURN jsonb_build_object('success', true, 'message', 'Shield activated');
END;
$$;

-- ────────────────────────────────────────────────────────────
-- USE_STRIKE_BOMB
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION use_strike_bomb(
  p_user_id   UUID,
  p_circle_id UUID,
  p_target_id UUID
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_circle  circles%ROWTYPE;
  v_spend   JSONB;
  v_bomb_id UUID;
BEGIN
  SELECT * INTO v_circle FROM circles WHERE id = p_circle_id;

  -- Block if less than 24hrs remain
  IF v_circle.end_date - NOW() < INTERVAL '24 hours' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Strike Bomb disabled in the final 24 hours');
  END IF;

  IF p_user_id = p_target_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot bomb yourself');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM circle_members WHERE circle_id = p_circle_id AND user_id = p_target_id AND status = 'active') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Target not found or eliminated');
  END IF;

  v_spend := spend_coins(p_user_id, 500, 'power_move', 'Strike Bomb', p_circle_id);
  IF NOT (v_spend->>'success')::BOOLEAN THEN RETURN v_spend; END IF;

  INSERT INTO strike_bombs (circle_id, attacker_id, target_id)
  VALUES (p_circle_id, p_user_id, p_target_id)
  RETURNING id INTO v_bomb_id;

  -- Notify target
  INSERT INTO notifications (user_id, type, title, body, circle_id)
  VALUES (p_target_id, 'bomb_incoming', '💣 INCOMING BOMB', 'You have 2 hours to submit proof or take a strike!', p_circle_id);

  RETURN jsonb_build_object('success', true, 'bomb_id', v_bomb_id);
END;
$$;

-- ────────────────────────────────────────────────────────────
-- USE_STRIKE_BACK
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION use_strike_back(p_user_id UUID, p_circle_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_spend   JSONB;
  v_strikes INT;
BEGIN
  SELECT strike_count INTO v_strikes FROM circle_members
  WHERE circle_id = p_circle_id AND user_id = p_user_id;

  IF v_strikes = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'No strikes to remove');
  END IF;

  -- One use per challenge
  IF EXISTS (
    SELECT 1 FROM coin_transactions
    WHERE user_id = p_user_id AND circle_id = p_circle_id AND type = 'power_move'
    AND description = 'Strike Back'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Strike Back already used in this challenge');
  END IF;

  v_spend := spend_coins(p_user_id, 200, 'power_move', 'Strike Back', p_circle_id);
  IF NOT (v_spend->>'success')::BOOLEAN THEN RETURN v_spend; END IF;

  UPDATE circle_members
  SET strike_count = strike_count - 1
  WHERE circle_id = p_circle_id AND user_id = p_user_id;

  RETURN jsonb_build_object('success', true, 'new_strike_count', v_strikes - 1);
END;
$$;

-- ────────────────────────────────────────────────────────────
-- USE_PERSONAL_CHALLENGE
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION use_personal_challenge(
  p_user_id       UUID,
  p_circle_id     UUID,
  p_target_id     UUID,
  p_challenge_text TEXT
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_spend JSONB;
BEGIN
  IF p_user_id = p_target_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot challenge yourself');
  END IF;

  v_spend := spend_coins(p_user_id, 150, 'power_move', 'Personal Challenge', p_circle_id);
  IF NOT (v_spend->>'success')::BOOLEAN THEN RETURN v_spend; END IF;

  INSERT INTO personal_challenges (circle_id, challenger_id, target_id, challenge_text)
  VALUES (p_circle_id, p_user_id, p_target_id, p_challenge_text);

  INSERT INTO notifications (user_id, type, title, body, circle_id)
  VALUES (p_target_id, 'personal_challenge', '🎯 You''ve Been Challenged!', p_challenge_text, p_circle_id);

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ────────────────────────────────────────────────────────────
-- PROCESS_BULLSHIT_VOTE
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION process_bullshit_vote(p_proof_id UUID, p_voter_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_proof          proofs%ROWTYPE;
  v_active_members INT;
  v_vote_count     INT;
  v_threshold      INT;
BEGIN
  SELECT * INTO v_proof FROM proofs WHERE id = p_proof_id FOR UPDATE;

  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Proof not found'); END IF;
  IF v_proof.status = 'invalidated' THEN RETURN jsonb_build_object('success', false, 'error', 'Already invalidated'); END IF;
  IF v_proof.user_id = p_voter_id THEN RETURN jsonb_build_object('success', false, 'error', 'Cannot vote on own proof'); END IF;

  -- Insert vote (unique constraint handles dedup)
  INSERT INTO proof_votes (proof_id, user_id) VALUES (p_proof_id, p_voter_id)
  ON CONFLICT (proof_id, user_id) DO NOTHING;

  UPDATE proofs SET bullshit_votes_count = bullshit_votes_count + 1 WHERE id = p_proof_id
  RETURNING bullshit_votes_count INTO v_vote_count;

  -- Count active members in circle
  SELECT COUNT(*) INTO v_active_members FROM circle_members
  WHERE circle_id = v_proof.circle_id AND status = 'active';

  v_threshold := GREATEST(2, CEIL(v_active_members * 0.51));

  IF v_vote_count >= v_threshold THEN
    UPDATE proofs SET status = 'invalidated' WHERE id = p_proof_id;
    PERFORM issue_strike(v_proof.circle_id, v_proof.user_id, 'proof_invalidated', 'peer_vote');
    RETURN jsonb_build_object('success', true, 'invalidated', true, 'votes', v_vote_count);
  END IF;

  RETURN jsonb_build_object('success', true, 'invalidated', false, 'votes', v_vote_count, 'threshold', v_threshold);
END;
$$;

-- ────────────────────────────────────────────────────────────
-- RESOLVE_EXPIRED_BOMBS (called by cron)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION resolve_expired_bombs()
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_bomb   strike_bombs%ROWTYPE;
  v_count  INT := 0;
BEGIN
  FOR v_bomb IN
    SELECT * FROM strike_bombs WHERE status = 'active' AND detonates_at <= NOW()
  LOOP
    UPDATE strike_bombs SET status = 'detonated', resolved_at = NOW() WHERE id = v_bomb.id;
    PERFORM issue_strike(v_bomb.circle_id, v_bomb.target_id, 'bomb_detonated', v_bomb.attacker_id::TEXT);

    INSERT INTO notifications (user_id, type, title, body, circle_id)
    VALUES (v_bomb.attacker_id, 'bomb_detonated', '💣 BOMB DETONATED', 'Your target failed to prove it.', v_bomb.circle_id);

    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
$$;
