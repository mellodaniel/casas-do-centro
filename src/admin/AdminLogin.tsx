import type { FormEvent } from 'react';
import { Lock, LogIn } from 'lucide-react';
import { useState } from 'react';
import { signInAdmin } from '../lib/siteContentService';
import './admin.css';

type AdminLoginProps = {
  onLoginSuccess: () => void;
};

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState('dina');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setStatusMessage('');

    try {
      await signInAdmin(username, password);
      onLoginSuccess();
    } catch {
      setStatusMessage('Utilizador ou password inválidos.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="admin-login-page">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <div className="admin-login-icon">
          <Lock size={30} />
        </div>

        <span className="admin-kicker">Área administrativa</span>
        <h1>Casas do Centro</h1>
        <p>Entra com o utilizador e password para gerir o conteúdo do website.</p>

        {statusMessage && <div className="admin-alert">{statusMessage}</div>}

        <label>
          Utilizador
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="dina"
            autoComplete="username"
          />
        </label>

        <label>
          Password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="Password"
            autoComplete="current-password"
          />
        </label>

        <button type="submit" className="admin-save-button" disabled={isLoading}>
          <LogIn size={20} />
          {isLoading ? 'A entrar...' : 'Entrar'}
        </button>

        <a className="admin-login-back" href="/">
          Voltar ao website
        </a>
      </form>
    </div>
  );
}