-- Create first admin user
-- This is a one-time setup migration
-- Password: admin123 (user should change this immediately)

DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Check if admin already exists
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@syakirdigital.local' LIMIT 1;
  
  IF admin_user_id IS NULL THEN
    -- Insert admin user into auth.users (this requires superuser access)
    -- For production, this should be done via Supabase Dashboard or CLI
    RAISE NOTICE 'Please create admin user manually via Supabase Dashboard:';
    RAISE NOTICE 'Email: admin@syakirdigital.local';
    RAISE NOTICE 'Password: admin123';
    RAISE NOTICE 'Then run the following SQL:';
    RAISE NOTICE 'INSERT INTO profiles (user_id, full_name, username) VALUES ((SELECT id FROM auth.users WHERE email = ''admin@syakirdigital.local''), ''Admin'', ''admin'');';
    RAISE NOTICE 'INSERT INTO user_roles (user_id, role) VALUES ((SELECT id FROM auth.users WHERE email = ''admin@syakirdigital.local''), ''admin'');';
  END IF;
END $$;