-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'mitra');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Create profiles table for additional user info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
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

-- Create function to get user role
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

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own role"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert profiles"
ON public.profiles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update profiles"
ON public.profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Update tagihan RLS to ensure proper user isolation
DROP POLICY IF EXISTS "Users can view their own active tagihan" ON public.tagihan;
DROP POLICY IF EXISTS "Users can view their own deleted tagihan" ON public.tagihan;

CREATE POLICY "Users can view their own active tagihan"
ON public.tagihan FOR SELECT
USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can view their own deleted tagihan"
ON public.tagihan FOR SELECT
USING (auth.uid() = user_id AND deleted_at IS NOT NULL);

CREATE POLICY "Admins can view all tagihan"
ON public.tagihan FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Mitra can add tagihan but not delete
DROP POLICY IF EXISTS "Users can create their own tagihan" ON public.tagihan;
CREATE POLICY "Users can create their own tagihan"
ON public.tagihan FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Only admin can delete
DROP POLICY IF EXISTS "Users can delete their own tagihan" ON public.tagihan;
CREATE POLICY "Admins can delete tagihan"
ON public.tagihan FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Only admin can soft delete (update deleted_at)
DROP POLICY IF EXISTS "Users can update their own active tagihan" ON public.tagihan;
DROP POLICY IF EXISTS "Users can restore their own deleted tagihan" ON public.tagihan;

CREATE POLICY "Users can update their own active tagihan"
ON public.tagihan FOR UPDATE
USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Admins can update any tagihan"
ON public.tagihan FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Function to create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create profile if it doesn't exist (admin creates it manually)
  RETURN NEW;
END;
$$;