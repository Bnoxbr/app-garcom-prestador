import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importando useNavigate
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Loading } from '@/components/Loading';
import { User, Calendar, Search, LogOut } from 'lucide-react';

interface DashboardStats {
  totalJobs: number;
  totalRevenue: number;
  profileCompletion: number;
}

// Interface para o objeto de perfil retornado pelo Supabase
interface ProfileForDashboard {
    bio: string | null;
    telefone: string | null;
    avatar_url: string | null;
    categoria: string | null;
    dados_financeiros: any | null; 
}

const DashboardPage: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate(); // Inicializando useNavigate
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    totalRevenue: 0,
    profileCompletion: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // CRÍTICO: Só executa se o user existir e tiver um ID
    if (user?.id) {
      loadDashboardData();
    } else if (!authLoading) {
      // Se não há usuário e o loading global terminou, paramos o loading local
      setIsLoading(false);
    }
  }, [user, authLoading]); // Adicionado authLoading às dependências para reagir ao fim do carregamento global

  const loadDashboardData = async () => {
    if (!user || !user.id) return;
    try {
      // Busca tipada
      const { data: profile, error } = await supabase
        .from('professionals')
        .select(`bio, telefone, avatar_url, categoria, dados_financeiros`)
        .eq('id', user.id)
        .single<ProfileForDashboard>(); // Aplica a tipagem aqui
      
      if (error) {
        // Logar o erro, mas não travar o carregamento local
        console.error('Erro ao buscar perfil para o dashboard:', error);
      }

      // Inicializa com 20% se o perfil for encontrado, 0% se não
      let completion = 0; 
      if (profile) {
        completion = 20; 
        if (profile.bio) completion += 15;
        if (profile.telefone) completion += 10;
        if (profile.avatar_url) completion += 15;
        if (profile.categoria) completion += 10;
        
        // Verifica se o objeto JSONB tem chaves (ou seja, se foi preenchido)
        if (profile.dados_financeiros && Object.keys(profile.dados_financeiros).length > 0) completion += 30;
      }
      
      setStats({
        totalJobs: 12, 
        totalRevenue: 4500.50, 
        profileCompletion: completion
      });

    } catch (error) {
      console.error('Erro geral ao carregar dados do dashboard:', error);
    } finally {
      // GARANTIDO: o estado de loading local termina em todos os cenários
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      // Redireciona para o login após o logout
      navigate('/login', { replace: true });
    } else {
      console.error("Erro ao fazer logout:", error.message);
    }
  };

  // Melhor forma de extrair o primeiro nome do metadata
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Parceiro';


  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading message={`Olá, ${firstName}! A carregar seu painel...`} size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header e Mensagem de Boas-Vindas (AGORA COM FLEX E BOTÃO) */}
        <div className="mb-8 flex justify-between items-start"> 
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Olá, {firstName}!</h1>
                <p className="text-gray-600 mt-2">
                    É um prazer receber você em nossa plataforma. Este é o seu painel de controlo.
                    <br />Vamos juntos construir uma parceria de sucesso!
                </p>
            </div>
            {/* BOTÃO DE LOGOUT */}
            <button 
                onClick={handleLogout} // Chama a função que gerencia a saída e a navegação
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm whitespace-nowrap text-sm mt-1 flex items-center"
                aria-label="Sair da conta"
            >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
            </button>
        </div>

        {/* Cartões de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Trabalhos Realizados</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalJobs}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Receita Total</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Perfil Completo</p>
            <div className="flex items-center mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-gray-800 h-2.5 rounded-full" style={{ width: `${stats.profileCompletion}%` }}></div>
                </div>
                <p className="text-lg font-bold text-gray-900 ml-4">{stats.profileCompletion}%</p>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/profile/edit" className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center text-center hover:shadow-xl transition-shadow">
            <User className="h-8 w-8 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800 mt-4">Gerir Perfil</h2>
            <p className="text-sm text-gray-500 mt-1">Atualize as suas informações e especialidades.</p>
          </Link>
          <Link to="/agenda" className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-xl transition-shadow">
            <Calendar className="h-8 w-8 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800 mt-4">Minha Agenda</h2>
            <p className="text-sm text-gray-500 mt-1">Defina a sua disponibilidade.</p>
          </Link>
          <Link to="/oportunidades" className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-xl transition-shadow">
            <Search className="h-8 w-8 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800 mt-4">Novas Oportunidades</h2>
            <p className="text-sm text-gray-500 mt-1">Encontre e candidate-se a trabalhos.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
