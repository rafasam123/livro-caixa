import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { formatarValor } from '../lib/format';
import { listarCategorias, adicionarCategoria, apagarCategoria } from '../data/categorias';
import { listarTransacoesPorGrupoMes } from '../data/transacoes';
import type { Categoria, Transacao } from '../types';

interface CategoriaPageProps {
  grupo: string;
  titulo: string;
}

const mesesAbrev = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// Paleta premium expandida
const CORES = ['#9C7C38', '#33604B', '#5B6459', '#D6CEC4', '#A9822E', '#9C4238', '#20281F'];

export default function CategoriaPage({ grupo, titulo }: CategoriaPageProps) {
  const [itens, setItens] = useState<Categoria[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataFiltro, setDataFiltro] = useState(new Date());

  const [novaDesc, setNovaDesc] = useState('');
  const [novoTipo, setNovoTipo] = useState('Fixo');
  
  // Estado para controlar qual fatia está selecionada
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const mesStr = `${mesesAbrev[dataFiltro.getMonth()]}/${dataFiltro.getFullYear().toString().slice(-2)}`;

  useEffect(() => {
    fetchDados();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIndex(null); // Reseta a seleção ao mudar de mês
  }, [grupo, dataFiltro]);

  async function fetchDados() {
    setLoading(true);
    const cats = await listarCategorias(grupo);
    setItens(cats);

    const trans = await listarTransacoesPorGrupoMes(grupo, dataFiltro);
    setTransacoes(trans);
    setLoading(false);
  }

  const prevMonth = () => setDataFiltro(new Date(dataFiltro.getFullYear(), dataFiltro.getMonth() - 1, 1));
  const nextMonth = () => setDataFiltro(new Date(dataFiltro.getFullYear(), dataFiltro.getMonth() + 1, 1));

  async function handleAdicionar() {
    if (!novaDesc) return;
    await adicionarCategoria({ grupo, descricao: novaDesc, tipo: novoTipo });
    setNovaDesc('');
    fetchDados();
  }

  async function handleApagar(id: string) {
    if (window.confirm('Apagar este item da tua lista de opções?')) {
      await apagarCategoria(id);
      fetchDados();
    }
  }

  // Prepara os dados para o gráfico
  const dadosGrafico = itens.map(item => {
    const total = transacoes
      .filter(t => t.categoria_id === item.id)
      .reduce((acc, curr) => acc + Number(curr.valor), 0);
    return { id: item.id, name: item.descricao, value: total };
  }).filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const totalMes = transacoes.reduce((acc, curr) => acc + Number(curr.valor), 0);

  // Lógica para o que aparece no meio e na lista em baixo
  const itemSelecionado = selectedIndex !== null ? dadosGrafico[selectedIndex] : null;
  const transacoesDaCategoria = itemSelecionado 
    ? transacoes.filter(t => t.categoria_id === itemSelecionado.id).sort((a, b) => b.valor - a.valor)
    : [];

  const textoCentroTitulo = itemSelecionado ? itemSelecionado.name : 'Total do Mês';
  const textoCentroValor = itemSelecionado ? formatarValor(itemSelecionado.value) : formatarValor(totalMes);
  const textoCentroPercent = itemSelecionado 
    ? `${((itemSelecionado.value / totalMes) * 100).toFixed(1)}%` 
    : '100%';

  // Função para desenhar as fatias: Aplica o tamanho extra na selecionada e opacidade nas restantes
  const renderActiveShape = (props: { cx: number; cy: number; innerRadius: number; outerRadius: number; startAngle: number; endAngle: number; fill?: string; index: number }) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, index } = props;
    const isSelected = selectedIndex === index;
    const isFaded = selectedIndex !== null && !isSelected;

    return (
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius}
        outerRadius={isSelected ? outerRadius + 6 : outerRadius} 
        startAngle={startAngle} endAngle={endAngle}
        fill={fill}
        cornerRadius={4}
        stroke="none"
        style={{ 
          outline: 'none', 
          opacity: isFaded ? 0.3 : 1, 
          transition: 'all 0.3s ease' 
        }}
      />
    );
  };

  return (
    <div className="fade-in">
      <div className="top-row">
        <h1 id="page-title">{titulo}</h1>
        <div className="month-nav">
          <button onClick={prevMonth} className="nav-btn">‹</button>
          <span className="month-label" style={{ textTransform: 'capitalize' }}>{mesStr}</span>
          <button onClick={nextMonth} className="nav-btn">›</button>
        </div>
      </div>

      {loading ? (
        <p className="empty-note">A carregar dados...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* SECÇÃO 1: GRÁFICO INTERATIVO E DETALHES */}
          <section className="block" style={{ padding: '32px 24px', background: '#fff', borderRadius: '12px', border: '1px solid var(--line)' }}>
            
            {dadosGrafico.length > 0 ? (
              <>
                <div style={{ position: 'relative', width: '100%', height: 300 }}>
                  
                  {/* TEXTOS NO CENTRO DO GRÁFICO */}
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none', zIndex: 10, width: '150px' }}>
                    <div style={{ color: 'var(--ink-soft)', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
                      {textoCentroTitulo}
                    </div>
                    <div style={{ color: 'var(--ink)', fontSize: '24px', fontFamily: 'IBM Plex Mono', fontWeight: 600 }}>
                      {textoCentroValor}
                    </div>
                    <div style={{ color: 'var(--ink-soft)', fontSize: '13px', marginTop: '4px' }}>
                      {textoCentroPercent}
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart style={{ outline: 'none' }}>
                      <Pie
                        data={dadosGrafico}
                        cx="50%" cy="50%"
                        innerRadius={90} 
                        outerRadius={115} 
                        paddingAngle={4}
                        cornerRadius={4}
                        dataKey="value"
                        stroke="none"
                        shape={renderActiveShape} 
                        onClick={(_, index) => setSelectedIndex(selectedIndex === index ? null : index)}
                        style={{ outline: 'none', cursor: 'pointer' }}
                      >
                        {dadosGrafico.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} style={{ outline: 'none' }} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* LEGENDA DE CORES (Aparece em baixo da pizza) */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
                  {dadosGrafico.map((d, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedIndex(selectedIndex === i ? null : i)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        cursor: 'pointer',
                        opacity: selectedIndex !== null && selectedIndex !== i ? 0.4 : 1,
                        transition: 'opacity 0.3s'
                      }}
                    >
                      <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: CORES[i % CORES.length] }}></div>
                      <span style={{ fontSize: '13.5px', color: 'var(--ink)', fontWeight: 500 }}>{d.name}</span>
                    </div>
                  ))}
                </div>

                {/* LISTA DE DETALHES (Visão Geral vs Transações Específicas) */}
                <div style={{ marginTop: '32px', borderTop: '1px solid var(--line)', paddingTop: '24px' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontFamily: 'Fraunces', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {itemSelecionado ? (
                        <>
                          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: CORES[selectedIndex! % CORES.length] }}></span>
                          Compras de {itemSelecionado.name}
                        </>
                      ) : (
                        'Visão Geral das Categorias'
                      )}
                    </h3>
                    
                    {itemSelecionado && (
                      <button onClick={() => setSelectedIndex(null)} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '13.5px', fontWeight: 600 }}>
                        ‹ Voltar ao Total
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {itemSelecionado === null ? (
                      // Mostrar resumo de todas as categorias
                      dadosGrafico.map((d, i) => {
                        const percent = (d.value / totalMes) * 100;
                        return (
                          <div key={i} onClick={() => setSelectedIndex(i)} style={{ cursor: 'pointer' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '6px' }}>
                              <span>{d.name}</span>
                              <span style={{ fontFamily: 'IBM Plex Mono' }}>{formatarValor(d.value)} ({percent.toFixed(1)}%)</span>
                            </div>
                            <div style={{ height: '6px', background: '#F0EBE1', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${percent}%`, background: CORES[i % CORES.length], borderRadius: '3px' }}></div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      // Mostrar compras individuais da categoria selecionada
                      transacoesDaCategoria.map((t, i) => {
                        const percent = (t.valor / itemSelecionado.value) * 100;
                        return (
                          <div key={i}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '6px' }}>
                              {/* Tenta usar observacao, depois nome, senão "Sem descrição" */}
                              <span style={{ color: 'var(--ink)' }}>{t.observacao || t.nome || 'Sem descrição'}</span>
                              <span style={{ fontFamily: 'IBM Plex Mono', color: 'var(--ink-soft)' }}>{formatarValor(t.valor)} ({percent.toFixed(1)}%)</span>
                            </div>
                            <div style={{ height: '6px', background: '#F0EBE1', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${percent}%`, background: CORES[selectedIndex! % CORES.length], borderRadius: '3px' }}></div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    
                    {itemSelecionado !== null && transacoesDaCategoria.length === 0 && (
                      <p className="empty-note">Não existem compras detalhadas para esta categoria.</p>
                    )}

                  </div>
                </div>
              </>
            ) : (
              <p className="empty-note" style={{ textAlign: 'center', marginTop: '20px' }}>
                Nenhum lançamento registado nesta categoria em {mesStr}.
              </p>
            )}
          </section>

          {/* SECÇÃO 2: TABELA DE GESTÃO */}
          <section className="block" style={{ padding: '24px', background: '#fff', borderRadius: '12px', border: '1px solid var(--line)' }}>
            <h2 style={{ fontFamily: 'Fraunces', fontSize: '18px', marginBottom: '16px', color: '#2c2c2c' }}>Gerir Opções</h2>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', marginBottom: '24px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--line)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 8px' }}>Descrição</th>
                    <th style={{ padding: '12px 8px' }}>Tipo</th>
                    <th style={{ padding: '12px 8px', width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #F0F0F0' }}>
                      <td style={{ padding: '12px 8px', color: '#2c2c2c' }}>{item.descricao}</td>
                      <td style={{ padding: '12px 8px' }}><span className="tipo-tag">{item.tipo}</span></td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}><button className="del-btn" onClick={() => handleApagar(item.id)}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="today-list">
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input type="text" placeholder="Nova opção (ex: Uber)" value={novaDesc} onChange={e => setNovaDesc(e.target.value)} style={{ flex: 1, minWidth: '140px', padding: '10px', borderRadius: '6px', border: '1px solid var(--line)' }} />
                <select value={novoTipo} onChange={e => setNovoTipo(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--line)', background: '#fff' }}>
                  <option value="Fixo">Fixo</option>
                  <option value="Variável">Variável</option>
                </select>
                <button className="add-btn" onClick={handleAdicionar} style={{ borderRadius: '6px' }}>Adicionar</button>
              </div>
            </div>
          </section>

        </div>
      )}
    </div>
  );
}