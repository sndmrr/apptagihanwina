
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// App version - increment this to force all users to re-login
const APP_VERSION = '2.0.0';
const VERSION_KEY = 'app_version';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userName: string | null;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string, nama: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check app version - force re-login if version changed
    const storedVersion = localStorage.getItem(VERSION_KEY);
    if (storedVersion && storedVersion !== APP_VERSION) {
      // Version mismatch - force logout
      localStorage.clear();
      sessionStorage.clear();
      supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserName(null);
      setLoading(false);
      return;
    }

    // Load saved user name
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setUserName(savedName);
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (!session) {
          setUserName(null);
          localStorage.removeItem('userName');
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string, nama: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error) {
      setUserName(nama);
      localStorage.setItem('userName', nama);
      // Store current app version
      localStorage.setItem(VERSION_KEY, APP_VERSION);
    }
    return { error };
  };

  const signOut = async () => {
    // Clear local state IMMEDIATELY first
    setUser(null);
    setSession(null);
    setUserName(null);
    
    // Clear all storage
    localStorage.removeItem('userName');
    localStorage.clear();
    sessionStorage.clear();
    
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut error:', e);
    }
    
    // Force redirect to auth page using replace to avoid history issues
    window.location.replace('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, userName, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
