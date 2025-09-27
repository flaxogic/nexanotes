import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  User
} from "firebase/auth";
import { auth } from '../firebase'; // Import our configured auth service

// Keep the existing User type for component props
type LocalUser = {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  role: 'user' | 'admin' | 'dev';
  bio?: string;
};

// Props for the Auth component
interface AuthProps {
  onAuthSuccess: (user: LocalUser) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Only for signup
  const [error, setError] = useState<string | null>(null);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Reset error before trying

    if (isLogin) {
      // --- LOGIN LOGIC ---
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        console.log("User logged in successfully:", firebaseUser);

        // NOTE: We will handle redirecting and managing the user session globally
        // in a later step. For now, this is a placeholder.
        const mockLocalUser: LocalUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          username: firebaseUser.displayName || 'User',
          role: 'user', // We will handle roles later
        };
        onAuthSuccess(mockLocalUser);

      } catch (err: any) {
        console.error("Login Error:", err);
        setError(err.message); // Display Firebase error message
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
        
        console.log("User signed up successfully:", firebaseUser);
        
        // After signup, you might want to automatically log them in
        // or ask them to verify their email. For now, we'll treat it as a success.
        const mockLocalUser: LocalUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          username: username, // Use the username from the form
          role: 'user',
        };
        onAuthSuccess(mockLocalUser);

      } catch (err: any) {
        console.error("Signup Error:", err);
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
        
