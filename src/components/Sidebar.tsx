
import React from 'react';
import { useTranslation } from '../App.tsx';

interface SidebarProps {
  onAddNote: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onAddNote, isCollapsed, onToggle, onOpenSettings }) => {
  const { t } = useTranslation();
  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
       <button onClick={onToggle} className="toggle-btn" aria-label="Toggle Sidebar">
        {isCollapsed ? '»' : '«'}
      </button>
      <div className="sidebar-header">
        <h2>{t('sidebar.notes')}</h2>
      </div>
      <div className="sidebar-actions">
        <button onClick={onAddNote} className="new-note-btn">
          {isCollapsed ? '+' : t('sidebar.newNote')}
        </button>
      </div>
      <div className="sidebar-footer">
        <button onClick={onOpenSettings} className="settings-btn">
          {isCollapsed ? '⚙️' : t('sidebar.settings')}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;