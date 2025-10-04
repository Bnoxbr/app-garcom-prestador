import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProfessionalProfilePage from '@/pages/provider/ProfessionalProfilePage';
import RegisterPage from '@/pages/RegisterPage';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/provider/DashboardPage';
import ProfileEditPage from '@/pages/provider/ProfileEditPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/Loading';

function App() {
  const { loading } = useAuth(); // Removido 'user' pois não é mais usado aqui

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading message="Carregando..." size="lg" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Rotas Protegidas - O ProtectedRoute agora gerencia a rota principal */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} /> {/* Rota principal é o Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile/:id" element={<ProfessionalProfilePage />} />
          <Route path="/profile/edit" element={<ProfileEditPage />} /> 
        </Route>

        {/* Redirecionamento para rotas não encontradas (opcional, mas bom para UX) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
