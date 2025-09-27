import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { auth } from '../firebase';
import { User } from '../types'; // <-- CORRECT: Import the official User type

// Props for the Auth component now use the official User type
interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isLogin) {
      // --- LOGIN LOGIC ---
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        // Create a user object that matches the official User type
        const appUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          username: firebaseUser.displayName || 'User', // Note: displayName is often null initially
          role: 'user', // We will handle roles later
        };
        onAuthSuccess(appUser);

      } catch (err: any) {
        setError(err.message);
      }
    } else {
      // --- SIGNUP LOGIC ---
      if (!username) {
        setError("Please enter a username.");
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        // Create a user object that matches the official User type
        const appUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          username: username, // Use the username from the form
          role: 'user',
        };
        onAuthSuccess(appUser);

      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-wrapper">
        <div className="auth-header">
          <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p>{isLogin ? 'Log in to continue your work' : 'Get started with NexaNotes'}</p>
        </div>
        <form onSubmit={handleAuthAction}>
          {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}
          
          {!isLogin && (
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-button">
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>
        <div className="auth-footer">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => setIsLogin(!isLogin)} className="toggle-auth-mode">
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
