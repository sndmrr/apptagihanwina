-- Drop and recreate function with correct formula
DROP FUNCTION IF EXISTS public.get_global_sisa_saldo();

CREATE OR REPLACE FUNCTION public.get_global_sisa_saldo()
RETURNS TABLE (
  total_saldo_induk numeric,
  total_tagihan_aktif numeric,
  total_bayar numeric,
  sisa_saldo_global numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_saldo_induk numeric;
  v_total_tagihan_aktif numeric;
  v_total_bayar numeric;
BEGIN
  -- Get total saldo from all settings
  SELECT COALESCE(SUM(saldo_awal), 0) INTO v_total_saldo_induk FROM settings;
  
  -- Get total tagihan aktif (belum_lunas, not deleted)
  SELECT COALESCE(SUM(jumlah), 0) INTO v_total_tagihan_aktif 
  FROM tagihan 
  WHERE status = 'belum_lunas' AND deleted_at IS NULL;
  
  -- Get total bayar/lunas (not deleted)
  SELECT COALESCE(SUM(jumlah), 0) INTO v_total_bayar 
  FROM tagihan 
  WHERE status = 'lunas' AND deleted_at IS NULL;
  
  -- Sisa Saldo = Total Saldo - Tagihan Aktif - Total Bayar
  RETURN QUERY SELECT 
    v_total_saldo_induk,
    v_total_tagihan_aktif,
    v_total_bayar,
    v_total_saldo_induk - v_total_tagihan_aktif - v_total_bayar;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_global_sisa_saldo() TO authenticated;