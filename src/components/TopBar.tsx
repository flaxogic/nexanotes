import React, { useState } from 'react';
import { User } from '../types'; // CORRECT: Import the official User type
import UserAvatar from './UserAvatar';

interface TopBarProps {
  user: User;
  onLogout: () => void;
  onNavigate: (view: string) => void;
  activeView: string;
}

const TopBar: React.FC<TopBarProps> = ({ user, onLogout, onNavigate, activeView }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navItems = ['home', 'notes', 'discussion', 'profile'];
  if (user.role === 'admin' || user.role === 'dev') {
    navItems.push('admin');
  }

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <h1>NexaNotes</h1>
        <nav className="top-bar-nav">
          {navItems.map(item => (
            <button
              key={item}
              className={`top-bar-nav-btn ${activeView === item ? 'active' : ''}`}
              onClick={() => handleNavClick(item)}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </nav>
      </div>
      <div className="top-bar-user-actions">
        <div className="user-display">
          <UserAvatar user={user} />
          <span>{user.username}</span>
          {user.role === 'admin' && <span className="admin-badge">Admin</span>}
          {user.role === 'dev' && <span className="dev-badge">Dev</span>}
        </div>
        <button onClick={onLogout}>Logout</button>
        <button className="mobile-nav-toggle" onClick={() => setIsMobileMenuOpen(true)}>☰</button>
      </div>
      {isMobileMenuOpen && (
        <div className="mobile-nav-menu">
          {/* Mobile menu content would go here */}
          <button className="mobile-nav-close" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
        </div>
      )}
    </header>
  );
};

export default TopBar;
