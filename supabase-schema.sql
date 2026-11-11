-- =========================================================================
-- HUNARIVO — Supabase Database Migration & Schema
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- =========================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT,
    email TEXT,
    phone TEXT,
    city TEXT,
    headline TEXT,
    bio TEXT,
    avatar_url TEXT,
    intent TEXT DEFAULT 'swap',
    is_reg_fee_paid BOOLEAN DEFAULT false,
    is_premium_pass BOOLEAN DEFAULT false,
    pass_payment_status TEXT DEFAULT 'none',
    is_suspended BOOLEAN DEFAULT false,
    rating NUMERIC DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 0,
    completed_swaps_count INTEGER DEFAULT 0,
    wallet_balance_pkr INTEGER DEFAULT 0,
    weekly_hours INTEGER DEFAULT 4,
    preferred_formats TEXT[] DEFAULT ARRAY['video'],
    joined_date TEXT DEFAULT 'Recently',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Skills Offered Table
CREATE TABLE IF NOT EXISTS public.skills_offered (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    proficiency TEXT,
    years_experience INTEGER DEFAULT 1,
    description TEXT,
    session_rate_pkr INTEGER
);

-- 3. Skills Wanted Table
CREATE TABLE IF NOT EXISTS public.skills_wanted (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    current_level TEXT,
    target_level TEXT,
    priority TEXT,
    motivation TEXT
);

-- 4. Swap Proposals Table
CREATE TABLE IF NOT EXISTS public.proposals (
    id TEXT PRIMARY KEY,
    sender_id TEXT,
    sender_name TEXT,
    sender_avatar TEXT,
    sender_headline TEXT,
    receiver_id TEXT,
    receiver_name TEXT,
    receiver_avatar TEXT,
    offered_skill TEXT,
    offered_proficiency TEXT,
    requested_skill TEXT,
    requested_proficiency TEXT,
    proposed_sessions INTEGER DEFAULT 1,
    session_duration_minutes INTEGER DEFAULT 45,
    status TEXT DEFAULT 'pending',
    message TEXT,
    scheduled_time TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Payments Table (PKR 200 Reg Fee, PKR 300 Premium Pass, Micro-earnings)
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    type TEXT NOT NULL,
    amount_pkr INTEGER NOT NULL,
    method TEXT NOT NULL,
    account_identifier TEXT,
    reference_id TEXT,
    status TEXT DEFAULT 'completed',
    receipt_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Platform Receiving Accounts (Option A Easypaisa & JazzCash)
CREATE TABLE IF NOT EXISTS public.platform_accounts (
    id TEXT PRIMARY KEY DEFAULT 'default',
    easypaisa_number TEXT DEFAULT '03451234567',
    easypaisa_title TEXT DEFAULT 'HUNARIVO Community',
    jazzcash_number TEXT DEFAULT '03007654321',
    jazzcash_title TEXT DEFAULT 'HUNARIVO Platform',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ================= ROW LEVEL SECURITY (RLS) =================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills_offered ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills_wanted ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_accounts ENABLE ROW LEVEL SECURITY;

-- Allow public read and write access for web app with Supabase anon key
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public profiles upsert" ON public.profiles;
CREATE POLICY "Public profiles upsert" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public skills_offered read" ON public.skills_offered;
CREATE POLICY "Public skills_offered read" ON public.skills_offered FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public skills_offered all" ON public.skills_offered;
CREATE POLICY "Public skills_offered all" ON public.skills_offered FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public skills_wanted read" ON public.skills_wanted;
CREATE POLICY "Public skills_wanted read" ON public.skills_wanted FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public skills_wanted all" ON public.skills_wanted;
CREATE POLICY "Public skills_wanted all" ON public.skills_wanted FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public proposals all" ON public.proposals;
CREATE POLICY "Public proposals all" ON public.proposals FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public payments all" ON public.payments;
CREATE POLICY "Public payments all" ON public.payments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public platform_accounts all" ON public.platform_accounts;
CREATE POLICY "Public platform_accounts all" ON public.platform_accounts FOR ALL USING (true) WITH CHECK (true);

-- Insert default platform accounts
INSERT INTO public.platform_accounts (id, easypaisa_number, easypaisa_title, jazzcash_number, jazzcash_title)
VALUES ('default', '03451234567', 'HUNARIVO Community', '03007654321', 'HUNARIVO Platform')
ON CONFLICT (id) DO NOTHING;
