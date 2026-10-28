import { useState, useEffect, type ReactNode } from 'react';
import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';
import Sidebar from './components/Sidebar';
import LancarPage from './pages/LancarPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import CategoriaPage from './pages/CategoriaPage';
import ExtratoPage from './pages/ExtratoPage';

const SECTIONS: Record<string, ReactNode> = {
  lancar: <LancarPage />,
  dashboard: <DashboardPage />,
  entradas: <CategoriaPage grupo="entradas" titulo="Entradas" />,
  'custos-fixos': <CategoriaPage grupo="custosFixos" titulo="Custos fixos" />,
  'custos-variaveis': <CategoriaPage grupo="custosVariaveis" titulo="Custos variáveis" />,
  dividas: <CategoriaPage grupo="dividas" titulo="Dívidas" />,
  investimentos: <CategoriaPage grupo="investimentos" titulo="Investimentos" />,
  extrato: <ExtratoPage />,
};

// Proteção Anti-Curiosos (Bloqueia cliques e atalhos)
if (import.meta.env.PROD) { // Só ativa em produção, para não te chatear enquanto programas
  
  // Bloqueia o botão direito do rato
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // Bloqueia atalhos do teclado (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12') e.preventDefault();
    // Ctrl + Shift + I (Inspetor)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') e.preventDefault();
    // Ctrl + Shift + J (Consola)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') e.preventDefault();
    // Ctrl + U (Ver código fonte)
    if (e.ctrlKey && e.key === 'U') e.preventDefault();
    // Ctrl + S (Guardar página)
    if (e.ctrlKey && e.key === 'S') e.preventDefault();
  });
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [activeSection, setActiveSection] = useState('lancar');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verificarSessao = async () => {
      // 1. Lê a escolha do utilizador e verifica se a aba atual já estava validada
      const lembrarLogin = localStorage.getItem('lembrar_login');
      const sessaoAtiva = sessionStorage.getItem('sessao_ativa');

      // Se desmarcou a caixa E não tem a sessão ativa temporária (ex: fechou o PC/App e voltou)
      if (lembrarLogin === 'false' && !sessaoAtiva) {
        await supabase.auth.signOut();
      } else {
        // Marca que esta aba atual está validada para navegar
        sessionStorage.setItem('sessao_ativa', 'true');
      }

      // 2. Só depois da verificação de segurança é que puxa a conta do Supabase
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setIsChecking(false);
    };

    verificarSessao();

    // Fica à escuta de logins/logouts
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isChecking) {
    return <div className="fade-in"><p style={{textAlign: 'center', marginTop: '40vh', color: 'var(--ink-soft)'}}>A verificar segurança...</p></div>;
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <div className="app">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <main>{SECTIONS[activeSection]}</main>
    </div>
  );
}

export default App;