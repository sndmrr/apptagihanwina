import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'admin' | 'mitra' | null;

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  created_at: string;
}

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRoleAndProfile = async () => {
      if (!user) {
        setRole(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        // Fetch role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roleError) {
          console.error('Error fetching role:', roleError);
          setRole(null);
        } else {
          setRole(roleData?.role as UserRole);
        }

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setProfile(null);
        } else {
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error in fetchUserRoleAndProfile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoleAndProfile();
  }, [user]);

  return { role, profile, loading };
};
