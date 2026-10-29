// src/components/Sidebar.tsx
import { supabase } from '../supabaseClient';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export default function Sidebar({ activeSection, setActiveSection }: SidebarProps) {
  const handleLogout = async () => {
    localStorage.removeItem('lembrar_login');
    await supabase.auth.signOut();
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        Livro-<span>caixa</span>
      </div>
      
      <nav style={{ flex: 1 }}>
        <div className="nav-group">
          <div className="nav-label">Dia a dia</div>
          <button className={activeSection === 'lancar' ? 'active' : ''} onClick={() => setActiveSection('lancar')}>
            Lançar
          </button>
          <button className={activeSection === 'extrato' ? 'active' : ''} onClick={() => setActiveSection('extrato')}>
            Extrato
          </button>
          <button className={activeSection === 'dashboard' ? 'active' : ''} onClick={() => setActiveSection('dashboard')}>
            Visão geral
          </button>
        </div>

        <div className="nav-group">
          <div className="nav-label">Categorias</div>
          <button className={activeSection === 'entradas' ? 'active' : ''} onClick={() => setActiveSection('entradas')}>Entradas</button>
          <button className={activeSection === 'custos-fixos' ? 'active' : ''} onClick={() => setActiveSection('custos-fixos')}>Custos fixos</button>
          <button className={activeSection === 'custos-variaveis' ? 'active' : ''} onClick={() => setActiveSection('custos-variaveis')}>Custos variáveis</button>
          <button className={activeSection === 'dividas' ? 'active' : ''} onClick={() => setActiveSection('dividas')}>Dívidas</button>
          <button className={activeSection === 'investimentos' ? 'active' : ''} onClick={() => setActiveSection('investimentos')}>Investimentos</button>
        </div>
      </nav>

      <div style={{ padding: '24px', borderTop: '1px solid #EAE4D3' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '12px', background: 'transparent', border: '1px solid #D6CEC4',
            color: '#8C7B50', fontWeight: 600, cursor: 'pointer', borderRadius: '6px',
            transition: 'all 0.2s ease-in-out', fontSize: '14px'
          }}
          onMouseOver={e => { e.currentTarget.style.background = '#EAE4D3'; e.currentTarget.style.color = '#6b5c37'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8C7B50'; }}
        >
          Sair da conta
        </button>
        <div style={{ marginTop: '16px', fontSize: '11px', color: '#999', textAlign: 'center', lineHeight: '1.4' }}>
          Sistema financeiro<br/>sincronizado em tempo real.
        </div>
      </div>
    </aside>
  );
}