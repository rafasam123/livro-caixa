export interface Categoria {
  id: string;
  grupo: string;
  descricao: string;
  tipo: string;
  meta_final?: number | null;
}

export interface Transacao {
  id: string;
  data: string;
  grupo: string;
  categoria_id: string;
  descricao_item: string;
  valor: number;
  observacao?: string;
  nome?: string;
}
