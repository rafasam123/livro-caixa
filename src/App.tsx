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
if (import.meta.env.PROD) {
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  document.addEventListener('keydown', (e) => {
    if (e.key === 'F12') e.preventDefault();
    if (e.ctrlKey && e.shiftKey && e.key === 'I') e.preventDefault();
    if (e.ctrlKey && e.shiftKey && e.key === 'J') e.preventDefault();
    if (e.ctrlKey && e.key === 'U') e.preventDefault();
    if (e.ctrlKey && e.key === 'S') e.preventDefault();
  });
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [activeSection, setActiveSection] = useState('lancar');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verificarSessao = async () => {
      const lembrarLogin = localStorage.getItem('lembrar_login');
      const sessaoAtiva = sessionStorage.getItem('sessao_ativa');

      if (lembrarLogin === 'false' && !sessaoAtiva) {
        await supabase.auth.signOut();
      } else {
        sessionStorage.setItem('sessao_ativa', 'true');
      }

      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setIsChecking(false);
    };

    verificarSessao();

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