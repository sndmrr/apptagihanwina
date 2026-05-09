-- Create pending_registrations table for reseller registration requests
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

-- Enable RLS
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can insert (for registration)
CREATE POLICY "Anyone can register"
ON public.pending_registrations
FOR INSERT
WITH CHECK (true);

-- Only admins can view pending registrations
CREATE POLICY "Admins can view pending registrations"
ON public.pending_registrations
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update pending registrations
CREATE POLICY "Admins can update pending registrations"
ON public.pending_registrations
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete pending registrations
CREATE POLICY "Admins can delete pending registrations"
ON public.pending_registrations
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_pending_registrations_updated_at
BEFORE UPDATE ON public.pending_registrations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();