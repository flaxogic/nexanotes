
import React, { useState } from 'react';
import { useTranslation } from '../App.tsx';

interface AuthProps {
  onAuth: (email: string) => Promise<string | null>;
  appName: string;
  registrationEnabled: boolean;
}

const Auth: React.FC<AuthProps> = ({ onAuth, appName, registrationEnabled }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      if (isSignUp && !registrationEnabled) {
        setError(t('auth.registrationDisabled'));
        return;
      }
      setLoading(true);
      setError(null);
      const authError = await onAuth(email);
      if (authError) {
        setError(authError);
      }
      setLoading(false);
    }
  };

  const currentModeIsSignUp = isSignUp && registrationEnabled;

  return (
    <div className="auth-container">
      <div className="auth-form-wrapper">
        <div className="auth-header">
          <h1>{appName}</h1>
          <p>{currentModeIsSignUp ? t('auth.createAccountTitle') : t('auth.welcomeBackTitle')}</p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <p className="input-error-message" style={{textAlign: 'center', marginBottom: '1rem'}}>{error}</p>}
          <div className="input-group">
            <label htmlFor="email">{t('auth.emailLabel')}</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              aria-label={t('auth.emailLabel')}
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">{t('auth.passwordLabel')}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              aria-label={t('auth.passwordLabel')}
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? t('auth.authenticating') : (currentModeIsSignUp ? t('auth.createAccountButton') : t('auth.loginButton'))}
          </button>
        </form>
        {registrationEnabled && (
          <div className="auth-footer">
            <p>
              {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.dontHaveAccount')}
              <button onClick={() => setIsSignUp(!isSignUp)} className="toggle-auth-mode" aria-label={isSignUp ? t('auth.logIn') : t('auth.signUp')}>
                {isSignUp ? t('auth.logIn') : t('auth.signUp')}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;