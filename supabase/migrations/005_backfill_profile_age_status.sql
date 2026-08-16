-- Backfill profiles.age_status for users who onboarded before the profiles
-- table existed, so they aren't forced back through onboarding.
UPDATE public.profiles p
SET age_status = CASE WHEN u.is_18_verified THEN '18_plus' ELSE 'under_18' END,
    date_of_birth = u.date_of_birth,
    age_verified_at = now(),
    age_verification_method = 'legacy_backfill'
FROM public.users u
WHERE p.id = u.id AND p.age_status = 'unknown' AND u.date_of_birth IS NOT NULL;
