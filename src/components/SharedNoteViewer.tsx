import React, { useMemo } from 'react';
import { marked } from 'marked';
import { Note } from '../types.ts';
import { useTranslation } from '../App.tsx';

interface SharedNoteViewerProps {
  note: Note;
  isLoggedIn: boolean;
  onGoToApp: () => void;
  appName: string;
}

marked.setOptions({
    breaks: true,
});

const SharedNoteViewer: React.FC<SharedNoteViewerProps> = ({ note, isLoggedIn, onGoToApp, appName }) => {
  const { t } = useTranslation();
  const renderedContent = useMemo(() => marked.parse(note.content || '') as string, [note.content]);
  
  return (
    <div className="shared-note-viewer">
      <div className="shared-note-header">
        {isLoggedIn && (
            <button 
              onClick={onGoToApp} 
              style={{ position: 'absolute', top: '2rem', right: '2rem' }}
            >
              &larr; {t('pages.sharedNote.backToNotes')}
            </button>
        )}
        <h1>{appName}</h1>
        <h2>{note.title || t('common.untitledNote')}</h2>
        <p style={{ opacity: 0.7 }}>
          {t('pages.sharedNote.lastUpdated')} {new Date(note.updatedAt).toLocaleString()}
        </p>
      </div>
      <div 
        className="shared-note-content markdown-preview"
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />
    </div>
  );
};

export default SharedNoteViewer;