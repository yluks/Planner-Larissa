import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const chave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// null quando o .env.local não está configurado — as telas que usam o banco mostram um aviso
export const supabase = url && chave ? createClient(url, chave, { auth: { persistSession: false } }) : null

export const mensagemErro = (erro) => {
  if (!erro) return ''
  if (erro.code === 'PGRST205' || erro.code === '42P01')
    return 'As tabelas do banco de questões ainda não existem. Rode o SQL de supabase/migrations no SQL Editor do Supabase.'
  return erro.message ?? String(erro)
}
