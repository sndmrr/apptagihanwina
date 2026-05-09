
CREATE TABLE public.deposit_date_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deposit_date text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.deposit_date_settings ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admins can manage deposit date" ON public.deposit_date_settings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- All authenticated users can view
CREATE POLICY "Authenticated users can view deposit date" ON public.deposit_date_settings FOR SELECT USING (auth.uid() IS NOT NULL);

-- Trigger for updated_at
CREATE TRIGGER update_deposit_date_settings_updated_at
BEFORE UPDATE ON public.deposit_date_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
