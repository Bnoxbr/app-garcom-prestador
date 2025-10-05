import React from 'react';
import { Link } from 'react-router-dom';

const AcessoNegadoPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full">
        <div className="flex justify-center mb-4">
          {/* Ícone de Cadeado Quebrado */}
          <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6-6h6m-6 0a6 6 0 1112 0v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a6 6 0 016-6zm12 0h-6"></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Acesso Não Autorizado</h1>
        <p className="text-gray-600 mb-6">
          Você não tem permissão para visualizar esta página. O acesso é restrito apenas a parceiros Prestadores.
        </p>
        <Link 
          to="/login" 
          className="w-full inline-block py-3 px-4 bg-gray-800 text-white font-medium rounded-md hover:bg-gray-900 transition-colors shadow-lg"
        >
          Voltar para o Login
        </Link>
      </div>
    </div>
  );
};

export default AcessoNegadoPage;