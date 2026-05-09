-- Create deposit_date_settings table
CREATE TABLE public.deposit_date_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deposit_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(deposit_date)
);

-- Enable RLS
ALTER TABLE public.deposit_date_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage deposit date settings
CREATE POLICY "Admins can manage deposit date settings"
  ON public.deposit_date_settings
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policy: All authenticated users can view deposit date settings
CREATE POLICY "All authenticated users can view deposit date settings"
  ON public.deposit_date_settings
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.deposit_date_settings;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at
CREATE TRIGGER update_deposit_date_settings_updated_at
  BEFORE UPDATE ON public.deposit_date_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
