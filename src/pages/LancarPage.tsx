import { useState, useEffect } from 'react';
import { formatarValor } from '../lib/format';
import { labelGrupo } from '../lib/grupos';
import { listarCategorias, criarCategoriasPadrao } from '../data/categorias';
import { listarTransacoesRecentes, inserirTransacao, apagarTransacao } from '../data/transacoes';
import type { Categoria, Transacao } from '../types';

export default function LancarPage() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('entradas');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados do Formulário
  const [dataLanc, setDataLanc] = useState(new Date().toISOString().split('T')[0]);
  const [itemSelecionado, setItemSelecionado] = useState('');
  const [valor, setValor] = useState('');
  const [observacao, setObservacao] = useState('');

  useEffect(() => {
    fetchDados();
  }, [categoriaSelecionada]); 
  // O useEffect agora reage se a categoria selecionada mudar, garantindo que o itemSelecionado acompanha

  async function fetchDados() {
    let cats = await listarCategorias();

    if (cats.length === 0) {
      await criarCategoriasPadrao();
      cats = await listarCategorias();
    }

    if (cats) {
      setCategorias(cats);
      const itensDestaCat = cats.filter(c => c.grupo === categoriaSelecionada);
      if (itensDestaCat.length > 0 && !itemSelecionado) {
        setItemSelecionado(itensDestaCat[0].id);
      }
    }

    const trans = await listarTransacoesRecentes(10);
    setTransacoes(trans);

    setLoading(false);
  }

  const handleCatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const novoGrupo = e.target.value;
    setCategoriaSelecionada(novoGrupo);
    const itensDestaCat = categorias.filter(c => c.grupo === novoGrupo);
    setItemSelecionado(itensDestaCat.length > 0 ? itensDestaCat[0].id : '');
  };

  async function handleLancar() {
    if (!itemSelecionado || !valor || isNaN(Number(valor))) {
      alert("Preenche o valor corretamente.");
      return;
    }

    const categoriaInfo = categorias.find(c => c.id === itemSelecionado);

    const novaTransacao = {
      data: dataLanc,
      grupo: categoriaSelecionada,
      categoria_id: itemSelecionado,
      descricao_item: categoriaInfo ? categoriaInfo.descricao : 'Item desconhecido',
      valor: Number(valor),
      observacao: observacao
    };

    try {
      await inserirTransacao(novaTransacao);
      setValor('');
      setObservacao('');
      fetchDados();
    } catch (error) {
      console.error(error);
      alert('Erro ao guardar lançamento.');
    }
  }

  async function handleDeletar(id: string) {
    await apagarTransacao(id);
    fetchDados();
  }

  const itensExibidos = categorias.filter(c => c.grupo === categoriaSelecionada);

  if (loading) return <div className="fade-in"><p className="empty-note">A sincronizar com a base de dados...</p></div>;

  return (
    <div className="fade-in">
      <div className="top-row">
        <h1 id="page-title">Lançar</h1>
      </div>

      <div className="form-panel">
        <div className="form-grid">
          <div className="field">
            <label>Data</label>
            <input type="date" value={dataLanc} onChange={e => setDataLanc(e.target.value)} />
          </div>
          
          <div className="field">
            <label>Categoria</label>
            <select value={categoriaSelecionada} onChange={handleCatChange}>
              <option value="entradas">Entradas</option>
              <option value="custosFixos">Custos fixos</option>
              <option value="custosVariaveis">Custos variáveis</option>
              <option value="dividas">Dívidas</option>
              <option value="investimentos">Investimentos</option>
            </select>
          </div>

          <div className="field">
            <label>Item</label>
            <select value={itemSelecionado} onChange={e => setItemSelecionado(e.target.value)}>
              {itensExibidos.map(item => (
                <option key={item.id} value={item.id}>{item.descricao}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Valor (R$)</label>
            <input 
              type="number" step="0.01" className="val-input" placeholder="0.00" 
              value={valor} onChange={e => setValor(e.target.value)} 
            />
          </div>

          <div className="field span2">
            <label>Observação (opcional)</label>
            <input 
              type="text" placeholder="ex: mercado da semana, uber pro trabalho..." 
              value={observacao} onChange={e => setObservacao(e.target.value)} 
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="add-btn" onClick={handleLancar}>Lançar</button>
        </div>
      </div>

      <section className="block today-list">
        <h2 className="block-title">Últimos lançamentos</h2>
        {transacoes.length === 0 ? (
          <p className="empty-note">Nenhum lançamento registado.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Categoria</th>
                <th>Item</th>
                <th className="num">Valor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {transacoes.map(t => (
                <tr key={t.id}>
                  <td className="mono-val">{t.data.split('-').reverse().join('/')}</td>
                  <td>
                    <span className={`cat-tag ${t.grupo === 'entradas' ? 'entradas' : t.grupo === 'investimentos' ? 'investimentos' : 'saida'}`}>
                      {labelGrupo(t.grupo)}
                    </span>
                  </td>
                  <td>
                    {t.descricao_item} {t.observacao && <span style={{ color: 'var(--ink-soft)' }}>— {t.observacao}</span>}
                  </td>
                  <td className="num mono-val">{formatarValor(t.valor)}</td>
                  <td><button className="del-btn" onClick={() => handleDeletar(t.id)}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}