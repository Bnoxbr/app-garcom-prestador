import React, { useState } from 'react';
// O caminho foi ajustado para relativo para garantir a resolução correta do arquivo.
import { supabase } from '@/lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

// Interface atualizada para incluir os novos campos
interface PrestadorFormData {
  email: string;
  password: string;
  confirmPassword: string; // Adicionado para validação
  nome_completo: string; // Corrigido de 'name' para 'nome_completo'
  telefone?: string;
  cpf?: string;
  mei?: string; // Novo campo
  cidade_atuacao?: string; // Novo campo
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<PrestadorFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    nome_completo: '',
    telefone: '',
    cpf: '',
    mei: '',
    cidade_atuacao: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    // Separamos os dados de autenticação dos dados de perfil
    const { email, password, confirmPassword, ...profileData } = formData;

    // 1. Cria o usuário no sistema de autenticação
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: profileData.nome_completo,
          role: 'prestador',
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // 2. Insere os dados na tabela 'professionals'
      // Apenas os campos que existem na tabela são enviados
      const { error: profileError } = await supabase
        .from('professionals')
        .insert({
          id: authData.user.id,
          nome_completo: profileData.nome_completo,
          telefone: profileData.telefone,
          // Adicionamos os novos campos aqui
          cpf: profileData.cpf,
          mei: profileData.mei,
          cidade_atuacao: profileData.cidade_atuacao,
        });

      if (profileError) {
        console.error('Erro ao inserir perfil de prestador:', profileError);
        setError('Sua conta foi criada, mas houve um erro ao salvar os detalhes do perfil.');
      } else {
        alert('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.');
        navigate('/login');
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)} // Função para voltar
              className="text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center"
            >
              &larr; Voltar
            </button>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-4">Criar Conta de Profissional</h1>
            <p className="text-gray-600 mt-2">Preencha os campos abaixo para criar sua conta.</p>
          </div>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <form onSubmit={handleRegister} className="space-y-8">
            {/* Informações de Login */}
            <fieldset className="space-y-6">
              <legend className="text-xl font-semibold text-gray-800">Informações de Login</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                  <input type="text" name="nome_completo" value={formData.nome_completo} onChange={handleInputChange} required className="w-full mt-1 p-3 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full mt-1 p-3 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">Senha</label>
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} required className="w-full mt-1 p-3 border border-gray-300 rounded-md shadow-sm" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center top-7">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">Confirmar Senha</label>
                  <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required className="w-full mt-1 p-3 border border-gray-300 rounded-md shadow-sm" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center top-7">
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </fieldset>

            {/* Dados Adicionais */}
            <fieldset className="space-y-6">
              <legend className="text-xl font-semibold text-gray-800">Dados Adicionais</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefone</label>
                  <input type="tel" name="telefone" value={formData.telefone} onChange={handleInputChange} className="w-full mt-1 p-3 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CPF</label>
                  <input type="text" name="cpf" value={formData.cpf} onChange={handleInputChange} className="w-full mt-1 p-3 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">MEI (Opcional)</label>
                  <input type="text" name="mei" value={formData.mei} onChange={handleInputChange} className="w-full mt-1 p-3 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cidade de Atuação</label>
                  <input type="text" name="cidade_atuacao" value={formData.cidade_atuacao} onChange={handleInputChange} className="w-full mt-1 p-3 border border-gray-300 rounded-md shadow-sm" />
                </div>
              </div>
            </fieldset>

            <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-gray-800 text-white font-semibold rounded-md hover:bg-gray-900 disabled:bg-gray-500">
              {loading ? 'Criando Conta...' : 'Criar Conta'}
            </button>

            <p className="mt-6 text-center text-sm text-gray-600">
              Já tem uma conta? <Link to="/login" className="font-medium text-gray-800 hover:underline">Faça login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

