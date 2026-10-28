import { useState, useEffect } from 'react';
import { formatarValor } from '../lib/format';
import { listarTodasTransacoes } from '../data/transacoes';
import { listarCategorias } from '../data/categorias';
import type { Categoria, Transacao } from '../types';

export default function DashboardPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  // Navegação de meses
  const mesesAbrev = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const [dataFiltro, setDataFiltro] = useState(new Date());
  const mesAtualStr = `${mesesAbrev[dataFiltro.getMonth()]}/${String(dataFiltro.getFullYear()).slice(2)}`;

  useEffect(() => {
    async function fetchDados() {
      const trans = await listarTodasTransacoes();
      const cats = await listarCategorias();
      setTransacoes(trans);
      setCategorias(cats);
      setLoading(false);
    }
    fetchDados();
  }, []);

  const prevMonth = () => setDataFiltro(new Date(dataFiltro.getFullYear(), dataFiltro.getMonth() - 1, 1));
  const nextMonth = () => setDataFiltro(new Date(dataFiltro.getFullYear(), dataFiltro.getMonth() + 1, 1));

  if (loading) {
    return <div className="fade-in"><p className="empty-note">A calcular a tua visão geral...</p></div>;
  }

  // Filtrar transações apenas do mês selecionado
  const transacoesMes = transacoes.filter(t => {
    // Evita problemas de fuso horário ao dividir a string YYYY-MM-DD
    const [anoT, mesT] = t.data.split('-');
    return Number(anoT) === dataFiltro.getFullYear() && (Number(mesT) - 1) === dataFiltro.getMonth();
  });

  const totalEntradas = transacoesMes.filter(t => t.grupo === 'entradas').reduce((acc, curr) => acc + Number(curr.valor), 0);
  const totalFixos = transacoesMes.filter(t => t.grupo === 'custosFixos').reduce((acc, curr) => acc + Number(curr.valor), 0);
  const totalVariaveis = transacoesMes.filter(t => t.grupo === 'custosVariaveis').reduce((acc, curr) => acc + Number(curr.valor), 0);
  const totalDividas = transacoesMes.filter(t => t.grupo === 'dividas').reduce((acc, curr) => acc + Number(curr.valor), 0);
  const totalInvestimentos = transacoesMes.filter(t => t.grupo === 'investimentos').reduce((acc, curr) => acc + Number(curr.valor), 0);

  const saidas = totalFixos + totalVariaveis + totalDividas + totalInvestimentos;
  const saldo = totalEntradas - saidas;

  // Gerar histórico dos últimos 6 meses (terminando no mês selecionado)
  const historicoMeses = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(dataFiltro.getFullYear(), dataFiltro.getMonth() - i, 1);
    const mStr = `${mesesAbrev[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
    
    const transMesHist = transacoes.filter(t => {
      const [anoT, mesT] = t.data.split('-');
      return Number(anoT) === d.getFullYear() && (Number(mesT) - 1) === d.getMonth();
    });

    const ent = transMesHist.filter(t => t.grupo === 'entradas').reduce((acc, curr) => acc + Number(curr.valor), 0);
    const sai = transMesHist.filter(t => t.grupo !== 'entradas').reduce((acc, curr) => acc + Number(curr.valor), 0);
    
    historicoMeses.push({ mes: mStr, ent, sai });
  }
  
  const maxVal = Math.max(...historicoMeses.flatMap(h => [h.ent, h.sai]), 1);

  // Dados para as barras de divisão de despesas
  const divisaoDespesas = [
    { nome: 'Custos fixos', valor: totalFixos },
    { nome: 'Custos variáveis', valor: totalVariaveis },
    { nome: 'Dívidas', valor: totalDividas },
    { nome: 'Investimentos', valor: totalInvestimentos },
  ];
  const maxDivisao = Math.max(1, ...divisaoDespesas.map(d => d.valor));

  // Metas de investimento (Soma todo o histórico, não apenas o mês selecionado)
  const metas = categorias
    .filter(c => c.grupo === 'investimentos')
    .map(cat => {
      const guardado = transacoes
        .filter(t => t.categoria_id === cat.id)
        .reduce((acc, curr) => acc + Number(curr.valor), 0);
        
      return {
        id: cat.id,
        desc: cat.descricao,
        guardado: guardado,
        final: cat.meta_final
      };
    });

  return (
    <div className="fade-in">
      <div className="top-row">
        <h1 id="page-title">Visão geral</h1>
        <div className="month-nav">
          <button onClick={prevMonth} className="nav-btn">‹</button>
          <span className="month-label">{mesAtualStr}</span>
          <button onClick={nextMonth} className="nav-btn">›</button>
        </div>
      </div>

      <div className="cards">
        <div className="card">
          <div className="card-label">Entradas do mês</div>
          <div className="card-value pos">{formatarValor(totalEntradas)}</div>
        </div>
        <div className="card">
          <div className="card-label">Saídas do mês</div>
          <div className="card-value neg">{formatarValor(saidas)}</div>
        </div>
        <div className="card">
          <div className="card-label">Saldo do mês</div>
          <div className={`card-value ${saldo >= 0 ? 'pos' : 'neg'}`}>{formatarValor(saldo)}</div>
        </div>
        <div className="card">
          <div className="card-label">Guardado no mês</div>
          <div className="card-value">{formatarValor(totalInvestimentos)}</div>
        </div>
      </div>

      <section className="block">
        <h2 className="block-title">Entradas × saídas — últimos 6 meses</h2>
        <div className="trend-wrap">
          <div className="trend-bars">
            {historicoMeses.map((v, i) => {
              const hIn = Math.round((v.ent / maxVal) * 130) || 0;
              const hOut = Math.round((v.sai / maxVal) * 130) || 0;
              return (
                <div className="trend-col" key={i}>
                  <div className="bar in" style={{ height: `${hIn}px` }} title={`Entradas: ${formatarValor(v.ent)}`}></div>
                  <div className="bar out" style={{ height: `${hOut}px` }} title={`Saídas: ${formatarValor(v.sai)}`}></div>
                </div>
              );
            })}
          </div>
          <div className="trend-labels">
            {historicoMeses.map((v, i) => <div key={i}>{v.mes}</div>)}
          </div>
          <div className="legend">
            <span><span className="dot in"></span>Entradas</span>
            <span><span className="dot out"></span>Saídas</span>
          </div>
        </div>
      </section>

      <section className="block">
        <h2 className="block-title">Para onde foi o dinheiro em {mesAtualStr}</h2>
        {divisaoDespesas.map((item, index) => {
          const percentagem = Math.round((item.valor / maxDivisao) * 100) || 0;
          return (
            <div className="breakdown-row" key={index}>
              <div className="breakdown-name">{item.nome}</div>
              <div className="breakdown-track">
                <div className="breakdown-fill" style={{ width: `${percentagem}%` }}></div>
              </div>
              <div className="breakdown-val">{formatarValor(item.valor)}</div>
            </div>
          );
        })}
      </section>

      <section className="block">
        <h2 className="block-title">Metas de investimento globais</h2>
        {metas.map((meta) => {
          if (meta.final) {
            const percentagem = Math.min(100, Math.round((meta.guardado / meta.final) * 100));
            return (
              <div className="goal" key={meta.id}>
                <div className="goal-top">
                  <span className="goal-name">{meta.desc}</span>
                  <span className="goal-nums">
                    {formatarValor(meta.guardado)} / {formatarValor(meta.final)} ({percentagem}%)
                  </span>
                </div>
                <div className="goal-track">
                  <div className="goal-fill" style={{ width: `${percentagem}%` }}></div>
                </div>
              </div>
            );
          } else {
            return (
              <div className="goal" key={meta.id}>
                <div className="goal-top">
                  <span className="goal-name">{meta.desc}</span>
                  <span className="goal-nums">
                    {formatarValor(meta.guardado)} guardados · meta indeterminada
                  </span>
                </div>
              </div>
            );
          }
        })}
      </section>
    </div>
  );
}