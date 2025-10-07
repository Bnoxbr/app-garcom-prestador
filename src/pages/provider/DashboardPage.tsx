import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../../components/Loading';
import { supabase } from '../../lib/supabase';
import { User, Calendar, Search, LogOut, Bell, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

// --- Interfaces ---
interface DashboardStats {
  totalJobs: number;
  totalRevenue: number;
  profileCompletion: number;
}
interface ProfileForDashboard {
    bio: string | null;
    telefone: string | null;
    avatar_url: string | null;
    categoria: string | null;
    dados_financeiros: any | null; 
}
interface OfertaPendente {
  id: string;
  data_servico: string;
}

const DashboardPage: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({ totalJobs: 0, totalRevenue: 0, profileCompletion: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [ofertasPendentes, setOfertasPendentes] = useState<OfertaPendente[]>([]);
  const [showNotificationCard, setShowNotificationCard] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`realtime-ofertas-para-${user.id}`)
      .on<OfertaPendente>('postgres_changes', { event: 'INSERT', schema: 'public', table: 'servicos_realizados', filter: `professional_id=eq.${user.id}` },
        (payload) => {
          toast.success('Você recebeu uma nova oferta de trabalho!');
          setOfertasPendentes((anteriores) => [payload.new, ...anteriores]);
          setShowNotificationCard(true);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // --- FUNÇÃO RESTAURADA ---
  const loadDashboardData = async () => {
    if (!user || !user.id) return;
    try {
      const [profileResult, jobsResult, ofertasResult] = await Promise.all([
        supabase.from('professionals').select(`bio, telefone, avatar_url, categoria, dados_financeiros`).eq('id', user.id).single<ProfileForDashboard>(),
        supabase.from('servicos_realizados').select('valor').eq('professional_id', user.id),
        supabase.from('servicos_realizados').select('id, data_servico').eq('professional_id', user.id).eq('status', 'aguardando_aceite')
      ]);

      let completion = 0;
      if (profileResult.data) {
        const profile = profileResult.data;
        completion = 20; 
        if (profile.bio) completion += 15;
        if (profile.telefone) completion += 10;
        if (profile.avatar_url) completion += 15;
        if (profile.categoria) completion += 10;
        if (profile.dados_financeiros && Object.keys(profile.dados_financeiros).length > 0) completion += 30;
      }
      
      let totalJobsFromDB = 0;
      let totalRevenueFromDB = 0;

      if (jobsResult.data) {
        totalJobsFromDB = jobsResult.data.length;
        totalRevenueFromDB = jobsResult.data.reduce((sum, job) => {
            const valorNumerico = parseFloat(job.valor as any);
            return sum + (isNaN(valorNumerico) ? 0 : valorNumerico);
        }, 0);
      }
      
      setStats({
        totalJobs: totalJobsFromDB, 
        totalRevenue: totalRevenueFromDB, 
        profileCompletion: completion
      });

      if (ofertasResult.data) {
        setOfertasPendentes(ofertasResult.data as OfertaPendente[]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast.error("Não foi possível carregar os dados do painel.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- FUNÇÃO RESTAURADA ---
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
      toast.success('Sessão terminada com sucesso!');
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error.message);
      toast.error("Não foi possível sair. Tente novamente.");
    }
  };

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Parceiro';

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading message={`Olá, ${firstName}! Carregando seu painel...`} size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* --- MENSAGEM DE BOAS-VINDAS --- */}
        <div className="mb-8 flex justify-between items-start"> 
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Olá, {firstName}!</h1>
                <p className="text-gray-600 mt-2">É um prazer receber você em nossa plataforma. Este é o seu painel de controle.<br />Vamos juntos construir uma parceria de sucesso!</p>
            </div>
            <button onClick={handleLogout} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm whitespace-nowrap text-sm mt-1 flex items-center" aria-label="Sair da conta">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
            </button>
        </div>

        {/* --- LAYOUT DINÂMICO --- */}
        {/* Este card só aparece se houver ofertas, empurrando o resto para baixo */}
        {ofertasPendentes.length > 0 && showNotificationCard && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Ações Requeridas</h2>
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-lg shadow-md relative">
              <button 
                onClick={() => setShowNotificationCard(false)} 
                className="absolute top-2 right-2 p-1 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-200 rounded-full"
                aria-label="Fechar notificação"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center mb-3">
                <Bell className="h-6 w-6 mr-3 animate-pulse" />
                <h3 className="font-bold">Você tem {ofertasPendentes.length} nova{ofertasPendentes.length > 1 ? 's' : ''} oferta{ofertasPendentes.length > 1 ? 's' : ''}!</h3>
              </div>
              <p className="mb-4 text-sm">Responda rapidamente para não perder a oportunidade. As ofertas expiram em 5 minutos.</p>
              <div className="space-y-2">
                {ofertasPendentes.map(oferta => (
                   <Link 
                      key={oferta.id} 
                      to={`/oportunidades/${oferta.id}`}
                      className="block bg-white p-3 rounded-md hover:bg-gray-50 transition-colors shadow-sm"
                    >
                     <p className="font-semibold text-sm text-gray-900">Nova oferta para a data: {new Date(oferta.data_servico).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                     <p className="text-xs text-blue-600 font-medium">Clique aqui para ver os detalhes e responder</p>
                   </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-600">Trabalhos Realizados</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalJobs}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
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
        
        {/* Cards de Navegação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/profile/edit" className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center text-center hover:shadow-xl transition-shadow">
            <User className="h-8 w-8 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800 mt-4">Gerir Perfil</h2>
            <p className="text-sm text-gray-500 mt-1">Atualize suas informações.</p>
          </Link>
          <Link to="/agenda" className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center text-center hover:shadow-xl transition-shadow">
            <Calendar className="h-8 w-8 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800 mt-4">Minha Agenda</h2>
            <p className="text-sm text-gray-500 mt-1">Defina sua disponibilidade.</p>
          </Link>

          {/* Card de Novas Oportunidades com o sinalizador numérico */}
          <div className="relative">
            <Link to="/oportunidades" className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center text-center hover:shadow-xl transition-shadow h-full">
              <Search className="h-8 w-8 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-800 mt-4">Novas Oportunidades</h2>
              <p className="text-sm text-gray-500 mt-1">Encontre e responda a trabalhos.</p>
            </Link>
            {ofertasPendentes.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                {ofertasPendentes.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;