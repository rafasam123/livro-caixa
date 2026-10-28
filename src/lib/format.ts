export const formatarValor = (valor: number) =>
  (valor < 0 ? '-' : '') + 'R$ ' + Math.abs(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
