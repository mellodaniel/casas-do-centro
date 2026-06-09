import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import {
  BadgeCheck,
  Info,
  Plus,
  RefreshCcw,
  Save,
  ShieldCheck,
  Users,
} from 'lucide-react';
import {
  createAdminUser,
  getCurrentAdminProfile,
  listAdminUsers,
  updateAdminUser,
  type AdminUser,
  type AdminUserRole,
  type CurrentAdminProfile,
} from '../lib/adminUsersService';

type NewUserForm = {
  name: string;
  username: string;
  password: string;
  role: AdminUserRole;
  active: boolean;
};

const emptyForm: NewUserForm = {
  name: '',
  username: '',
  password: '',
  role: 'editor',
  active: true,
};

function normalizeUsername(username: string) {
  return username
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9._-]/g, '');
}

function createTechnicalEmail(username: string) {
  return `${normalizeUsername(username)}@casasdocentro.pt`;
}

function getFriendlyErrorMessage(error: unknown) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (
      message.includes('only active admins') ||
      message.includes('forbidden') ||
      message.includes('403')
    ) {
      return 'O teu perfil é Editor. Apenas utilizadores com perfil Administrador podem consultar, criar ou alterar outros utilizadores.';
    }

    if (message.includes('already registered') || message.includes('already exists')) {
      return 'Já existe um utilizador com esse email técnico ou username.';
    }

    if (message.includes('password')) {
      return 'A password deve ter pelo menos 8 caracteres.';
    }

    return error.message;
  }

  return 'Não foi possível concluir a operação.';
}

export function AdminUsersManager() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentProfile, setCurrentProfile] = useState<CurrentAdminProfile | null>(null);
  const [form, setForm] = useState<NewUserForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'warning' | 'info'>('info');

  const canManageUsers = currentProfile?.role === 'admin' && currentProfile.active;

  async function loadCurrentProfile() {
    const profile = await getCurrentAdminProfile();
    setCurrentProfile(profile);
    return profile;
  }

  async function loadUsers() {
    setIsLoading(true);
    setStatusMessage('');

    try {
      const profile = currentProfile || (await loadCurrentProfile());

      if (!profile || profile.role !== 'admin' || !profile.active) {
        setUsers([]);
        setStatusType('info');
        setStatusMessage(
          'O teu perfil é Editor. Podes editar o conteúdo do website, mas a gestão de utilizadores está disponível apenas para Administradores.'
        );
        return;
      }

      const adminUsers = await listAdminUsers();
      setUsers(adminUsers);
    } catch (error) {
      setUsers([]);
      setStatusType('warning');
      setStatusMessage(getFriendlyErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    async function initialize() {
      await loadCurrentProfile();
      await loadUsers();
    }

    initialize();
  }, []);

  function updateFormField<K extends keyof NewUserForm>(
    field: K,
    value: NewUserForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canManageUsers) {
      setStatusType('info');
      setStatusMessage(
        'Apenas utilizadores com perfil Administrador podem criar novos utilizadores.'
      );
      return;
    }

    const username = normalizeUsername(form.username);

    if (!username) {
      setStatusType('warning');
      setStatusMessage('Indica um utilizador válido.');
      return;
    }

    setIsSaving(true);
    setStatusMessage('');

    try {
      await createAdminUser({
        name: form.name.trim(),
        username,
        email: createTechnicalEmail(username),
        password: form.password,
        role: form.role,
        active: form.active,
      });

      setForm(emptyForm);
      await loadUsers();
      setStatusType('success');
      setStatusMessage('Utilizador criado com sucesso.');
    } catch (error) {
      setStatusType('warning');
      setStatusMessage(getFriendlyErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleActive(user: AdminUser) {
    if (!canManageUsers) {
      setStatusType('info');
      setStatusMessage(
        'Apenas utilizadores com perfil Administrador podem alterar o estado dos utilizadores.'
      );
      return;
    }

    if (user.auth_user_id === currentProfile?.auth_user_id) {
      setStatusType('info');
      setStatusMessage(
        'Não podes alterar o estado do teu próprio utilizador enquanto estás com a sessão iniciada.'
      );
      return;
    }

    setIsSaving(true);
    setStatusMessage('');

    try {
      await updateAdminUser({
        id: user.id,
        active: !user.active,
      });

      await loadUsers();
      setStatusType('success');
      setStatusMessage('Estado do utilizador atualizado.');
    } catch (error) {
      setStatusType('warning');
      setStatusMessage(getFriendlyErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleChangeRole(user: AdminUser, role: AdminUserRole) {
    if (!canManageUsers) {
      setStatusType('info');
      setStatusMessage(
        'Apenas utilizadores com perfil Administrador podem alterar perfis.'
      );
      return;
    }

    setIsSaving(true);
    setStatusMessage('');

    try {
      await updateAdminUser({
        id: user.id,
        role,
      });

      await loadUsers();
      setStatusType('success');
      setStatusMessage('Perfil do utilizador atualizado.');
    } catch (error) {
      setStatusType('warning');
      setStatusMessage(getFriendlyErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRefresh() {
    await loadUsers();
  }

  const technicalEmailPreview = form.username
    ? createTechnicalEmail(form.username)
    : 'utilizador@casasdocentro.pt';

  return (
    <div id="utilizadores" className="admin-card">
      <div className="admin-card-heading">
        <Users size={22} />
        <div>
          <h3>Utilizadores</h3>
          <p>Gerir pessoas com acesso ao painel de administração do website.</p>
        </div>
      </div>

      {currentProfile && (
        <div className="admin-current-user-box">
          <div>
            <strong>Sessão atual</strong>
            <span>
              {currentProfile.name} · @{currentProfile.username}
            </span>
            <small>
              Perfil: {currentProfile.role === 'admin' ? 'Administrador' : 'Editor'}
            </small>
          </div>
          <div
            className={
              currentProfile.role === 'admin'
                ? 'admin-current-user-role admin-current-user-role-admin'
                : 'admin-current-user-role admin-current-user-role-editor'
            }
          >
            {currentProfile.role === 'admin' ? 'Administrador' : 'Editor'}
          </div>
        </div>
      )}

      {statusMessage && (
        <div
          className={
            statusType === 'success'
              ? 'admin-alert admin-alert-success'
              : statusType === 'warning'
                ? 'admin-alert admin-alert-warning'
                : 'admin-alert admin-alert-info'
          }
        >
          {statusMessage}
        </div>
      )}

      {!canManageUsers && (
        <div className="admin-permission-note">
          <Info size={20} />
          <div>
            <strong>Gestão disponível apenas para Administradores</strong>
            <p>
              O teu utilizador pode continuar a editar o conteúdo do website, mas não pode
              consultar, criar ou alterar outros utilizadores.
            </p>
          </div>
        </div>
      )}

      <form className="admin-users-form" onSubmit={handleCreateUser}>
        <div className="admin-users-form-heading">
          <div>
            <strong>Novo utilizador</strong>
            <p>Cria um novo acesso para outra pessoa administrar o site.</p>
          </div>
          <Plus size={22} />
        </div>

        <div className="admin-two-fields">
          <label>
            Nome
            <input
              value={form.name}
              onChange={(event) => updateFormField('name', event.target.value)}
              placeholder="Ex: Maria Silva"
              required
              disabled={!canManageUsers}
            />
          </label>

          <label>
            Utilizador
            <input
              value={form.username}
              onChange={(event) =>
                updateFormField('username', normalizeUsername(event.target.value))
              }
              placeholder="Ex: maria"
              required
              disabled={!canManageUsers}
            />
          </label>
        </div>

        <div className="admin-two-fields">
          <label>
            Password inicial
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateFormField('password', event.target.value)}
              placeholder="Mínimo 8 caracteres"
              minLength={8}
              required
              disabled={!canManageUsers}
            />
          </label>

          <label>
            Perfil
            <select
              value={form.role}
              onChange={(event) =>
                updateFormField('role', event.target.value as AdminUserRole)
              }
              disabled={!canManageUsers}
            >
              <option value="editor">Editor</option>
              <option value="admin">Administrador</option>
            </select>
          </label>
        </div>

        <div className="admin-two-fields">
          <label>
            Estado
            <select
              value={form.active ? 'active' : 'inactive'}
              onChange={(event) =>
                updateFormField('active', event.target.value === 'active')
              }
              disabled={!canManageUsers}
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </label>

          <div className="admin-technical-email-preview">
            <strong>Email técnico automático</strong>
            <span>{technicalEmailPreview}</span>
            <small>
              Este email é usado apenas internamente para autenticação. A pessoa entra no
              painel usando o campo “Utilizador”.
            </small>
          </div>
        </div>

        <button
          type="submit"
          className="admin-save-button"
          disabled={isSaving || !canManageUsers}
        >
          <Save size={20} />
          {isSaving ? 'A criar...' : 'Criar utilizador'}
        </button>
      </form>

      <div className="admin-users-list-header">
        <div>
          <strong>Utilizadores existentes</strong>
          <p>
            {canManageUsers
              ? 'Lista de pessoas com acesso ao painel.'
              : 'Disponível apenas para utilizadores com perfil Administrador.'}
          </p>
        </div>

        <button
          type="button"
          className="admin-secondary-button"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCcw size={18} />
          Atualizar
        </button>
      </div>

      {isLoading ? (
        <div className="admin-empty-state">A carregar utilizadores...</div>
      ) : !canManageUsers ? (
        <div className="admin-empty-state">
          A lista de utilizadores está oculta para o perfil Editor.
        </div>
      ) : users.length === 0 ? (
        <div className="admin-empty-state">Ainda não existem utilizadores.</div>
      ) : (
        <div className="admin-users-list">
          {users.map((user) => {
            const isCurrentUser = user.auth_user_id === currentProfile?.auth_user_id;

            return (
              <div className="admin-user-row" key={user.id}>
                <div className="admin-user-main">
                  <div className="admin-user-avatar">
                    <ShieldCheck size={22} />
                  </div>

                  <div>
                    <strong>
                      {user.name}
                      {isCurrentUser && <em> Sessão atual</em>}
                    </strong>
                    <span>@{user.username}</span>
                    <small>{user.email}</small>
                  </div>
                </div>

                <div className="admin-user-controls">
                  <select
                    value={user.role}
                    onChange={(event) =>
                      handleChangeRole(user, event.target.value as AdminUserRole)
                    }
                    disabled={isSaving || !canManageUsers}
                  >
                    <option value="editor">Editor</option>
                    <option value="admin">Administrador</option>
                  </select>

                  <button
                    type="button"
                    className={
                      user.active ? 'admin-status-active' : 'admin-status-inactive'
                    }
                    onClick={() => handleToggleActive(user)}
                    disabled={isSaving || !canManageUsers || isCurrentUser}
                    title={
                      isCurrentUser
                        ? 'Não podes alterar o estado do teu próprio utilizador.'
                        : undefined
                    }
                  >
                    <BadgeCheck size={16} />
                    {isCurrentUser
                      ? 'Sessão atual'
                      : user.active
                        ? 'Ativo'
                        : 'Inativo'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="admin-note">
        <strong>Nota importante:</strong>
        <p>
          Utilizadores com perfil Administrador podem gerir outros utilizadores.
          Utilizadores Editor devem ser usados apenas para edição de conteúdo do website.
        </p>
      </div>
    </div>
  );
}