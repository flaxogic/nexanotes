
import React from 'react';
import { Note } from '../types.ts';
import { useTranslation } from '../App.tsx';

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onSummarizeNote: (id: string) => void;
  onShareNote: (id: string) => void;
  isSummarizing: boolean;
}

const NoteList: React.FC<NoteListProps> = ({ notes, selectedNoteId, onSelectNote, onDeleteNote, onSummarizeNote, onShareNote, isSummarizing }) => {
  const { t } = useTranslation();
  return (
    <div className="note-list">
      {notes.length === 0 ? (
        <div className="empty-note-list">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          <h4>{t('noteList.canvasAwaits')}</h4>
          <p>{t('noteList.startCreating')}</p>
        </div>
      ) : (
        notes.map(note => (
          <div
            key={note.id}
            className={`note-item ${note.id === selectedNoteId ? 'selected' : ''}`}
            onClick={() => onSelectNote(note.id)}
          >
            <div className="note-item-header">
              <h3>{note.title || t('common.untitledNote')}</h3>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNote(note.id);
                }}
                aria-label={t('noteList.deleteNote')}
              >
                🗑️
              </button>
            </div>
            <p className="note-item-content-preview">
              {(note.content || '').substring(0, 100) || t('noteList.noContent')}...
            </p>
            {note.summary && <p className="note-item-summary"><strong>{t('noteList.summary')}</strong> {note.summary}</p>}
            <div className="note-item-actions">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSummarizeNote(note.id);
                }}
                disabled={isSummarizing || !note.content}
              >
                {isSummarizing ? t('noteList.summarizing') : t('noteList.summarize')}
              </button>
               <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onShareNote(note.id);
                }}
              >
                {t('noteList.share')}
              </button>
            </div>
            <small className="note-item-date">{new Date(note.updatedAt).toLocaleString()}</small>
          </div>
        ))
      )}
    </div>
  );
};

export default NoteList;