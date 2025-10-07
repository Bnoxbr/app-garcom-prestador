import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/Loading';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { Input } from '../components/Input';

const LoginPage: React.FC = () => {
  const { signIn, loading } = useAuth();
  
  const [authError, setAuthError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const { error } = await signIn(email, password);
    
    if (error) {
      setAuthError(error.message);
    }
    // O redirecionamento é tratado pelo hook useAuth.
  };
  
  const isFormValid = email && password;



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
          {loading ? (
            <Loading message="Verificando..." size="md" />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                icon={<Mail className="h-5 w-5 text-gray-400" />}
              />

              <div className="relative">
                <Input
                  label="Senha"
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  icon={<Lock className="h-5 w-5 text-gray-400" />}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={!isFormValid || loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <LogIn className="h-5 w-5 mr-2" />
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