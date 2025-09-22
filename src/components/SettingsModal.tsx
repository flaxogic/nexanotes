

import React from 'react';
import { Theme, CursorStyle } from '../types.ts';
import { useTranslation, Language } from '../App.tsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  themes: Theme[];
  currentTheme: Theme;
  onSelectTheme: (theme: Theme) => void;
  currentCursorStyle: CursorStyle;
  onSelectCursorStyle: (style: CursorStyle) => void;
  currentCursorColor: string;
  onSelectCursorColor: (color: string) => void;
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
}

const cursorStyles: CursorStyle[] = ['default', 'dot', 'crosshair', 'underline', 'blade', 'orbit', 'glitch'];
const languageOptions: { code: Language; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'zh', name: '中文' },
];


const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  themes, 
  currentTheme, 
  onSelectTheme,
  currentCursorStyle,
  onSelectCursorStyle,
  currentCursorColor,
  onSelectCursorColor,
  currentLanguage,
  onSelectLanguage
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{t('modals.settings.title')}</h2>

        <h3 className="settings-section-header">{t('modals.settings.selectTheme')}</h3>
        <div className="theme-options">
          {themes.map(theme => (
            <div 
              key={theme.name}
              className={`theme-preview ${currentTheme.name === theme.name ? 'selected' : ''}`}
              onClick={() => onSelectTheme(theme)}
              style={{
                backgroundColor: theme.colors['--background-color'],
                color: theme.colors['--text-color'],
                borderColor: theme.colors['--primary-color']
              }}
              role="button"
              tabIndex={0}
              aria-pressed={currentTheme.name === theme.name}
              aria-label={`Select ${theme.name} theme`}
            >
              <h3>{theme.name}</h3>
            </div>
          ))}
        </div>

        <div className="settings-section-header-wrapper">
          <h3 className="settings-section-header">{t('modals.settings.selectCursor')}</h3>
          <div className="cursor-color-picker">
            <label htmlFor="cursor-color">{t('modals.settings.cursorColor')}</label>
            <input 
              type="color" 
              id="cursor-color"
              value={currentCursorColor}
              onChange={(e) => onSelectCursorColor(e.target.value)}
              aria-label="Cursor color picker"
            />
          </div>
        </div>
        <div className="cursor-options">
          {cursorStyles.map(style => (
            <div
              key={style}
              className={`cursor-preview ${currentCursorStyle === style ? 'selected' : ''}`}
              onClick={() => onSelectCursorStyle(style)}
              role="button"
              tabIndex={0}
              aria-pressed={currentCursorStyle === style}
              aria-label={`Select ${style} cursor`}
            >
              <h4>{style}</h4>
            </div>
          ))}
        </div>
        
        <h3 className="settings-section-header">{t('modals.settings.selectLanguage')}</h3>
        <div className="theme-options">
          {languageOptions.map(lang => (
            <div 
              key={lang.code}
              className={`theme-preview ${currentLanguage === lang.code ? 'selected' : ''}`}
              onClick={() => onSelectLanguage(lang.code)}
              role="button"
              tabIndex={0}
              aria-pressed={currentLanguage === lang.code}
              aria-label={`Select ${lang.name} language`}
            >
              <h3>{lang.name}</h3>
            </div>
          ))}
        </div>


        <button onClick={onClose} style={{ marginTop: '2rem', float: 'right' }}>{t('common.close')}</button>
      </div>
    </div>
  );
};

export default SettingsModal;