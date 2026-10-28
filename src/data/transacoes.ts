import { supabase } from '../supabaseClient';
import type { Transacao } from '../types';

export async function listarTransacoesRecentes(limite = 10): Promise<Transacao[]> {
  const { data } = await supabase.from('transacoes').select('*').order('data', { ascending: false }).limit(limite);
  return (data ?? []) as Transacao[];
}

export async function listarTodasTransacoes(): Promise<Transacao[]> {
  const { data } = await supabase.from('transacoes').select('*');
  return (data ?? []) as Transacao[];
}

export async function listarTransacoesPorMes(dataFiltro: Date): Promise<Transacao[]> {
  const ano = dataFiltro.getFullYear();
  const mes = dataFiltro.getMonth();
  const primeiroDia = new Date(ano, mes, 1).toISOString();
  const ultimoDia = new Date(ano, mes + 1, 0, 23, 59, 59).toISOString();
  const { data } = await supabase.from('transacoes').select('*')
    .gte('data', primeiroDia).lte('data', ultimoDia).order('data', { ascending: true });
  return (data ?? []) as Transacao[];
}

export async function listarTransacoesPorGrupoMes(grupo: string, dataFiltro: Date): Promise<Transacao[]> {
  const ano = dataFiltro.getFullYear();
  const mes = dataFiltro.getMonth();
  const primeiroDia = new Date(ano, mes, 1).toISOString();
  const ultimoDia = new Date(ano, mes + 1, 0, 23, 59, 59).toISOString();
  const { data } = await supabase.from('transacoes').select('*')
    .eq('grupo', grupo).gte('data', primeiroDia).lte('data', ultimoDia);
  return (data ?? []) as Transacao[];
}

export async function inserirTransacao(nova: Omit<Transacao, 'id'>): Promise<void> {
  await supabase.from('transacoes').insert([nova]);
}

export async function apagarTransacao(id: string): Promise<void> {
  await supabase.from('transacoes').delete().eq('id', id);
}
