-- ============================================================
-- COMPLETE SCHEMA SQL for Invoice Digital
-- Project: Invoice Digital by Syakir Digital
-- Database: PostgreSQL (Supabase)
-- Description: One-click SQL to create all tables, functions,
-- triggers, RLS policies, indexes, and realtime config.
-- ============================================================

-- ============================================================
-- 1. CLEANUP (Optional - remove existing objects first)
-- ============================================================
-- Uncomment the block below if you need a fresh start.
-- WARNING: This will DELETE ALL DATA.
/*
DROP TABLE IF EXISTS public.notifikasi_user CASCADE;
DROP TABLE IF EXISTS public.push_subscriptions CASCADE;
DROP TABLE IF EXISTS public.pending_registrations CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.tagihan CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.profit_settings CASCADE;
DROP TABLE IF EXISTS public.deposit_date_settings CASCADE;

DROP FUNCTION IF EXISTS public.get_global_sisa_saldo() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.has_role(UUID, public.app_role) CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

DROP TYPE IF EXISTS public.app_role CASCADE;

-- Remove from realtime publication (ignore errors if publication doesn't exist)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.settings;
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.tagihan;
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.push_subscriptions;
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.deposit_date_settings;
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.notifikasi_user;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Realtime cleanup skipped: %', SQLERRM;
END $$;
*/

-- ============================================================
-- 2. ENUM TYPES
-- ============================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'mitra');

-- ============================================================
-- 3. HELPER FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 4. TABLES (dependency order: no FK refs first)
-- ============================================================

-- settings: stores user saldo awal
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  saldo_awal NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- tagihan: stores bills
CREATE TABLE public.tagihan (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  nama TEXT NOT NULL,
  jumlah NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'belum_lunas' CHECK (status IN ('belum_lunas', 'lunas')),
  nama_input text,
  nama_lunas text,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- user_roles: stores app roles per user
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- profiles: additional user info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  can_edit_data boolean NOT NULL DEFAULT true,
  can_delete_data boolean NOT NULL DEFAULT true,
  can_lunas_data boolean NOT NULL DEFAULT true,
  tanggal_setor text DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- pending_registrations: reseller registration requests
CREATE TABLE public.pending_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- push_subscriptions: web push subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- profit_settings: global profit amount
CREATE TABLE public.profit_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profit_amount NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- deposit_date_settings: global deposit date config
CREATE TABLE public.deposit_date_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deposit_date text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- notifikasi_user: user notifications
CREATE TABLE public.notifikasi_user (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_type TEXT NOT NULL DEFAULT 'all',
  target_user_id UUID NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. INDEXES
-- ============================================================
CREATE INDEX idx_tagihan_deleted_at ON public.tagihan(deleted_at) WHERE deleted_at IS NOT NULL;

-- ============================================================
-- 6. SECURITY DEFINER FUNCTIONS
-- ============================================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS public.app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1;
$$;

-- Initialize user settings when they first sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.settings (user_id, saldo_awal)
  VALUES (NEW.id, 0);
  RETURN NEW;
END;
$$;

-- Get global sisa saldo
CREATE OR REPLACE FUNCTION public.get_global_sisa_saldo()
RETURNS TABLE (
  total_saldo_induk numeric,
  total_tagihan_aktif numeric,
  total_bayar numeric,
  sisa_saldo_global numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_saldo_induk numeric;
  v_total_tagihan_aktif numeric;
  v_total_bayar numeric;
BEGIN
  SELECT COALESCE(SUM(s.saldo_awal), 0) INTO v_total_saldo_induk
  FROM settings s
  INNER JOIN user_roles ur ON s.user_id = ur.user_id
  WHERE ur.role = 'admin';

  SELECT COALESCE(SUM(jumlah), 0) INTO v_total_tagihan_aktif
  FROM tagihan
  WHERE status = 'belum_lunas' AND deleted_at IS NULL;

  SELECT COALESCE(SUM(jumlah), 0) INTO v_total_bayar
  FROM tagihan
  WHERE status = 'lunas' AND deleted_at IS NULL;

  RETURN QUERY SELECT
    v_total_saldo_induk,
    v_total_tagihan_aktif,
    v_total_bayar,
    v_total_saldo_induk - v_total_tagihan_aktif - v_total_bayar;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_global_sisa_saldo() TO authenticated;

-- ============================================================
-- 7. ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tagihan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profit_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposit_date_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifikasi_user ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 8. RLS POLICIES
-- ============================================================

-- settings policies
CREATE POLICY "Users can view their own settings"
  ON public.settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own settings"
  ON public.settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings"
  ON public.settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own settings"
  ON public.settings FOR DELETE USING (auth.uid() = user_id);

-- tagihan policies
CREATE POLICY "Users can view their own active tagihan"
  ON public.tagihan FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can view their own deleted tagihan"
  ON public.tagihan FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NOT NULL);
CREATE POLICY "Users can create their own tagihan"
  ON public.tagihan FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own active tagihan"
  ON public.tagihan FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Admins can view all tagihan"
  ON public.tagihan FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete tagihan"
  ON public.tagihan FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update any tagihan"
  ON public.tagihan FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- user_roles policies
CREATE POLICY "Users can view their own role"
  ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- pending_registrations policies
CREATE POLICY "Anyone can register"
  ON public.pending_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view pending registrations"
  ON public.pending_registrations FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update pending registrations"
  ON public.pending_registrations FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete pending registrations"
  ON public.pending_registrations FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- push_subscriptions policies
CREATE POLICY "Users can manage own subscriptions"
  ON public.push_subscriptions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all subscriptions"
  ON public.push_subscriptions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- profit_settings policies
CREATE POLICY "Admins can manage profit_settings"
  ON public.profit_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "All authenticated can read profit_settings"
  ON public.profit_settings FOR SELECT TO authenticated
  USING (true);

-- deposit_date_settings policies
CREATE POLICY "Admins can manage deposit date"
  ON public.deposit_date_settings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated users can view deposit date"
  ON public.deposit_date_settings FOR SELECT USING (auth.uid() IS NOT NULL);

-- notifikasi_user policies
CREATE POLICY "Admins can manage notifications"
  ON public.notifikasi_user FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view their notifications"
  ON public.notifikasi_user FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      target_type = 'all' OR target_user_id = auth.uid()
    )
  );
CREATE POLICY "Users can mark notifications as read"
  ON public.notifikasi_user FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND (
      target_type = 'all' OR target_user_id = auth.uid()
    )
  );

-- ============================================================
-- 9. TRIGGERS for updated_at
-- ============================================================
CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER tagihan_updated_at
  BEFORE UPDATE ON public.tagihan
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_pending_registrations_updated_at
  BEFORE UPDATE ON public.pending_registrations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_deposit_date_settings_updated_at
  BEFORE UPDATE ON public.deposit_date_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to auto-create settings for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 10. ENABLE REALTIME / REPLICA IDENTITY
-- ============================================================
ALTER TABLE public.settings REPLICA IDENTITY FULL;
ALTER TABLE public.tagihan REPLICA IDENTITY FULL;
ALTER TABLE public.push_subscriptions REPLICA IDENTITY FULL;
ALTER TABLE public.deposit_date_settings REPLICA IDENTITY FULL;
ALTER TABLE public.notifikasi_user REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tagihan;
ALTER PUBLICATION supabase_realtime ADD TABLE public.push_subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deposit_date_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifikasi_user;

-- ============================================================
-- 11. SEED INITIAL DATA
-- ============================================================
INSERT INTO public.profit_settings (profit_amount) VALUES (0);

-- ============================================================
-- DONE
-- ============================================================
