import React, { useState, useEffect, useCallback } from 'react';
import { Gif } from '../types.ts';
import { searchGifs } from '../services/geminiService.ts';
import { useTranslation } from '../App.tsx';

interface GifPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGif: (gif: Gif) => void;
}

// Simple debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

const GifPickerModal: React.FC<GifPickerModalProps> = ({ isOpen, onClose, onSelectGif }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const performSearch = useCallback(async (query: string) => {
    if (!query) {
      setGifs([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const results = await searchGifs(query);
      setGifs(results);
      if (results.length === 0) {
        setError(t('modals.gif.noResults'));
      }
    } catch (err) {
      setError(t('modals.gif.error'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [t]);
  
  const handleGifClick = (gif: Gif) => {
    onSelectGif(gif);
  };


  useEffect(() => {
    performSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, performSearch]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content gif-picker-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
           <h2>{t('modals.gif.title')}</h2>
           <button onClick={onClose} className="modal-close-btn" aria-label={t('modals.gif.close')}>×</button>
        </div>
        <div className="gif-search-container">
          <input
            type="text"
            className="gif-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('modals.gif.searchPlaceholder')}
            aria-label={t('modals.gif.searchPlaceholder')}
            autoFocus
          />
        </div>

        <div className="gif-results-container">
          {isLoading ? (
            <div className="gif-picker-state">{t('modals.gif.loading')}</div>
          ) : error ? (
            <div className="gif-picker-state">{error}</div>
          ) : (
            <div className="gif-results-grid">
              {gifs.map((gif) => (
                <div 
                  key={gif.url} 
                  className="gif-item" 
                  onClick={() => handleGifClick(gif)} 
                  role="button" 
                  aria-label={gif.alt}
                >
                  <img src={gif.url} alt={gif.alt} loading="lazy" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GifPickerModal;