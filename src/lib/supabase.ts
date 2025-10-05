import { createClient } from '@supabase/supabase-js'

// Pega as variáveis de ambiente que configuramos no arquivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Cria e exporta o cliente Supabase para ser usado em toda a aplicação
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
