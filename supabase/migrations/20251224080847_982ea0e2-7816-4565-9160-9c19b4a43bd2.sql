-- Update function to only use saldo from admin users
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
  -- Get total saldo ONLY from admin users
  SELECT COALESCE(SUM(s.saldo_awal), 0) INTO v_total_saldo_induk 
  FROM settings s
  INNER JOIN user_roles ur ON s.user_id = ur.user_id
  WHERE ur.role = 'admin';
  
  -- Get total tagihan aktif from ALL users (belum_lunas, not deleted)
  SELECT COALESCE(SUM(jumlah), 0) INTO v_total_tagihan_aktif 
  FROM tagihan 
  WHERE status = 'belum_lunas' AND deleted_at IS NULL;
  
  -- Get total bayar/lunas from ALL users (not deleted)
  SELECT COALESCE(SUM(jumlah), 0) INTO v_total_bayar 
  FROM tagihan 
  WHERE status = 'lunas' AND deleted_at IS NULL;
  
  -- Sisa Saldo = Saldo Admin - Tagihan Aktif Semua - Total Bayar Semua
  RETURN QUERY SELECT 
    v_total_saldo_induk,
    v_total_tagihan_aktif,
    v_total_bayar,
    v_total_saldo_induk - v_total_tagihan_aktif - v_total_bayar;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_global_sisa_saldo() TO authenticated;