import { createContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

// 1. Tipagem e Contexto
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: string | null;
  signIn: (email: string, pass: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. AuthProvider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChange é acionado imediatamente com a sessão atual,
    // tornando getSession() redundante.
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await fetchRole(newSession.user.id);
      } else {
        setRole(null);
      }
      
      // O carregamento só termina após a verificação da sessão e do perfil.
      setLoading(false);
    });

    // Cleanup: remove o listener quando o componente é desmontado.
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      setRole(data?.role || null);
    } catch (error: any) {
      console.error('Error fetching role:', error.message);
      setRole(null);
    }
  };

  const signIn = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = useMemo(() => ({
    user,
    session,
    loading,
    role,
    signIn,
    signOut,
  }), [user, session, loading, role]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};