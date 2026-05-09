-- Add columns to track user names who input and paid bills
ALTER TABLE public.tagihan 
ADD COLUMN nama_input text,
ADD COLUMN nama_lunas text;

-- Add comment for clarity
COMMENT ON COLUMN public.tagihan.nama_input IS 'Name of user who created the bill';
COMMENT ON COLUMN public.tagihan.nama_lunas IS 'Name of user who marked the bill as paid';