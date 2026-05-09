-- Add rijal@salsa.love (f3ca776a-83d4-4530-b85e-46f1ddb9a885) as admin
-- First, add to profiles if not exists
INSERT INTO public.profiles (user_id, full_name, username, created_by)
VALUES (
  'f3ca776a-83d4-4530-b85e-46f1ddb9a885',
  'Admin Rijal',
  'rijal@salsa.love',
  'f3ca776a-83d4-4530-b85e-46f1ddb9a885'
)
ON CONFLICT (user_id) DO NOTHING;

-- Add admin role
INSERT INTO public.user_roles (user_id, role)
VALUES (
  'f3ca776a-83d4-4530-b85e-46f1ddb9a885',
  'admin'
)
ON CONFLICT (user_id, role) DO NOTHING;