
-- Add deleted_at column to tagihan table for soft delete
ALTER TABLE public.tagihan 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for better performance when querying deleted items
CREATE INDEX idx_tagihan_deleted_at ON public.tagihan(deleted_at) WHERE deleted_at IS NOT NULL;

-- Update existing RLS policies to exclude soft deleted items from normal queries
DROP POLICY IF EXISTS "Users can view their own tagihan" ON public.tagihan;
CREATE POLICY "Users can view their own active tagihan" 
  ON public.tagihan 
  FOR SELECT 
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Add policy for viewing deleted items (for admin/restore functionality)
CREATE POLICY "Users can view their own deleted tagihan" 
  ON public.tagihan 
  FOR SELECT 
  USING (auth.uid() = user_id AND deleted_at IS NOT NULL);

-- Update other policies to work with soft delete
DROP POLICY IF EXISTS "Users can update their own tagihan" ON public.tagihan;
CREATE POLICY "Users can update their own active tagihan" 
  ON public.tagihan 
  FOR UPDATE 
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Allow restoring deleted items (setting deleted_at to NULL)
CREATE POLICY "Users can restore their own deleted tagihan" 
  ON public.tagihan 
  FOR UPDATE 
  USING (auth.uid() = user_id AND deleted_at IS NOT NULL);
