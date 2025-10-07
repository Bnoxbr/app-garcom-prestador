// app.tsx (app-garcom-prestador)

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Loading from './components/Loading';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/provider/DashboardPage';
import ProfessionalProfilePage from './pages/provider/ProfessionalProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import AcessoNegadoPage from './pages/AcessoNegadoPage';
import ProfileEditPage from './pages/provider/ProfileEditPage';
import AgendaPage from './pages/provider/AgendaPage';
import OfertaDetalhadaPage from './pages/provider/OfertaDetalhadaPage';

// --- NOVA IMPORTAÇÃO ---
import OportunidadesPage from './pages/provider/OportunidadesPage'; // Importe a nova página

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading message="Carregando..." size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={ user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace /> } />
      <Route path="/login" element={ !user ? <LoginPage /> : <Navigate to="/dashboard" replace /> } />
      <Route path="/register" element={ !user ? <RegisterPage /> : <Navigate to="/dashboard" replace /> } />
      <Route path="/unauthorized" element={<AcessoNegadoPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/agenda" element={<AgendaPage />} />
        <Route path="/profile/edit" element={<ProfileEditPage />} />
        <Route path="/profile/:id" element={<ProfessionalProfilePage />} />
        <Route path="/oportunidades/:id" element={<OfertaDetalhadaPage />} />
        
        {/* --- NOVA ROTA ADICIONADA AQUI --- */}
        <Route path="/oportunidades" element={<OportunidadesPage />} /> 
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;