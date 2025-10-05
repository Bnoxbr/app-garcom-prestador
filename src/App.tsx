import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProfessionalProfilePage from '@/pages/provider/ProfessionalProfilePage';
import RegisterPage from '@/pages/RegisterPage';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/provider/DashboardPage';
import ProfileEditPage from '@/pages/provider/ProfileEditPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import AcessoNegadoPage from '@/pages/AcessoNegadoPage'; 
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/Loading';

// O componente que agrupa a lógica de roteamento condicional
function AppContent() {
  const { user, loading } = useAuth(); 

  // 1. Loading Global: Exibe o loading enquanto o estado de autenticação está a ser verificado
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading message="Carregando..." size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/acesso-negado" element={<AcessoNegadoPage />} /> 
      
      {/* Rotas Protegidas para Prestadores (usando o Guardião) */}
      <Route element={<ProtectedRoute />}> 
        
        {/* Rota Principal: O Dashboard deve ser a primeira rota protegida. */}
        {/* CORREÇÃO: Usar o Dashboard como a rota "/" dentro do guardião */}
        <Route path="/" element={<DashboardPage />} /> 

        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/profile/:id" element={<ProfessionalProfilePage />} />
        <Route path="/profile/edit" element={<ProfileEditPage />} /> 
      </Route>
      
      {/* CORREÇÃO: A rota root que estava a competir com o ProtectedRoute foi removida. 
          O ProtectedRoute agora lida com o redirecionamento para o login se não houver usuário. */}
      
      {/* Rota Fallback: Redireciona tudo o que não for encontrado para a rota principal protegida. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// O App principal configura o Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
