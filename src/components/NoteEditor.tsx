import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { marked } from 'marked';
import { Note, Gif } from '../types.ts';
import GifPickerModal from './GifPickerModal.tsx';
import MarkdownHelpModal from './MarkdownHelpModal.tsx';
import 'emoji-picker-element';
import { useTranslation } from '../App.tsx';

// FIX: Moved the global type declaration for the 'emoji-picker' custom element to types.ts to ensure it is applied correctly across the application.

marked.setOptions({
  breaks: true,
});

interface NoteEditorProps {
  note: Note;
  onUpdateNote: (updates: Partial<Note>) => void;
  isMobile?: boolean;
  onBack?: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onUpdateNote, isMobile, onBack }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('split');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isGifPickerOpen, setIsGifPickerOpen] = useState(false);
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note]);
  
  useEffect(() => {
    if (isMobile) {
      setViewMode('edit');
    } else {
      setViewMode('split');
    }
  }, [isMobile]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (note.title !== title || note.content !== content) {
        onUpdateNote({ title, content });
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [title, content, note.title, note.content, onUpdateNote]);

  const renderedMarkdown = useMemo(() => {
    return marked.parse(content || '') as string;
  }, [content]);

  const handleEmojiSelect = useCallback((event: any) => {
    const emoji = event.detail.unicode;
    const textarea = textareaRef.current;
    if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = content.substring(0, start) + emoji + content.substring(end);
        setContent(newContent);
        // No need for onUpdateNote here, the useEffect handles it
        textarea.focus();
        setTimeout(() => textarea.setSelectionRange(start + emoji.length, start + emoji.length), 0);
    }
    setShowEmojiPicker(false);
  }, [content]);

  const handleSelectGif = useCallback((gif: Gif) => {
    const markdown = `![${gif.alt}](${gif.url})`;
    const textarea = textareaRef.current;
    if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = content.substring(0, start) + markdown + content.substring(end);
        setContent(newContent);
        // No need for onUpdateNote here, the useEffect handles it
        textarea.focus();
        setTimeout(() => textarea.setSelectionRange(start + markdown.length, start + markdown.length), 0);
    }
    setIsGifPickerOpen(false);
  }, [content]);

  useEffect(() => {
    const emojiPicker = emojiPickerContainerRef.current?.querySelector('emoji-picker');
    if (showEmojiPicker && emojiPicker) {
      emojiPicker.addEventListener('emoji-click', handleEmojiSelect);
      return () => {
        emojiPicker.removeEventListener('emoji-click', handleEmojiSelect);
      };
    }
  }, [showEmojiPicker, handleEmojiSelect]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showEmojiPicker && emojiPickerContainerRef.current && !emojiPickerContainerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  return (
    <div className="note-editor">
      <div className="note-editor-header">
        {isMobile && <button className="mobile-back-btn" onClick={onBack}>&larr; {t('common.back')}</button>}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('editor.titlePlaceholder')}
          className="note-title-input"
          aria-label={t('editor.titlePlaceholder')}
        />
        <div className="note-editor-toolbar">
            <button onClick={() => setViewMode('edit')} className={`md-tool-btn ${viewMode === 'edit' ? 'active' : ''}`}>{t('editor.edit')}</button>
            {!isMobile && <button onClick={() => setViewMode('split')} className={`md-tool-btn ${viewMode === 'split' ? 'active' : ''}`}>{t('editor.split')}</button>}
            <button onClick={() => setViewMode('preview')} className={`md-tool-btn ${viewMode === 'preview' ? 'active' : ''}`}>{t('editor.preview')}</button>
            <div className="toolbar-separator"></div>
            <div ref={emojiPickerContainerRef} className="emoji-picker-container">
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="emoji-btn" aria-label={t('editor.insertEmoji')}>😊</button>
                {showEmojiPicker && (
                    <div className="emoji-picker-wrapper">
                        <emoji-picker></emoji-picker>
                    </div>
                )}
            </div>
            <button onClick={() => setIsGifPickerOpen(true)} aria-label={t('editor.insertGif')}>GIF</button>
            <button onClick={() => setShowMarkdownHelp(true)} aria-label={t('editor.markdownHelp')}>?</button>
        </div>
      </div>

      <div className="note-editor-content-area">
        {(viewMode === 'edit' || (viewMode === 'split' && !isMobile)) && (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('editor.contentPlaceholder')}
            className={`note-content-textarea ${viewMode === 'split' ? 'view-split' : ''}`}
            aria-label="Note content"
          />
        )}
        {(viewMode === 'preview' || (viewMode === 'split' && !isMobile)) && (
          <div
            className={`markdown-preview ${viewMode === 'split' ? 'view-split' : ''}`}
            dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
          />
        )}
      </div>
      <GifPickerModal 
        isOpen={isGifPickerOpen} 
        onClose={() => setIsGifPickerOpen(false)} 
        onSelectGif={handleSelectGif} 
      />
      <MarkdownHelpModal 
        isOpen={showMarkdownHelp}
        onClose={() => setShowMarkdownHelp(false)}
      />
    </div>
  );
};

export default NoteEditor;