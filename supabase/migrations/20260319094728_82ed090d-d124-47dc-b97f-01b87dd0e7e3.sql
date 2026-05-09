CREATE TABLE public.profit_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profit_amount NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.profit_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage profit_settings" ON public.profit_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "All authenticated can read profit_settings" ON public.profit_settings
  FOR SELECT TO authenticated
  USING (true);

INSERT INTO public.profit_settings (profit_amount) VALUES (0);