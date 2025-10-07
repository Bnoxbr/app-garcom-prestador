import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Loading from '../../components/Loading';
import { toast } from 'react-hot-toast';

type Oferta = any; 

const OfertaDetalhadaPage: React.FC = () => {
    const { id: ofertaId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [oferta, setOferta] = useState<Oferta | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (!ofertaId) {
            toast.error("ID da oferta não encontrado.");
            navigate('/dashboard');
            return;
        }

        const fetchAndMarkAsViewed = async () => {
            setLoading(true);
            
            const { data, error } = await supabase
                .from('servicos_realizados')
                .select('*')
                .eq('id', ofertaId)
                .single();

            if (error || !data) {
                toast.error("Não foi possível carregar os detalhes da oferta.");
                console.error(error);
                navigate('/dashboard');
                return;
            }
            
            setOferta(data);

            if (data.status_visualizacao_prestador === 'ENVIADA') {
                await supabase
                    .from('servicos_realizados')
                    .update({ status_visualizacao_prestador: 'VISUALIZADA' })
                    .eq('id', ofertaId);
            }

            setLoading(false);
        };

        fetchAndMarkAsViewed();
    }, [ofertaId, navigate]);
    
    // Função para lidar com o clique nos botões de ação
    const handleAction = async (novoStatus: 'recusado' | 'aguardando_pagamento') => {
        if (!ofertaId) return;
        setActionLoading(true);
        const toastId = toast.loading('Processando sua resposta...');

        const { error } = await supabase
            .from('servicos_realizados')
            .update({ status: novoStatus })
            .eq('id', ofertaId);

        if (error) {
            toast.error(`Erro ao ${novoStatus === 'recusado' ? 'recusar' : 'aceitar'} a oferta.`, { id: toastId });
            console.error(error);
        } else {
            toast.success(`Oferta ${novoStatus === 'recusado' ? 'recusada' : 'aceita'} com sucesso!`, { id: toastId });
            navigate('/dashboard'); // Redireciona de volta para o dashboard
        }
        setActionLoading(false);
    };

    if (loading) {
        return <Loading message="Carregando detalhes da oferta..." />;
    }

    if (!oferta) {
        return (
            <div className="text-center p-8">
                <p>Oferta não encontrada ou já respondida.</p>
                <button onClick={() => navigate('/dashboard')} className="mt-4 text-blue-600 hover:underline">Voltar para o Painel</button>
            </div>
        );
    }

    const detalhes = oferta.checklist_alinhamento?.detalhes_contratante || {};

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 relative">
                
                {/* --- BOTÃO "VOLTAR" ADICIONADO AQUI --- */}
                <button 
                    onClick={() => navigate('/dashboard')} 
                    className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 flex items-center text-sm"
                >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Voltar para o Painel
                </button>

                <div className="pt-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Você recebeu uma nova oferta!</h1>
                    <p className="text-sm text-gray-500 mb-6 text-center">Analise os detalhes abaixo e responda o mais rápido possível.</p>

                    <div className="space-y-4 border-t border-b py-6">
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-600">Data do Serviço:</span>
                            <span className="font-medium text-gray-800">{new Date(oferta.data_servico).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-600">Horário:</span>
                            <span className="font-medium text-gray-800">{oferta.hora_inicio} - {oferta.hora_fim}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-600">Traje Requerido:</span>
                            <span className="font-medium text-gray-800 text-right">{detalhes.traje || 'Não especificado'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-600">Contato no Local:</span>
                            <span className="font-medium text-gray-800 text-right">{detalhes.contato_no_local || 'Não especificado'}</span>
                        </div>
                        {detalhes.observacoes && (
                            <div>
                                <span className="font-semibold text-gray-600">Observações:</span>
                                <p className="mt-1 text-sm text-gray-800 bg-gray-50 p-3 rounded-md">{detalhes.observacoes}</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => handleAction('recusado')}
                            disabled={actionLoading}
                            className="w-full bg-red-100 text-red-700 font-bold py-3 px-4 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                            {actionLoading ? 'Processando...' : 'Recusar Oferta'}
                        </button>
                        <button
                            onClick={() => handleAction('aguardando_pagamento')}
                            disabled={actionLoading}
                            className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {actionLoading ? 'Processando...' : 'Aceitar e Confirmar Requisitos'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OfertaDetalhadaPage;