import { supabase } from '../supabaseClient';
import type { Categoria } from '../types';
import { DEFAULT_CATEGORIAS } from '../lib/defaults';

export async function listarCategorias(grupo?: string): Promise<Categoria[]> {
  let query = supabase.from('categorias').select('*');
  if (grupo) query = query.eq('grupo', grupo);
  const { data } = await query;
  return (data ?? []) as Categoria[];
}

export async function criarCategoriasPadrao(): Promise<void> {
  await supabase.from('categorias').insert(DEFAULT_CATEGORIAS);
}

export async function adicionarCategoria(novo: { grupo: string; descricao: string; tipo: string }): Promise<void> {
  await supabase.from('categorias').insert([novo]);
}

export async function apagarCategoria(id: string): Promise<void> {
  await supabase.from('categorias').delete().eq('id', id);
}
