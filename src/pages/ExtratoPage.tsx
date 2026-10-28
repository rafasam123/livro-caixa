import { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import { formatarValor } from '../lib/format';
import { labelGrupo } from '../lib/grupos';
import { listarTransacoesPorMes, apagarTransacao } from '../data/transacoes';
import type { Transacao } from '../types';

const mesesAbrev = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

export default function ExtratoPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataFiltro, setDataFiltro] = useState(new Date());
  
  const [filtroGrupo, setFiltroGrupo] = useState('todos');
  const [filtroItem, setFiltroItem] = useState('todos');
  const [isGerandoPDF, setIsGerandoPDF] = useState(false);

  const mesStr = `${mesesAbrev[dataFiltro.getMonth()]} de ${dataFiltro.getFullYear()}`;

  useEffect(() => {
    fetchDados();
  }, [dataFiltro]);

  async function fetchDados() {
    setLoading(true);
    const data = await listarTransacoesPorMes(dataFiltro);
    setTransacoes(data);
    setLoading(false);
  }

  const prevMonth = () => setDataFiltro(new Date(dataFiltro.getFullYear(), dataFiltro.getMonth() - 1, 1));
  const nextMonth = () => setDataFiltro(new Date(dataFiltro.getFullYear(), dataFiltro.getMonth() + 1, 1));

  async function handleDeletar(id: string) {
    if (window.confirm('Tens a certeza que queres apagar este lançamento?')) {
      await apagarTransacao(id);
      fetchDados();
    }
  }

  const gerarPDF = () => {
    setIsGerandoPDF(true);
    setTimeout(() => {
      const elemento = document.getElementById('relatorio-pdf');
      if (!elemento) { setIsGerandoPDF(false); return; }

      const opcoes = {
        margin: 15,
        filename: `Extrato_${mesStr.replace(' ', '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      html2pdf().set(opcoes as any).from(elemento).save().then(() => {
        setIsGerandoPDF(false);
      });
    }, 100);
  };
  
  const transacoesDoGrupo = filtroGrupo === 'todos' ? transacoes : transacoes.filter(t => t.grupo === filtroGrupo);
  const itensDisponiveis = Array.from(new Set(transacoesDoGrupo.map(t => t.descricao_item)));
  const transacoesFiltradas = filtroItem === 'todos' ? transacoesDoGrupo : transacoesDoGrupo.filter(t => t.descricao_item === filtroItem);

  const totalEntradas = transacoesFiltradas.filter(t => t.grupo === 'entradas').reduce((acc, curr) => acc + Number(curr.valor), 0);
  const totalSaidas = transacoesFiltradas.filter(t => t.grupo !== 'entradas').reduce((acc, curr) => acc + Number(curr.valor), 0);
  const saldoFinal = totalEntradas - totalSaidas;

  return (
    <div className="fade-in">
      <div className="top-row">
        <h1 id="page-title">Extrato Mensal</h1>
        <div className="month-nav">
          <button onClick={prevMonth} className="nav-btn">‹</button>
          <span className="month-label" style={{ textTransform: 'capitalize' }}>{mesStr}</span>
          <button onClick={nextMonth} className="nav-btn">›</button>
        </div>
      </div>

      <div className="extrato-controls">
        <button className="add-btn" onClick={gerarPDF} disabled={transacoes.length === 0} style={{ padding: '10px 24px', width: 'auto' }}>
          Baixar PDF
        </button>
        
        <select className="filter-select" value={filtroGrupo} onChange={e => { setFiltroGrupo(e.target.value); setFiltroItem('todos'); }}>
          <option value="todos">Todas as categorias</option>
          <option value="entradas">Entradas</option>
          <option value="custosFixos">Custos fixos</option>
          <option value="custosVariaveis">Custos variáveis</option>
          <option value="dividas">Dívidas</option>
          <option value="investimentos">Investimentos</option>
        </select>

        {filtroGrupo !== 'todos' && (
          <select className="filter-select" value={filtroItem} onChange={e => setFiltroItem(e.target.value)}>
            <option value="todos">Todos os itens</option>
            {itensDisponiveis.map(item => (
              <option key={item as string} value={item as string}>{item as string}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <p className="empty-note">A carregar dados...</p>
      ) : (
        <section className="block" id="relatorio-pdf" style={{ padding: '20px', background: '#fff', borderRadius: '8px' }}>
          <h2 style={{ fontFamily: 'Fraunces', fontSize: '20px', marginBottom: '16px', color: '#2C2C2C' }}>
            Relatório Financeiro — {mesStr}
            {(filtroGrupo !== 'todos' || filtroItem !== 'todos') && <span style={{fontSize: '14px', color: '#666', fontWeight: 'normal'}}> (Filtrado)</span>}
          </h2>
          
          {transacoesFiltradas.length === 0 ? (
            <p className="empty-note" style={{ textAlign: 'left' }}>Não há movimentos para esta pesquisa.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #EAE4D3', textAlign: 'left' }}>
                  <th style={{ padding: '12px 8px' }}>Data</th>
                  <th style={{ padding: '12px 8px' }}>Categoria</th>
                  <th style={{ padding: '12px 8px' }}>Descrição</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right' }}>Valor</th>
                  {!isGerandoPDF && <th style={{ padding: '12px 8px' }}></th>}
                </tr>
              </thead>
              <tbody>
                {transacoesFiltradas.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #F0F0F0' }}>
                    <td style={{ padding: '12px 8px' }}>{t.data.split('-').reverse().join('/')}</td>
                    <td style={{ padding: '12px 8px', textTransform: 'capitalize' }}>{labelGrupo(t.grupo)}</td>
                    <td style={{ padding: '12px 8px' }}>{t.descricao_item} {t.observacao && `(${t.observacao})`}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', color: t.grupo === 'entradas' ? '#4F7959' : '#B24238' }}>
                      {t.grupo === 'entradas' ? '+' : '-'} {formatarValor(t.valor)}
                    </td>
                    {!isGerandoPDF && (
                      <td style={{ padding: '12px 8px', textAlign: 'center', width: '40px' }}>
                        <button className="del-btn" onClick={() => handleDeletar(t.id)} style={{ padding: '4px 8px' }}>✕</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} style={{ padding: '16px 8px', fontWeight: 'bold', textAlign: 'right' }}>
                    {filtroGrupo === 'todos' ? 'Saldo Final do Mês:' : 'Total filtrado:'}
                  </td>
                  <td style={{ padding: '16px 8px', fontWeight: 'bold', textAlign: 'right', color: (filtroGrupo === 'todos' && filtroItem === 'todos') ? (saldoFinal >= 0 ? '#4F7959' : '#B24238') : '#2c2c2c' }}>
                    {formatarValor((filtroGrupo === 'todos' && filtroItem === 'todos') ? saldoFinal : (totalEntradas > 0 ? totalEntradas : totalSaidas))}
                  </td>
                  {!isGerandoPDF && <td></td>}
                </tr>
              </tfoot>
            </table>
          )}
        </section>
      )}
    </div>
  );
}