import React, { useState } from 'react';
import { User } from '../types.ts';
import UserAvatar from './UserAvatar.tsx';
import { useTranslation } from '../App.tsx';

type AppView = 'home' | 'notes' | 'discussion' | 'profile' | 'admin';

interface TopBarProps {
  user: User;
  onLogout: () => void;
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  appName: string;
  onAddNote: () => void;
  onOpenSettings: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  user,
  onLogout,
  activeView,
  onNavigate,
  appName,
  onAddNote,
  onOpenSettings
}) => {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: { view: AppView; labelKey: string; adminOnly?: boolean }[] = [
    { view: 'home', labelKey: 'topbar.home' },
    { view: 'notes', labelKey: 'topbar.notes' },
    { view: 'discussion', labelKey: 'topbar.discussion' },
    { view: 'profile', labelKey: 'topbar.profile' },
    { view: 'admin', labelKey: 'topbar.adminPanel', adminOnly: true },
  ];

  const handleMobileNavClick = (view: AppView) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };
  
  const NavLinks: React.FC<{isMobile?: boolean}> = ({ isMobile = false }) => (
     <>
      {navItems.map(item => {
        if (item.adminOnly && !(user.role === 'admin' || user.role === 'dev')) {
          return null;
        }
        return (
          <button
            key={item.view}
            className={`top-bar-nav-btn ${activeView === item.view ? 'active' : ''}`}
            onClick={() => isMobile ? handleMobileNavClick(item.view) : onNavigate(item.view)}
            aria-current={activeView === item.view}
          >
            {t(item.labelKey)}
          </button>
        );
      })}
    </>
  );


  return (
    <>
      <div className="top-bar">
        <div className="top-bar-left">
           <button className="mobile-nav-toggle" onClick={() => setIsMobileMenuOpen(true)} aria-label="Open navigation menu">
            ☰
          </button>
          <h1>{appName}</h1>
          <nav className="top-bar-nav">
            <NavLinks />
          </nav>
        </div>
        <div className="top-bar-user-actions">
          <div className="user-display">
            <UserAvatar user={user} />
            <span>{user.displayName}</span>
            {user.role === 'admin' && <span className="admin-badge">{t('topbar.admin')}</span>}
            {user.role === 'dev' && <span className="dev-badge">{t('topbar.dev')}</span>}
          </div>
          <button onClick={onLogout}>{t('topbar.logout')}</button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="mobile-nav-menu">
           <button className="mobile-nav-toggle mobile-nav-close" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close navigation menu">
            ×
          </button>
          <NavLinks isMobile={true} />
          <div className="sidebar-actions">
             <button onClick={() => { onAddNote(); setIsMobileMenuOpen(false); }}>
              {t('sidebar.newNote')}
            </button>
            <button onClick={() => { onOpenSettings(); setIsMobileMenuOpen(false); }}>
              {t('sidebar.settings')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TopBar;