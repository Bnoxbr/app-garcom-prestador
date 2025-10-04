import { createClient } from '@supabase/supabase-js'

// Pega as variáveis de ambiente que configuramos no arquivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Cria e exporta o cliente Supabase para ser usado em toda a aplicação
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// --- FUNÇÃO DE TESTE DE CONEXÃO ---
// É muito provável que o erro esteja acontecendo aqui.
const testSupabaseConnection = async () => {
  try {
    // CORREÇÃO: Alteramos 'name' para 'nome_completo' para corresponder à coluna real no banco de dados.
    const { data, error } = await supabase
      .from('professionals')
      .select('nome_completo') // <-- A CORREÇÃO ESTÁ AQUI
      .limit(1);

    if (error) {
      throw error;
    }
    
    console.log('CONEXÃO COM SUPABASE BEM-SUCEDIDA.');

  } catch (error: any) {
    console.error('ERRO NO TESTE DE CONEXÃO:', error.message);
  }
};

// Executa o teste assim que este arquivo é carregado pela aplicação
testSupabaseConnection();
