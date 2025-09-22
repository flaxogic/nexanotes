import React, { useState, useMemo } from 'react';
import { marked } from 'marked';
import { Note, User, Publication } from '../types.ts';
import { useTranslation } from '../App.tsx';

marked.setOptions({
  breaks: true,
});

interface SubmitPublicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, content: string) => void;
}

const SubmitPublicationModal: React.FC<SubmitPublicationModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onSubmit(title, content);
      setTitle('');
      setContent('');
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('modals.submitPublication.title')}</h2>
          <button onClick={onClose} className="modal-close-btn" aria-label={t('common.close')}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="new-thread-form">
          <input
            type="text"
            placeholder={t('modals.submitPublication.titlePlaceholder')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            aria-label={t('modals.submitPublication.titlePlaceholder')}
          />
          <textarea
            placeholder={t('modals.submitPublication.contentPlaceholder')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            aria-label={t('modals.submitPublication.contentPlaceholder')}
          />
           <p style={{fontSize: '0.8rem', opacity: 0.7}}>{t('modals.submitPublication.note')}</p>
          <div className="new-thread-form-actions">
            <button type="button" onClick={onClose}>{t('common.cancel')}</button>
            <button type="submit">{t('modals.submitPublication.submit')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};


interface HomePageProps {
  user: User;
  notes: Note[];
  onNewNote: () => void;
  publications: Publication[];
  onSubmitPublication: (title: string, content: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ user, notes, onNewNote, publications, onSubmitPublication }) => {
  const { t } = useTranslation();
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  
  const totalNotes = notes.length;
  const totalWords = notes.reduce((sum, note) => sum + (note.content.split(/\s+/).filter(Boolean).length), 0);
  const notesSummarized = notes.filter(n => n.summary).length;
  const lastUpdatedNote = notes.length > 0 ? new Date(notes[0].updatedAt) : null;

  const publishedAnnouncements = useMemo(() => {
    return publications
      .filter(p => p.status === 'published')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [publications]);

  return (
    <>
    <div className="home-page">
      <div className="home-header">
        <h1>{t('pages.home.welcome', { displayName: user.displayName })}</h1>
        <p>{t('pages.home.prompt')}</p>
      </div>

      <div className="home-stats">
        <div className="stat-card">
          <h2>{totalNotes}</h2>
          <p>{t('pages.home.totalNotes')}</p>
        </div>
        <div className="stat-card">
          <h2>{totalWords}</h2>
          <p>{t('pages.home.totalWords')}</p>
        </div>
        <div className="stat-card">
          <h2>{notesSummarized}</h2>
          <p>{t('pages.home.notesSummarized')}</p>
        </div>
        <div className="stat-card">
          <h2>{lastUpdatedNote ? lastUpdatedNote.toLocaleDateString() : 'N/A'}</h2>
          <p>{t('pages.home.lastActivity')}</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', margin: '2rem 0' }}>
        <button onClick={onNewNote} className="home-new-note-btn">
          {t('pages.home.createNote')}
        </button>
      </div>

      <div className="publications-section">
        <div className="admin-header" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>
          <h2>{t('pages.home.publicationsBoard')}</h2>
          <button onClick={() => setIsSubmitModalOpen(true)}>{t('pages.home.submitAnnouncement')}</button>
        </div>
        <div className="publications-list" style={{ maxWidth: '1000px', margin: '1rem auto 0 auto', padding: '0 1rem' }}>
          {publishedAnnouncements.length > 0 ? (
            publishedAnnouncements.map(pub => (
              <div key={pub.id} className="stat-card" style={{ textAlign: 'left', marginBottom: '1rem' }}>
                <h3>{pub.title}</h3>
                <small style={{ opacity: 0.7 }}>
                  {pub.publishedBy && t('pages.home.publishedBy', { authorDisplayName: pub.publishedBy.displayName, date: new Date(pub.createdAt).toLocaleDateString() })}
                </small>
                <div className="markdown-preview" style={{ marginTop: '1rem' }} dangerouslySetInnerHTML={{ __html: marked.parse(pub.content) as string }} />
              </div>
            ))
          ) : (
            <div className="stat-card" style={{ textAlign: 'center', opacity: 0.7 }}>
              <p>{t('pages.home.noPublications')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
    <SubmitPublicationModal 
      isOpen={isSubmitModalOpen}
      onClose={() => setIsSubmitModalOpen(false)}
      onSubmit={onSubmitPublication}
    />
    </>
  );
};

export default HomePage;