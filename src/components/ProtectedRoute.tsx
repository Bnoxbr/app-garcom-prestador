import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/Loading';

// Removemos a interface ProtectedRouteProps e o parâmetro, pois a role permitida é fixa
// Mas a lógica de verificação de role é mantida dentro da função.

const ProtectedRoute: React.FC = () => {
  const { user, loading, role } = useAuth();
  
  // A ÚNICA FUNÇÃO PERMITIDA neste repositório dedicado.
  const ALLOWED_ROLE = 'prestador'; 

  // 1. Bloqueia a renderização enquanto o estado de autenticação está a ser carregado
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading message="Carregando..." size="lg" />
      </div>
    );
  }

  // 2. Redireciona se não houver usuário logado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Verificação de Permissão (Role)
  // Se o usuário estiver logado, mas a função (role) for diferente de 'prestador',
  // ele é redirecionado para a página de Acesso Negado.
  // O cheque 'role === null' também serve como um último recurso se a busca da role falhar.
  if (role !== ALLOWED_ROLE) {
    // Se a role for diferente (ex: 'contratante') ou ainda for null após o carregamento, bloqueia.
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Se estiver logado E for um prestador, permite a navegação
  return <Outlet />;
};

export default ProtectedRoute;