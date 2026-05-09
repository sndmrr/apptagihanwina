-- ============================================================
-- Create default admin account for Invoice Digital
-- Run this only on a clean project after schema deployment.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  SELECT id
  INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@syakirdigital.local'
  LIMIT 1;

  IF admin_user_id IS NULL THEN
    INSERT INTO auth.users (
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmation_sent_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@syakirdigital.local',
      crypt('Rijal1101*', gen_salt('bf')),
      now(),
      now(),
      now(),
      now()
    )
    RETURNING id INTO admin_user_id;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = admin_user_id
  ) THEN
    INSERT INTO public.profiles (user_id, full_name, username, created_by)
    VALUES (admin_user_id, 'Admin', 'admin', admin_user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = admin_user_id AND role = 'admin'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin');
  END IF;
END $$;
