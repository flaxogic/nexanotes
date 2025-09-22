
import React, { useState, useEffect } from 'react';
import { Note } from '../types.ts';
import { useTranslation } from '../App.tsx';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, note }) => {
  const { t } = useTranslation();
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (note) {
      try {
        const noteString = JSON.stringify(note);
        // Use encodeURIComponent to handle special characters before base64 encoding
        const encodedNote = btoa(encodeURIComponent(noteString));
        
        // Use hash-based URL for better SPA compatibility
        const baseUrl = window.location.href.split('?')[0].split('#')[0];
        const link = `${baseUrl}#note=${encodedNote}`;
        setShareLink(link);
      } catch (error) {
        console.error("Error creating share link:", error);
        setShareLink("Could not create a shareable link.");
      }
    }
  }, [note]);

  if (!isOpen || !note) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  
  const handleSendEmail = () => {
    if (!email) return;
    const subject = `Check out this note: ${note.title || t('common.untitledNote')}`;
    const body = `I wanted to share this note with you:\n\n${shareLink}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{t('modals.share.title')} {note.title || t('common.untitledNote')}</h2>
        
        <label htmlFor="share-link-input" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          {t('modals.share.shareableLink')}
        </label>
        <div className="share-link-container">
          <input
            id="share-link-input"
            type="text"
            value={shareLink}
            readOnly
            aria-label={t('modals.share.shareableLink')}
            onFocus={(e) => e.target.select()}
          />
          <button onClick={handleCopy} style={{ minWidth: '80px' }}>
            {copied ? t('modals.share.copied') : t('modals.share.copy')}
          </button>
        </div>
        
        <div className="email-share-container">
           <h3>{t('modals.share.emailTitle')}</h3>
           <div className="share-link-container">
             <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('modals.share.emailPlaceholder')}
                aria-label="Recipient's email"
            />
            <button onClick={handleSendEmail} disabled={!email}>{t('common.send')}</button>
           </div>
        </div>

        <button onClick={onClose} style={{ marginTop: '2rem', float: 'right' }}>
          {t('common.close')}
        </button>
      </div>
    </div>
  );
};

export default ShareModal;