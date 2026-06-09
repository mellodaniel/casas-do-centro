import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ClipboardList,
  FilePenLine,
  Home,
  LogOut,
  UserRound,
  Users,
} from 'lucide-react';
import {
  getCurrentAdminUser,
  signOutAdmin,
} from '../lib/siteContentService';
import {
  getCurrentAdminProfile,
  type CurrentAdminProfile,
} from '../lib/adminUsersService';
import { AdminLogin } from './AdminLogin';
import { AdminHome } from './AdminHome';
import { AdminCrmManager } from './AdminCrmManager';
import { AdminUsersManager } from './AdminUsersManager';
import { AdminContentManager } from './AdminContentManager';
import './admin.css';

type AdminModule = 'home' | 'conteudo' | 'crm' | 'utilizadores';

function getCurrentAdminModuleFromPath(pathname: string): AdminModule {
  if (pathname.startsWith('/admin/conteudo')) {
    return 'conteudo';
  }

  if (pathname.startsWith('/admin/crm')) {
    return 'crm';
  }

  if (pathname.startsWith('/admin/utilizadores')) {
    return 'utilizadores';
  }

  return 'home';
}

function getModulePath(module: AdminModule) {
  if (module === 'conteudo') {
    return '/admin/conteudo';
  }

  if (module === 'crm') {
    return '/admin/crm';
  }

  if (module === 'utilizadores') {
    return '/admin/utilizadores';
  }

  return '/admin';
}

function getModuleTitle(module: AdminModule) {
  if (module === 'conteudo') {
    return 'Conteúdo do Website';
  }

  if (module === 'crm') {
    return 'CRM / Pedidos';
  }

  if (module === 'utilizadores') {
    return 'Utilizadores';
  }

  return 'Painel Administrativo';
}

function getModuleDescription(module: AdminModule) {
  if (module === 'conteudo') {
    return 'Editar textos, imagens, galeria, FAQ, modelos, vantagens e contactos.';
  }

  if (module === 'crm') {
    return 'Gerir contactos, pedidos, follow-ups e oportunidades comerciais.';
  }

  if (module === 'utilizadores') {
    return 'Gerir utilizadores, perfis e acessos ao painel administrativo.';
  }

  return 'Escolhe o módulo que pretendes gerir.';
}

export function AdminPanel() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<CurrentAdminProfile | null>(
    null
  );
  const [currentModule, setCurrentModule] = useState<AdminModule>(() =>
    getCurrentAdminModuleFromPath(window.location.pathname)
  );

  async function loadCurrentProfile() {
    const profile = await getCurrentAdminProfile();
    setCurrentProfile(profile);
  }

  function navigateTo(path: string) {
    window.history.pushState({}, '', path);
    setCurrentModule(getCurrentAdminModuleFromPath(path));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleModuleNavigation(
    event: React.MouseEvent<HTMLAnchorElement>,
    module: AdminModule
  ) {
    event.preventDefault();
    navigateTo(getModulePath(module));
  }

  useEffect(() => {
    function handlePopState() {
      setCurrentModule(getCurrentAdminModuleFromPath(window.location.pathname));
    }

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    async function checkUser() {
      const user = await getCurrentAdminUser();

      setIsAuthenticated(Boolean(user));
      setIsCheckingAuth(false);

      if (user) {
        await loadCurrentProfile();
      }
    }

    checkUser();
  }, []);

  async function handleLogout() {
    await signOutAdmin();
    setCurrentProfile(null);
    setIsAuthenticated(false);
    navigateTo('/admin');
  }

  if (isCheckingAuth) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <span className="admin-kicker">Área administrativa</span>
          <h1>A carregar...</h1>
          <p>A verificar sessão do painel administrativo.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLogin
        onLoginSuccess={async () => {
          setIsAuthenticated(true);
          await loadCurrentProfile();
          setCurrentModule(getCurrentAdminModuleFromPath(window.location.pathname));
        }}
      />
    );
  }

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div>
          <span className="admin-kicker">Área administrativa</span>
          <h1>Casas do Centro</h1>
          <p>{getModuleDescription(currentModule)}</p>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-sidebar-nav-group">
            <span>Painel</span>

            <a
              href="/admin"
              onClick={(event) => handleModuleNavigation(event, 'home')}
              className={currentModule === 'home' ? 'admin-nav-active' : ''}
            >
              <Home size={17} />
              Início
            </a>
          </div>

          <div className="admin-sidebar-nav-group">
            <span>Conteúdo</span>

            <a
              href="/admin/conteudo"
              onClick={(event) => handleModuleNavigation(event, 'conteudo')}
              className={currentModule === 'conteudo' ? 'admin-nav-active' : ''}
            >
              <FilePenLine size={17} />
              Website
            </a>
          </div>

          <div className="admin-sidebar-nav-group admin-sidebar-nav-crm">
            <span>Gestão comercial</span>

            <a
              href="/admin/crm"
              onClick={(event) => handleModuleNavigation(event, 'crm')}
              className={currentModule === 'crm' ? 'admin-nav-active' : ''}
            >
              <ClipboardList size={17} />
              CRM / Pedidos
            </a>
          </div>

          <div className="admin-sidebar-nav-group admin-sidebar-nav-management">
            <span>Gestão interna</span>

            <a
              href="/admin/utilizadores"
              onClick={(event) => handleModuleNavigation(event, 'utilizadores')}
              className={
                currentModule === 'utilizadores' ? 'admin-nav-active' : ''
              }
            >
              <Users size={17} />
              Utilizadores
            </a>
          </div>
        </nav>

        <div className="admin-sidebar-actions">
          {currentProfile && (
            <div className="admin-sidebar-current-user">
              <UserRound size={18} />
              <div>
                <strong>{currentProfile.name}</strong>
                <span>
                  @{currentProfile.username} ·{' '}
                  {currentProfile.role === 'admin' ? 'Administrador' : 'Editor'}
                </span>
              </div>
            </div>
          )}

          <a className="admin-back-link" href="/">
            <ArrowLeft size={18} />
            Voltar ao site
          </a>

          <button type="button" className="admin-logout-button" onClick={handleLogout}>
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <span className="admin-kicker">Ligado ao Supabase</span>
            <h2>{getModuleTitle(currentModule)}</h2>
          </div>

          <div className="admin-topbar-actions">
            {currentProfile && (
              <div className="admin-session-pill">
                <UserRound size={18} />
                <div>
                  <strong>{currentProfile.name}</strong>
                  <span>
                    @{currentProfile.username} ·{' '}
                    {currentProfile.role === 'admin' ? 'Administrador' : 'Editor'}
                  </span>
                </div>
              </div>
            )}

            {currentModule !== 'home' && (
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => navigateTo('/admin')}
              >
                <Home size={18} />
                Painel
              </button>
            )}

            <a className="admin-primary-link" href="/">
              Ver site
            </a>
          </div>
        </div>

        {currentModule === 'home' && <AdminHome onNavigate={navigateTo} />}

        {currentModule === 'conteudo' && <AdminContentManager />}

        {currentModule === 'crm' && <AdminCrmManager />}

        {currentModule === 'utilizadores' && <AdminUsersManager />}
      </main>
    </div>
  );
}