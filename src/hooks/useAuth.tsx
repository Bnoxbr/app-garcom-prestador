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
  signOut: () => Promise<{ error: AuthError | null }>;
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
      // Busca a role na tabela 'profiles', que é onde o trigger a armazena
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 é 'Não encontrado' - esperado para novos usuários
          throw error;
      }
      return profile ? profile.role as string : null;
    } catch (error) {
      console.error("Erro ao buscar a role do utilizador:", error);
      return null;
    }
  }

  // Efeito principal para checar a sessão inicial e configurar o listener
  useEffect(() => {
    // Função para buscar os dados da sessão inicial de forma ROBUSTA
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
            // ESSENCIAL: Garante que o loading é SEMPRE desativado
            setLoading(false); 
        }
    };

    getInitialSession();

    // Ouvinte para mudanças no estado de autenticação (login, logout)
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

    // Limpeza do ouvinte quando o componente for desmontado
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // Roda apenas na montagem

  // Função de login
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { user: data.user, error };
  };

  // Função de logout
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    role,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook customizado para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
