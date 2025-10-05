import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// Caminhos corrigidos para usar a forma relativa e garantir a resolução
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Loading } from '../../components/Loading';
import { ArrowLeft, Edit } from 'lucide-react';

// Interface para os dados do perfil principal
interface ProfileData {
  id: string;
  nome_completo: string | null;
  bio: string | null;
  categoria: string | null;
  especialidades: string[] | null;
  anos_experiencia: number | null;
  formacao: string[] | null;
  valor_hora: number | null;
  avatar_url: string | null;
  // O campo dados_financeiros foi removido da query pública
}

// Interface para os dados da tabela 'experiences'
interface Experience {
  id: string;
  establishment: string;
  position: string;
  period: string;
  responsibilities: string;
}

// Interface para os dados da tabela 'avaliacoes'
interface Review {
  id: string;
  comment: string;
  rating: number;
  contratante_nome?: string; // Este campo pode vir de um JOIN no futuro
}

const ProfessionalProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('sobre');

  const isOwnProfile = user && user.id === id;

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!id) {
        setError('ID do perfil não fornecido na URL.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Usamos Promise.all para buscar tudo em paralelo, melhorando a performance
        const [profileResult, experiencesResult, reviewsResult] = await Promise.all([
          supabase.from('professionals').select('id, nome_completo, bio, categoria, especialidades, anos_experiencia, formacao, valor_hora, avatar_url').eq('id', id).single(),
          supabase.from('experiences').select('*').eq('professional_id', id),
          supabase.from('avaliacoes').select('*').eq('professional_id', id)
        ]);

        if (profileResult.error) throw profileResult.error;
        if (experiencesResult.error) throw experiencesResult.error;
        if (reviewsResult.error) throw reviewsResult.error;

        if (profileResult.data) {
          setProfile(profileResult.data);
          setExperiences(experiencesResult.data || []);
          setReviews(reviewsResult.data || []);
        } else {
          setError('Perfil de profissional não encontrado.');
        }

      } catch (err: any) {
        setError(err.message);
        console.error("Erro ao buscar dados do perfil:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading message="Carregando perfil..." /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Erro: {error}</div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center">Perfil não encontrado.</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-20">
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-800"><ArrowLeft className="h-6 w-6" /></Link>
            <h1 className="text-lg font-bold">Perfil Profissional</h1>
            {isOwnProfile ? (
                <Link to="/profile/edit" className="text-gray-600 hover:text-gray-800"><Edit className="h-6 w-6" /></Link>
            ) : ( <div className="w-6"></div> )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <section className="flex flex-col items-center text-center my-8">
          <img src={profile.avatar_url || `https://placehold.co/128x128/e2e8f0/4a5568?text=${profile.nome_completo?.charAt(0)}`} alt={profile.nome_completo || 'Avatar'} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
          <h2 className="text-3xl font-bold mt-4">{profile.nome_completo || 'Nome não informado'}</h2>
          <p className="text-gray-600 text-lg">{profile.categoria || 'Profissional'}</p>
        </section>

        <nav className="border-b border-gray-200 mb-8">
            <div className="flex justify-center space-x-6">
                <button onClick={() => setActiveTab('sobre')} className={`pb-2 px-1 font-medium ${activeTab === 'sobre' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-500'}`}>Sobre</button>
                <button onClick={() => setActiveTab('experiencia')} className={`pb-2 px-1 font-medium ${activeTab === 'experiencia' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-500'}`}>Experiência</button>
                <button onClick={() => setActiveTab('avaliacoes')} className={`pb-2 px-1 font-medium ${activeTab === 'avaliacoes' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-500'}`}>Avaliações</button>
                {isOwnProfile && <button onClick={() => setActiveTab('financeiro')} className={`pb-2 px-1 font-medium ${activeTab === 'financeiro' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-500'}`}>Financeiro</button>}
            </div>
        </nav>

        <div>
          {activeTab === 'sobre' && ( /* A sua UI da aba "Sobre" vai aqui */ <div></div> )}
          
          {activeTab === 'experiencia' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Histórico Profissional</h3>
              {experiences.length > 0 ? (
                experiences.map(exp => (
                  <div key={exp.id} className="bg-white rounded-lg shadow p-4">
                    <h4 className="font-bold text-gray-800">{exp.position}</h4>
                    <p className="font-semibold text-gray-700">{exp.establishment}</p>
                    <p className="text-sm text-gray-500">{exp.period}</p>
                    <p className="text-sm text-gray-600 mt-2">{exp.responsibilities}</p>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-gray-500">Nenhuma experiência profissional cadastrada ainda.</p>
                  {isOwnProfile && <Link to="/profile/edit" className="text-blue-600 font-semibold mt-2 inline-block">Adicionar Experiência</Link>}
                </div>
              )}
            </div>
          )}

          {activeTab === 'avaliacoes' && (
             <div className="space-y-6">
                <h3 className="text-xl font-bold">Avaliações de Clientes</h3>
                {reviews.length > 0 ? (
                  reviews.map(review => (
                    <div key={review.id} className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center mb-2">
                            <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                ))}
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">"{review.comment}"</p>
                        <p className="text-xs text-gray-500 mt-2 text-right">- {review.contratante_nome || 'Cliente Anônimo'}</p>
                    </div>
                  ))
                ) : (
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                      <p className="text-gray-500">Nenhuma avaliação recebida ainda.</p>
                    </div>
                )}
            </div>
          )}
          
          {isOwnProfile && activeTab === 'financeiro' && ( /* A sua UI da aba "Financeiro" vai aqui */ <div></div> )}
        </div>
      </main>
    </div>
  );
};

export default ProfessionalProfilePage;

