import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Calendar as BigCalendar, momentLocalizer, Event } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ChevronLeft, ChevronRight, Plus, Share2, MoreVertical } from 'lucide-react';
import Loading from '../../components/Loading';

// Configuração do localizador para o calendário em português
moment.locale('pt-br');
const localizer = momentLocalizer(moment);

// Interface para os nossos agendamentos
interface Agendamento extends Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: 'confirmado' | 'pendente' | 'cancelado' | 'disponivel';
  valor: number;
}

const AgendaPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'month' | 'week'>('month');
  const [date, setDate] = useState(new Date());
  const [filter, setFilter] = useState('Todos');

  useEffect(() => {
    if (user) {
      fetchAgendamentos();
    }
  }, [date, view]); // Recarrega os agendamentos quando o período de visualização muda

  const fetchAgendamentos = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('professional_id', user.id);

      if (error) throw error;

      const formattedEvents = data.map(agendamento => ({
        id: agendamento.id,
        title: agendamento.estabelecimento || 'Agendamento',
        start: new Date(agendamento.data_inicio),
        end: new Date(agendamento.data_fim),
        status: agendamento.status,
        valor: agendamento.valor
      }));
      setAgendamentos(formattedEvents);

    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredAgendamentos = useMemo(() => {
    if (filter === 'Todos') return agendamentos;
    const statusFilter = filter.toLowerCase().replace('ô', 'o'); // Normaliza 'Disponível'
    return agendamentos.filter(ag => ag.status === statusFilter);
  }, [agendamentos, filter]);
  
  const stats = useMemo(() => {
    const confirmados = agendamentos.filter(ag => ag.status === 'confirmado');
    const receita = confirmados.reduce((sum, ag) => sum + (ag.valor || 0), 0);
    return {
        total: agendamentos.length,
        confirmados: confirmados.length,
        receita,
        ocupacao: agendamentos.length > 0 ? Math.round((confirmados.length / agendamentos.length) * 100) : 0
    }
  }, [agendamentos]);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loading message="Carregando..." /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 1. Cabeçalho com Navegação */}
      <header className="fixed top-0 w-full bg-gradient-to-r from-gray-800 to-black text-white shadow-md z-20">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)}><ChevronLeft /></button>
          <h1 className="text-lg font-bold">Agenda</h1>
          <div className="flex items-center space-x-2">
            <button><Share2 size={20} /></button>
            <button><MoreVertical size={20} /></button>
          </div>
        </div>
      </header>
      
      <main className="max-w-md mx-auto pt-20 px-4">
        {/* 2. Controles de Visualização */}
        <div className="flex justify-between items-center mb-4">
            <div>
                <button onClick={() => setView('month')} className={`px-4 py-1 text-sm rounded-l-md ${view === 'month' ? 'bg-gray-800 text-white' : 'bg-white'}`}>Mês</button>
                <button onClick={() => setView('week')} className={`px-4 py-1 text-sm rounded-r-md ${view === 'week' ? 'bg-gray-800 text-white' : 'bg-white'}`}>Semana</button>
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={() => setDate(moment(date).subtract(1, view).toDate())}><ChevronLeft /></button>
                <span className="font-semibold text-sm w-32 text-center capitalize">{moment(date).format(view === 'month' ? 'MMMM YYYY' : '[Sem] DD MMM')}</span>
                <button onClick={() => setDate(moment(date).add(1, view).toDate())}><ChevronRight /></button>
            </div>
        </div>
        
        {/* 11. Área de Resumo */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs mb-4">
            <div className="bg-white p-2 rounded-lg shadow-sm">
                <p className="font-bold">{stats.total}</p><p className="text-gray-500">Total</p>
            </div>
            <div className="bg-white p-2 rounded-lg shadow-sm">
                <p className="font-bold text-green-600">{stats.confirmados}</p><p className="text-gray-500">Confirmados</p>
            </div>
            <div className="bg-white p-2 rounded-lg shadow-sm">
                <p className="font-bold">R$ {stats.receita.toFixed(2)}</p><p className="text-gray-500">Receita</p>
            </div>
            <div className="bg-white p-2 rounded-lg shadow-sm">
                <p className="font-bold">{stats.ocupacao}%</p><p className="text-gray-500">Ocupação</p>
            </div>
        </div>

        {/* 4. Filtros de Status */}
        <div className="flex space-x-2 overflow-x-auto pb-2 mb-4">
            {['Todos', 'Confirmados', 'Pendentes', 'Cancelados', 'Disponível'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${filter === f ? 'bg-gray-800 text-white' : 'bg-white shadow-sm'}`}>{f}</button>
            ))}
        </div>

        {/* 3. Calendário Principal */}
        <div className="bg-white p-2 rounded-lg shadow-md" style={{ height: 500 }}>
            {isLoading ? <Loading /> : (
              <BigCalendar
                localizer={localizer}
                events={filteredAgendamentos}
                view={view as any}
                onView={(v) => setView(v as any)}
                date={date}
                onNavigate={d => setDate(d)}
                startAccessor="start"
                endAccessor="end"
                messages={{ month: 'Mês', week: 'Semana', day: 'Dia', agenda: 'Lista', today: 'Hoje', previous: '<', next: '>' }}
                formats={{
                    dayFormat: 'ddd DD/MM',
                    dayHeaderFormat: 'dddd, DD MMMM',
                }}
              />
            )}
        </div>
      </main>

      {/* 7. Botão Flutuante */}
      <button className="fixed bottom-24 right-6 bg-gray-800 text-white p-4 rounded-full shadow-lg hover:bg-gray-900 transition-colors">
        <Plus />
      </button>

      {/* 10. Barra de Navegação Inferior (código omitido, assumindo que está num layout principal) */}
    </div>
  );
};

export default AgendaPage;

