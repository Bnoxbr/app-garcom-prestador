import React from 'react';
import { Link } from 'react-router-dom';

// No futuro, esta página receberá a lista de ofertas como props ou buscará no Supabase
const OportunidadesPage: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Novas Oportunidades</h1>
      <p className="mb-6 text-gray-600">Aqui serão listadas todas as ofertas de trabalho disponíveis para você.</p>
      
      {/* Adicione aqui a lógica para listar as 'ofertasPendentes' */}
      <div className="text-center border-2 border-dashed rounded-lg p-12">
        <p className="text-gray-500">A lista de oportunidades aparecerá aqui em breve.</p>
      </div>

      <Link to="/dashboard" className="mt-8 inline-block text-blue-600 hover:underline">
        &larr; Voltar para o Painel
      </Link>
    </div>
  );
};

export default OportunidadesPage;