import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { criarCategoriasPadrao } from '../data/categorias';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [lembrar, setLembrar] = useState(true);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert("Erro ao entrar: " + error.message);
      } else {
        // Lógica do Lembrar-me
        if (lembrar) {
          localStorage.setItem('lembrar_login', 'true');
        } else {
          localStorage.setItem('lembrar_login', 'false');
          sessionStorage.setItem('sessao_ativa', 'true'); // Marca a aba atual como permitida
        }
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        alert("Erro no registo: " + error.message);
      } else if (data.user) {
        await criarCategoriasPadrao();
        alert("Registo feito com sucesso! Já podes entrar.");
        setIsLogin(true);
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
      <div className="form-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="brand" style={{ textAlign: 'center', border: 'none', padding: '0 0 20px 0' }}>
          Livro-<span>caixa</span>
        </div>
        
        <form onSubmit={handleAuth} className="field" style={{ gap: '14px' }}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Palavra-passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          {/* Caixinha de Manter Logado (só aparece no Login) */}
          {isLogin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
              <input 
                type="checkbox" 
                id="lembrar" 
                checked={lembrar} 
                onChange={e => setLembrar(e.target.checked)} 
                style={{ width: 'auto' }}
              />
              <label htmlFor="lembrar" style={{ fontSize: '13px', margin: 0, fontWeight: 'normal', color: 'var(--ink-soft)' }}>
                Manter-me com a sessão iniciada
              </label>
            </div>
          )}

          <button type="submit" className="add-btn" disabled={loading} style={{ marginTop: '10px' }}>
            {loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Criar Conta')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
          <button className="del-btn" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Ainda não tens conta? Regista-te' : 'Já tens conta? Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
}