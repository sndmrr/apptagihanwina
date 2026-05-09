-- Create a function to get global sisa saldo data (accessible by all authenticated users)
CREATE OR REPLACE FUNCTION public.get_global_sisa_saldo()
RETURNS TABLE (
  total_saldo_induk numeric,
  total_lunas_semua_user numeric,
  sisa_saldo_global numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_saldo_induk numeric;
  v_total_lunas numeric;
BEGIN
  -- Get total saldo from all settings
  SELECT COALESCE(SUM(saldo_awal), 0) INTO v_total_saldo_induk FROM settings;
  
  -- Get total lunas from all tagihan (not deleted)
  SELECT COALESCE(SUM(jumlah), 0) INTO v_total_lunas 
  FROM tagihan 
  WHERE status = 'lunas' AND deleted_at IS NULL;
  
  RETURN QUERY SELECT 
    v_total_saldo_induk,
    v_total_lunas,
    v_total_saldo_induk - v_total_lunas;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_global_sisa_saldo() TO authenticated;