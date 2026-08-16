import type { Tables } from './supabase/types'

export type Profile = Tables<'profiles'>

export type UserMode = 'free' | 'real_money'
export type AgeStatus = 'unknown' | 'under_18' | '18_plus' | 'verified_18_plus'
export type KycStatus = 'none' | 'pending' | 'basic_approved' | 'full_approved' | 'rejected'

export function isMinor(profile: Pick<Profile, 'age_status'>): boolean {
  return profile.age_status === 'under_18'
}

export function isRealMoneyMode(profile: Pick<Profile, 'mode'>): boolean {
  return profile.mode === 'real_money'
}

export function isKycApproved(profile: Pick<Profile, 'kyc_status'>): boolean {
  return profile.kyc_status === 'full_approved'
}

/** Can join / create paid, Real-Money circles and see BetIt/ProvCoins wallet. */
export function canUseRealMoney(profile: Pick<Profile, 'mode' | 'kyc_status'>): boolean {
  return isRealMoneyMode(profile) && isKycApproved(profile)
}

/** Real Money mode selected but KYC not yet done — should be routed into the KYC flow. */
export function needsKyc(profile: Pick<Profile, 'mode' | 'kyc_status'>): boolean {
  return isRealMoneyMode(profile) && !isKycApproved(profile) && profile.kyc_status !== 'pending'
}

export function kycPending(profile: Pick<Profile, 'kyc_status'>): boolean {
  return profile.kyc_status === 'pending'
}
