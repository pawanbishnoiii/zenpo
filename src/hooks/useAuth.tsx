import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: unknown }>;
  signIn: (email: string, password: string) => Promise<{ error: unknown }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const AUTH_TIMEOUT_MS = 15000;

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs = AUTH_TIMEOUT_MS): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    const timeoutId = setTimeout(() => {
      clearTimeout(timeoutId);
      reject(new Error('Request timeout. Please check your internet connection and try again.'));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        setIsAdmin(false);
        return;
      }

      setIsAdmin(data?.some((r: { role: string }) => r.role === 'admin') ?? false);
    } catch {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let bootstrapped = false;

    const applySession = (nextSession: Session | null) => {
      if (!mounted) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        void checkRole(nextSession.user.id);
      } else {
        setIsAdmin(false);
      }
    };

    const bootstrapSession = async () => {
      try {
        const {
          data: { session: nextSession },
        } = await withTimeout(supabase.auth.getSession());

        applySession(nextSession);
      } catch {
        if (!mounted) return;
        setSession(null);
        setUser(null);
        setIsAdmin(false);
      } finally {
        if (!mounted) return;
        bootstrapped = true;
        setLoading(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession);
      if (bootstrapped && mounted) {
        setLoading(false);
      }
    });

    void bootstrapSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { error } = await withTimeout(
        supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: window.location.origin,
          },
        })
      );
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await withTimeout(supabase.auth.signInWithPassword({ email, password }));
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await withTimeout(supabase.auth.signOut());
    } finally {
      setIsAdmin(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
