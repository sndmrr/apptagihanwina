
-- Create notifikasi_user table
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

-- Enable RLS
ALTER TABLE public.notifikasi_user ENABLE ROW LEVEL SECURITY;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifikasi_user;

-- Admin can do everything
CREATE POLICY "Admins can manage notifications"
ON public.notifikasi_user
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Users can view notifications targeted to them or all
CREATE POLICY "Users can view their notifications"
ON public.notifikasi_user
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    target_type = 'all' OR target_user_id = auth.uid()
  )
);

-- Users can update is_read/read_at on their own notifications
CREATE POLICY "Users can mark notifications as read"
ON public.notifikasi_user
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND (
    target_type = 'all' OR target_user_id = auth.uid()
  )
);
