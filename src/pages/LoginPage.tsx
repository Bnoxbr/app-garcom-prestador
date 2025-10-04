import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Usando caminhos relativos para garantir a consistência
import { useAuth } from '../hooks/useAuth';
import { Loading } from '../components/Loading';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, user, loading: authLoading } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Se o usuário já estiver logado, redireciona-o para o dashboard
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);

    const { user: loggedInUser, error } = await signIn(formData.email, formData.password);
    
    if (error) {
      setAuthError(error.message);
      setIsSubmitting(false);
    } else if (loggedInUser) {
      // SUCESSO! Redireciona para o dashboard.
      navigate('/dashboard', { replace: true });
    } else {
      setAuthError("Ocorreu um erro inesperado. Tente novamente.");
      setIsSubmitting(false);
    }
  };
  
  const isFormValid = formData.email && formData.password;

  // Mostra um loading inicial apenas enquanto a sessão é verificada
  if (authLoading) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Loading message="Carregando..." size="lg" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md">
        <div className="text-left mb-8">
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-800 transition-colors inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar ao início
            </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Entrar na sua conta</h1>
          <p className="text-gray-600 mt-2">Acesse sua conta para continuar</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {isSubmitting ? (
            <Loading message="Verificando..." size="md" />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-colors"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                        </svg>
                    </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-colors"
                    placeholder="Sua senha"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 3.029m-2.175-2.175a3 3 0 00-4.243-4.243" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z"} />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPassword ? "" : "M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z"} />
                      </svg>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Entrar
              </button>

              {authError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                  <p className="text-sm text-red-600">{authError}</p>
                </div>
              )}
            </form>
          )}
        </div>

        <div className="text-center mt-6 space-y-4">
            <Link
              to="/forgot-password"
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Esqueceu sua senha?
            </Link>
            
            <div className="text-sm text-gray-600">
              <p className="mb-2">Ainda não é nosso parceiro?</p>
              <Link
                to="/register"
                className="font-medium text-gray-800 hover:text-gray-900 transition-colors"
              >
                Cadastre-se e aumente sua renda!
              </Link>
            </div>
          </div>
      </div>
    </div>
  );
};

export default LoginPage;