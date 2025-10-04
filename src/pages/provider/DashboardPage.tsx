import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Loading } from '@/components/Loading';

// Ícones para os cartões de ação e estatísticas (Lucide-React icons seriam melhores, mas usando SVG simples por padrão)
const ProfileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

interface DashboardStats {
  totalJobs: number;
  totalRevenue: number;
  profileCompletion: number;
}

const DashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    totalRevenue: 0,
    profileCompletion: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      // Cálculo da completude do perfil (usando campos da tabela professionals)
      const { data: profile } = await supabase.from('professionals').select('bio, telefone, avatar_url, categoria').eq('id', user.id).single();
      let completion = 20; // Base por ter uma conta
      if (profile?.bio) completion += 20;
      if (profile?.telefone) completion += 10;
      if (profile?.avatar_url) completion += 20;
      if (profile?.categoria) completion += 10;
      // Exemplo: Se todos os dados financeiros e endereço fossem preenchidos
      if (profile?.dados_financeiros && Object.keys(profile.dados_financeiros).length > 0) completion += 20;

      setStats({
        totalJobs: 12, // Dados de exemplo (simulação)
        totalRevenue: 4500.50, // Dados de exemplo (simulação)
        profileCompletion: completion
      });

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
        {/* Header e Mensagem de Boas-Vindas */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Olá, {firstName}!</h1>
          <p className="text-gray-600 mt-2">
            É um prazer receber você em nossa plataforma. Este é o seu painel de controlo.
            <br />Vamos juntos construir uma parceria de sucesso!
          </p>
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
            <ProfileIcon />
            <h2 className="text-lg font-semibold text-gray-800 mt-4">Gerir Perfil</h2>
            <p className="text-sm text-gray-500 mt-1">Atualize as suas informações e especialidades.</p>
          </Link>
          <Link to="/agenda" className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-xl transition-shadow">
            <CalendarIcon />
            <h2 className="text-lg font-semibold text-gray-800 mt-4">Minha Agenda</h2>
            <p className="text-sm text-gray-500 mt-1">Defina a sua disponibilidade.</p>
          </Link>
          <Link to="/oportunidades" className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-xl transition-shadow">
            <SearchIcon />
            <h2 className="text-lg font-semibold text-gray-800 mt-4">Novas Oportunidades</h2>
            <p className="text-sm text-gray-500 mt-1">Encontre e candidate-se a trabalhos.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
