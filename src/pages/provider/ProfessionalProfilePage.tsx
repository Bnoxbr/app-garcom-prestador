import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

// Interface atualizada para corresponder exatamente à sua tabela `professionals`
interface ProfileData {
  id: string;
  nome_completo: string | null;
  telefone: string | null;
  bio: string | null;
  categoria: string | null;
  especialidades: string[] | null;
  anos_experiencia: number | null;
  formacao: string[] | null;
  disponibilidade_semanal: any | null; // jsonb pode ser mais tipado depois
  valor_hora: number | null;
  dados_mei: any | null; // jsonb
  dados_financeiros: any | null; // jsonb
  avatar_url: string | null;
}

// Interfaces para os dados que ainda virão de outras tabelas
interface Review {
    id: number;
    name: string;
    photo: string;
    date: string;
    rating: number;
    comment: string;
}

interface Experience {
    id: number;
    establishment: string;
    period: string;
    position: string;
    responsibilities: string;
}

const ProfessionalProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('sobre');

  const isOwnProfile = user && user.id === id;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) {
        setError('ID do perfil não fornecido na URL.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { data, error } = await supabase.from('professionals').select('*').eq('id', id).single();
        if (error) throw error;
        if (data) setProfile(data);
        else setError('Perfil de profissional não encontrado.');
      } catch (err: any) {
        setError(err.message);
        console.error("Erro ao buscar perfil:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  // --- DADOS MOCADOS (a serem substituídos por chamadas às tabelas `avaliacoes` e `experiences`) ---
  const reviews: Review[] = [
    { id: 1, name: 'Restaurante Sabor Brasileiro', photo: `https://placehold.co/50x50/E2E8F0/4A5568?text=RB`, date: '15 abril, 2025', rating: 5, comment: 'Profissional excepcional!' },
  ];
  const experiences: Experience[] = [
    { id: 1, establishment: 'Restaurante Vila Madá', period: 'Janeiro 2023 - Atual', position: 'Garçonete Sênior', responsibilities: 'Atendimento em salão principal.' },
  ];
  // --------------------------------------------------------------------------------------------------

  if (loading) return <div className="flex justify-center items-center min-h-screen">Carregando perfil...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">Erro: {error}</div>;
  if (!profile) return <div className="flex justify-center items-center min-h-screen">Perfil não encontrado.</div>;

  return (
    <div className="relative min-h-screen bg-gray-50 text-gray-800 pb-48">
      <header className="fixed top-0 w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white shadow-md z-20">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="cursor-pointer p-2"><i className="fas fa-arrow-left text-lg"></i></Link>
          <h1 className="text-lg font-medium">Perfil Profissional</h1>
          <div>
            {isOwnProfile ? (
                 <Link to={`/profile/${id}/edit`} className="p-2 rounded-full hover:bg-gray-800"><i className="fas fa-pencil-alt text-lg"></i></Link>
            ) : (
                <button className="p-2 rounded-full hover:bg-gray-800 cursor-pointer"><i className="fas fa-share-alt text-lg"></i></button>
            )}
          </div>
        </div>
      </header>

      <main className="pt-20 pb-24 px-4">
        <section className="flex flex-col items-center mt-6 mb-6">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md mb-3">
            <img src={profile.avatar_url || `https://placehold.co/200x200/E2E8F0/4A5568?text=${profile.nome_completo?.charAt(0)}`} alt={profile.nome_completo || 'Avatar'} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold">{profile.nome_completo || 'Nome não informado'}</h2>
          <p className="text-gray-600 mb-2">{profile.categoria || 'Profissional'}</p>
        </section>

        <nav className="mb-5 border-b border-gray-200">
            <div className="flex overflow-x-auto space-x-6 pb-2">
                <button onClick={() => setActiveTab('sobre')} className={`pb-2 px-1 font-medium text-sm whitespace-nowrap ${activeTab === 'sobre' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-500'}`}>Sobre</button>
                <button onClick={() => setActiveTab('experiencia')} className={`pb-2 px-1 font-medium text-sm whitespace-nowrap ${activeTab === 'experiencia' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-500'}`}>Experiência</button>
                <button onClick={() => setActiveTab('avaliacoes')} className={`pb-2 px-1 font-medium text-sm whitespace-nowrap ${activeTab === 'avaliacoes' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-500'}`}>Avaliações</button>
                {isOwnProfile && <button onClick={() => setActiveTab('financeiro')} className={`pb-2 px-1 font-medium text-sm whitespace-nowrap ${activeTab === 'financeiro' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-500'}`}>Financeiro</button>}
            </div>
        </nav>

        <div>
          {activeTab === 'sobre' && (
            <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="font-semibold mb-2">Biografia</h3>
                  <p className="text-gray-600 text-sm">{profile.bio || 'Nenhuma biografia fornecida.'}</p>
                </div>
                 <div className="bg-white rounded-lg shadow-sm p-4">
                   <h3 className="font-semibold mb-3">Especialidades</h3>
                   <div className="flex flex-wrap gap-2">
                    {profile.especialidades?.map(skill => (
                      <span key={skill} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">{skill}</span>
                    )) || <p className="text-sm text-gray-500">Nenhuma especialidade listada.</p>}
                   </div>
                 </div>
                 <div className="bg-white rounded-lg shadow-sm p-4">
                   <h3 className="font-semibold mb-3">Formação</h3>
                   <div className="space-y-2">
                    {profile.formacao?.map(edu => (
                      <p key={edu} className="text-sm text-gray-700">{edu}</p>
                    )) || <p className="text-sm text-gray-500">Nenhuma formação listada.</p>}
                   </div>
                 </div>
            </div>
          )}
          {activeTab === 'experiencia' && (
            <div className="space-y-4">
              {/* TODO: Substituir por dados da tabela 'experiences' */}
              {experiences.map(exp => (
                <div key={exp.id} className="bg-white rounded-lg shadow-sm p-4">
                    <h3 className="font-semibold">{exp.establishment}</h3>
                    <p className="text-sm text-gray-700 font-medium">{exp.position}</p>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'avaliacoes' && (
             <div className="space-y-4">
                {/* TODO: Substituir por dados da tabela 'avaliacoes' */}
                {reviews.map(review => (
                    <div key={review.id} className="bg-white rounded-lg shadow-sm p-4">
                        <h4 className="font-medium text-sm">{review.name}</h4>
                        <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                ))}
            </div>
          )}
          {isOwnProfile && activeTab === 'financeiro' && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold mb-2">Dados Financeiros</h3>
              {/* TODO: Implementar a visualização e edição dos dados financeiros */}
              <pre className="text-xs bg-gray-100 p-2 rounded">{JSON.stringify(profile.dados_financeiros, null, 2)}</pre>
            </div>
          )}
        </div>
      </main>

      {!isOwnProfile && (
        <footer className="fixed bottom-16 left-0 right-0 bg-white border-t p-4 shadow-lg z-10">
            <p className="text-xl font-bold">R$ {profile.valor_hora || 'N/A'}/hora</p>
            <button className="w-full mt-2 py-3 bg-gray-800 text-white rounded-lg font-medium text-sm">Contratar Agora</button>
        </footer>
      )}

      <nav className="fixed bottom-0 w-full bg-white border-t z-10">
        <div className="grid grid-cols-5 h-16">
          <Link to="/home" className="flex flex-col items-center justify-center text-gray-500"><i className="fas fa-home text-lg"></i><span className="text-xs mt-1">Início</span></Link>
          <Link to="/search" className="flex flex-col items-center justify-center text-gray-500"><i className="fas fa-search text-lg"></i><span className="text-xs mt-1">Buscar</span></Link>
          <Link to="/schedule" className="flex flex-col items-center justify-center text-gray-500"><i className="fas fa-calendar-alt text-lg"></i><span className="text-xs mt-1">Agenda</span></Link>
          <Link to="/chat" className="flex flex-col items-center justify-center text-gray-500"><i className="fas fa-comment-alt text-lg"></i><span className="text-xs mt-1">Chat</span></Link>
          <Link to={`/profile/${user?.id}`} className="flex flex-col items-center justify-center text-gray-800 font-bold"><i className="fas fa-user text-lg"></i><span className="text-xs mt-1">Perfil</span></Link>
        </div>
      </nav>
    </div>
  );
};

export default ProfessionalProfile;

