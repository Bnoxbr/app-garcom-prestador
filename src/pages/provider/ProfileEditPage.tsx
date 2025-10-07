import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Input } from '../../components/Input'; // Importando o Input reutilizável
import AvatarUploader from '../../components/AvatarUploader'; // Importando o AvatarUploader
import Loading from '../../components/Loading';


const ProfileEditPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado para guardar os dados do formulário
  const [formData, setFormData] = useState<any>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        // Preenche o formulário com os dados do banco, incluindo valores padrão para objetos vazios
        setFormData({
            ...data,
            endereco: data.endereco || {},
            dados_bancarios: data.dados_bancarios || {}
        });
      } catch (error) {
        toast.error("Erro ao carregar seu perfil.");
        console.error("Erro ao buscar dados do perfil:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  // Função para lidar com a mudança nos inputs normais e aninhados (endereço, banco)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setFormData((prev: any) => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [child]: value
            }
        }));
    } else {
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleAvatarUpload = (file: File) => {
    setAvatarFile(file);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    
    try {
        // Lógica de upload da imagem, se uma nova foi selecionada
        let avatar_url = formData.avatar_url;
        if (avatarFile) {
            const filePath = `${user.id}/${avatarFile.name}`;
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, avatarFile, { upsert: true }); // upsert: true substitui se já existir

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
            avatar_url = urlData.publicUrl;
        }

        // Lógica para salvar os dados do formulário na tabela 'professionals'
        const { id, ...updateData } = { ...formData, avatar_url };
        
        const { error: updateError } = await supabase
            .from('professionals')
            .update(updateData)
            .eq('id', user.id);

        if (updateError) throw updateError;
        
        toast.success("Perfil atualizado com sucesso!");
        navigate('/dashboard');

    } catch (error) {
        toast.error("Não foi possível salvar as alterações.");
        console.error("Erro ao salvar perfil:", error);
    } finally {
        setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading message="Carregando seu perfil para edição..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Editar Perfil Profissional</h1>
          
          <AvatarUploader currentAvatarUrl={formData.avatar_url} onUpload={handleAvatarUpload} />

          <div className="mt-8 space-y-8">
            {/* Dados Pessoais */}
            <fieldset className="space-y-4">
                <legend className="text-lg font-semibold text-gray-800 border-b pb-2">Dados Pessoais</legend>
                <Input
                    label="Nome Completo"
                    name="nome_completo"
                    value={formData.nome_completo || ''}
                    onChange={handleInputChange}
                />
                <Input
                    label="CPF"
                    name="cpf"
                    value={formData.cpf || ''}
                    onChange={handleInputChange}
                />
                <div>
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea name="bio" value={formData.bio || ''} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" rows={4} />
                </div>
            </fieldset>

            {/* Endereço */}
            <fieldset className="space-y-4">
                <legend className="text-lg font-semibold text-gray-800 border-b pb-2">Endereço</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="CEP"
                        name="endereco.cep"
                        value={formData.endereco?.cep || ''}
                        onChange={handleInputChange}
                    />
                    <Input
                        label="Logradouro"
                        name="endereco.logradouro"
                        value={formData.endereco?.logradouro || ''}
                        onChange={handleInputChange}
                    />
                    {/* Adicionar mais campos de endereço se necessário */}
                </div>
            </fieldset>

            {/* Dados Bancários */}
            <fieldset className="space-y-4">
                <legend className="text-lg font-semibold text-gray-800 border-b pb-2">Dados Bancários para Recebimento</legend>
                <Input
                    label="Chave PIX"
                    name="dados_bancarios.chave_pix"
                    value={formData.dados_bancarios?.chave_pix || ''}
                    onChange={handleInputChange}
                />
                 {/* Adicionar mais campos bancários se necessário */}
            </fieldset>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
              disabled={isSaving}
            >
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditPage;