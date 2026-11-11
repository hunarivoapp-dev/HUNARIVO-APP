import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, SwapProposal, PaymentRecord, PlatformReceivingAccounts } from '../types';

const DEFAULT_SUPABASE_URL = 'https://zolaooounqskbhbtfatr.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvbGFvb291bnFza2JoYnRmYXRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQyMjE4MTAsImV4cCI6MjEwOTc5NzgxMH0.cpjYS20LnBgnCrKOVmS80tDvEzE37fsnf3Fv1vyAxGc';

export const getSupabaseConfig = (): { url: string; anonKey: string } => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('hunarivo_supabase_url') || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('hunarivo_supabase_anon_key') || '' : '';

  const url = (envUrl && !envUrl.includes('your-project-id') ? envUrl : localUrl || DEFAULT_SUPABASE_URL).trim();
  const anonKey = (envKey && !envKey.includes('your-anon-public-key') ? envKey : localKey || DEFAULT_SUPABASE_ANON_KEY).trim();

  return { url, anonKey };
};

export const isSupabaseConfigured = (): boolean => {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(
    url &&
    anonKey &&
    url.startsWith('https://') &&
    !url.includes('your-project-id')
  );
};

const initialConfig = getSupabaseConfig();

export let supabase: SupabaseClient = createClient(
  initialConfig.url,
  initialConfig.anonKey
);

export const getSupabaseClient = (): SupabaseClient => {
  const { url, anonKey } = getSupabaseConfig();
  if (url === initialConfig.url && anonKey === initialConfig.anonKey) {
    return supabase;
  }
  return createClient(url, anonKey);
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('hunarivo_supabase_url', url.trim());
    localStorage.setItem('hunarivo_supabase_anon_key', anonKey.trim());
    supabase = getSupabaseClient();
  }
};

export const clearSupabaseConfig = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('hunarivo_supabase_url');
    localStorage.removeItem('hunarivo_supabase_anon_key');
    supabase = getSupabaseClient();
  }
};

export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase URL and Anon Key are not yet provided. Please enter them below or in chat.',
    };
  }
  try {
    const { data: _data, error } = await client.from('profiles').select('id').limit(1);
    if (error) {
      if (error.message.includes('relation "profiles" does not exist') || error.code === '42P01') {
        return {
          success: false,
          message: 'Connected to Supabase, but the "profiles" table was not found. Please run the schema SQL in your Supabase SQL Editor.',
        };
      }
      return { success: false, message: `Supabase returned: ${error.message}` };
    }
    return { success: true, message: 'Successfully connected to your Supabase PostgreSQL database!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection test failed.' };
  }
};

// ================= SUPABASE DATA SYNC HELPERS =================

/**
 * Fetch all community user profiles from Supabase
 */
export const fetchProfilesFromSupabase = async (): Promise<UserProfile[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('profiles')
      .select('*, skills_offered(*), skills_wanted(*)');

    if (error) {
      console.warn('Error fetching profiles from Supabase:', error.message);
      return null;
    }

    if (!data) return null;

    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      username: item.username,
      email: item.email,
      phone: item.phone,
      city: item.city,
      headline: item.headline || '',
      bio: item.bio || '',
      avatarUrl: item.avatar_url || '',
      intent: item.intent || 'swap',
      isRegFeePaid: Boolean(item.is_reg_fee_paid),
      isPremiumPass: Boolean(item.is_premium_pass),
      passPaymentStatus: item.pass_payment_status || 'none',
      isSuspended: Boolean(item.is_suspended),
      rating: Number(item.rating) || 5.0,
      reviewsCount: Number(item.reviews_count) || 0,
      completedSwapsCount: Number(item.completed_swaps_count) || 0,
      walletBalancePKR: Number(item.wallet_balance_pkr) || 0,
      joinedDate: item.joined_date || 'Recently',
      weeklyHours: Number(item.weekly_hours) || 4,
      preferredFormats: item.preferred_formats || ['video'],
      skillsOffered: (item.skills_offered || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        proficiency: s.proficiency,
        yearsExperience: Number(s.years_experience) || 1,
        description: s.description || '',
        sessionRatePKR: s.session_rate_pkr ? Number(s.session_rate_pkr) : undefined,
      })),
      skillsWanted: (item.skills_wanted || []).map((w: any) => ({
        id: w.id,
        name: w.name,
        category: w.category,
        currentLevel: w.current_level,
        targetLevel: w.target_level,
        priority: w.priority,
        motivation: w.motivation || '',
      })),
    }));
  } catch (err) {
    console.warn('Supabase fetchProfiles error:', err);
    return null;
  }
};

/**
 * Upsert a user profile and their skills to Supabase
 */
export const syncProfileToSupabase = async (user: UserProfile): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error: profileError } = await client.from('profiles').upsert({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      city: user.city,
      headline: user.headline,
      bio: user.bio,
      avatar_url: user.avatarUrl,
      intent: user.intent,
      is_reg_fee_paid: user.isRegFeePaid,
      is_premium_pass: user.isPremiumPass,
      pass_payment_status: user.passPaymentStatus || 'none',
      is_suspended: user.isSuspended || false,
      rating: user.rating,
      reviews_count: user.reviewsCount,
      completed_swaps_count: user.completedSwapsCount,
      wallet_balance_pkr: user.walletBalancePKR,
      weekly_hours: user.weeklyHours,
      preferred_formats: user.preferredFormats,
      joined_date: user.joinedDate,
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.warn('Error syncing profile to Supabase:', profileError.message);
      return false;
    }

    // Sync skills offered
    if (user.skillsOffered && user.skillsOffered.length > 0) {
      const offeredData = user.skillsOffered.map(s => ({
        id: s.id,
        user_id: user.id,
        name: s.name,
        category: s.category,
        proficiency: s.proficiency,
        years_experience: s.yearsExperience,
        description: s.description,
        session_rate_pkr: s.sessionRatePKR || null,
      }));
      await client.from('skills_offered').upsert(offeredData);
    }

    // Sync skills wanted
    if (user.skillsWanted && user.skillsWanted.length > 0) {
      const wantedData = user.skillsWanted.map(w => ({
        id: w.id,
        user_id: user.id,
        name: w.name,
        category: w.category,
        current_level: w.currentLevel,
        target_level: w.targetLevel,
        priority: w.priority,
        motivation: w.motivation || null,
      }));
      await client.from('skills_wanted').upsert(wantedData);
    }

    return true;
  } catch (err) {
    console.warn('Supabase syncProfile error:', err);
    return false;
  }
};

/**
 * Record a payment in Supabase
 */
export const syncPaymentToSupabase = async (payment: PaymentRecord, userId: string): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('payments').insert({
      id: payment.id,
      user_id: userId,
      type: payment.type,
      amount_pkr: payment.amountPKR,
      method: payment.method,
      account_identifier: payment.accountIdentifier,
      reference_id: payment.referenceId,
      status: payment.status,
      receipt_note: payment.receiptNote || null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Error syncing payment to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase syncPayment error:', err);
    return false;
  }
};

/**
 * Record a proposal in Supabase
 */
export const syncProposalToSupabase = async (proposal: SwapProposal): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('proposals').upsert({
      id: proposal.id,
      sender_id: proposal.senderId,
      sender_name: proposal.senderName,
      sender_avatar: proposal.senderAvatar,
      sender_headline: proposal.senderHeadline,
      receiver_id: proposal.receiverId,
      receiver_name: proposal.receiverName,
      receiver_avatar: proposal.receiverAvatar,
      offered_skill: proposal.offeredSkill,
      offered_proficiency: proposal.offeredProficiency,
      requested_skill: proposal.requestedSkill,
      requested_proficiency: proposal.requestedProficiency,
      proposed_sessions: proposal.proposedSessions,
      session_duration_minutes: proposal.sessionDurationMinutes,
      status: proposal.status,
      message: proposal.message,
      scheduled_time: proposal.scheduledTime || null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Error syncing proposal to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase syncProposal error:', err);
    return false;
  }
};

/**
 * Save receiving accounts config to Supabase
 */
export const syncReceivingAccountsToSupabase = async (accounts: PlatformReceivingAccounts): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('platform_accounts').upsert({
      id: 'default',
      easypaisa_number: accounts.easypaisaNumber,
      easypaisa_title: accounts.easypaisaTitle,
      jazzcash_number: accounts.jazzcashNumber,
      jazzcash_title: accounts.jazzcashTitle,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Error syncing platform accounts to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase syncReceivingAccounts error:', err);
    return false;
  }
};
