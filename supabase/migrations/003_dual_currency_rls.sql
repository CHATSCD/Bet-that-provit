-- illProvIt Dual-Currency Frontend Enablement v1.0
-- Additive migration only. Fixes RLS gaps that block client-side access to
-- tables/columns already live in production (profiles, kyc_events,
-- redemption_requests, learndat_challenges, playthrough_ledger,
-- power_move_usage, user_power_moves), adds a profile-creation trigger,
-- and tags circles as Free (BetDat) vs Real Money (USD).

-- ────────────────────────────────────────────────────────────
-- PROFILES: missing SELECT + INSERT policies
-- (UPDATE policy "Users can update own safe fields" already exists)
-- ────────────────────────────────────────────────────────────
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ────────────────────────────────────────────────────────────
-- Auto-create a profiles row on signup (mirrors handle_new_user)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();

-- Backfill profiles for users that already exist
INSERT INTO public.profiles (id)
SELECT u.id FROM public.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- ────────────────────────────────────────────────────────────
-- KYC / REDEMPTION / PLAYTHROUGH / POWER MOVE ledgers: own-row SELECT
-- (all writes go through SECURITY DEFINER RPCs or server routes)
-- ────────────────────────────────────────────────────────────
CREATE POLICY "kyc_events_select_own" ON public.kyc_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "redemption_requests_select_own" ON public.redemption_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "playthrough_ledger_select_own" ON public.playthrough_ledger FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "power_move_usage_select_own" ON public.power_move_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_power_moves_select_own" ON public.user_power_moves FOR SELECT USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- LEARNDAT CHALLENGES: participants can see, challenger can create,
-- either participant can update status (accept/decline/cancel)
-- ────────────────────────────────────────────────────────────
CREATE POLICY "learndat_select_participant" ON public.learndat_challenges FOR SELECT USING (
  auth.uid() = challenger_id OR auth.uid() = opponent_id
);
CREATE POLICY "learndat_insert_challenger" ON public.learndat_challenges FOR INSERT WITH CHECK (
  auth.uid() = challenger_id
);
CREATE POLICY "learndat_update_participant" ON public.learndat_challenges FOR UPDATE USING (
  auth.uid() = challenger_id OR auth.uid() = opponent_id
);

-- ────────────────────────────────────────────────────────────
-- CIRCLES: tag Free (BetDat, no Stripe) vs Real Money (USD, Stripe)
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.circles
  ADD COLUMN currency TEXT NOT NULL DEFAULT 'usd' CHECK (currency IN ('usd', 'betdat'));
