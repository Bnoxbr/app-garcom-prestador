import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // Usando o alias para robustez
import { Session, User, AuthError } from '@supabase/supabase-js';

// Definimos o tipo para o contexto de autenticação
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: string | null;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>; // Certifica que signOut está na interface
}

// Criamos o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Criamos o provedor (Provider) que irá envolver a nossa aplicação
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  // Função auxiliar para buscar a role
  const fetchUserRole = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles') 
        .select('role')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { 
          throw error;
      }
      return profile ? profile.role as string : null;
    } catch (error) {
      console.error("Erro ao buscar a role do utilizador:", error);
      return null;
    }
  }

  useEffect(() => {
    const getInitialSession = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
              const userRole = await fetchUserRole(session.user.id);
              setRole(userRole);
            }
        } catch (error) {
            console.error("Erro fatal ao carregar a sessão inicial:", error);
        } finally {
            setLoading(false); 
        }
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const userRole = await fetchUserRole(session.user.id);
          setRole(userRole);
        } else {
          setRole(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); 

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

