export type Grupo = 'entradas' | 'custosFixos' | 'custosVariaveis' | 'dividas' | 'investimentos';

export interface GrupoInfo {
  label: string;
  isEntrada: boolean;
}

export const GRUPOS: Record<string, GrupoInfo> = {
  entradas: { label: 'Entradas', isEntrada: true },
  custosFixos: { label: 'Custos Fixos', isEntrada: false },
  custosVariaveis: { label: 'Custos Variáveis', isEntrada: false },
  dividas: { label: 'Dívidas', isEntrada: false },
  investimentos: { label: 'Investimentos', isEntrada: false },
};

export const isEntrada = (grupo: string) => GRUPOS[grupo]?.isEntrada ?? false;
export const labelGrupo = (grupo: string) => GRUPOS[grupo]?.label ?? grupo;
