import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // Corrigido para usar o alias
import { Session, User, AuthError } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: string | null;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const getSessionAndRole = async () => {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Erro ao buscar sessão:", error);
        setLoading(false);
        return;
      }

      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        console.log('Buscando Role para o usuário...'); // Log para auditoria
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', currentUser.id).single();
        setRole(profile?.role || null);
      }

      setLoading(false);
    };

    getSessionAndRole();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      const newUser = newSession?.user ?? null;
      setUser(newUser);

      if (newUser) {
        console.log('Buscando Role (onAuthStateChange)...'); // Log para auditoria
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', newUser.id).single();
        setRole(profile?.role || null);
      } else {
        setRole(null);
      }
      
      // O loading só deve ser alterado no carregamento inicial
      if (loading) setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // Dependência vazia está correta

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { user: data.user, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = { user, session, loading, role, signIn, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};