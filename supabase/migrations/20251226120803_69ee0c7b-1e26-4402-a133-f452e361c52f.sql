-- Add permission columns for user actions
ALTER TABLE public.profiles
ADD COLUMN can_edit_data boolean NOT NULL DEFAULT true,
ADD COLUMN can_delete_data boolean NOT NULL DEFAULT true,
ADD COLUMN can_lunas_data boolean NOT NULL DEFAULT true;