import React from 'react';
import { useTranslation } from '../App.tsx';

interface MarkdownHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MarkdownHelpModal: React.FC<MarkdownHelpModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('modals.markdownHelp.title')}</h2>
          <button onClick={onClose} className="modal-close-btn" aria-label={t('modals.markdownHelp.close')}>×</button>
        </div>
        <div className="markdown-help-content">
          <h4>{t('modals.markdownHelp.emphasis')}</h4>
          <p><code>**{t('modals.markdownHelp.bold')}**</code> &rarr; <strong>{t('modals.markdownHelp.bold')}</strong></p>
          <p><code>*{t('modals.markdownHelp.italic')}*</code> &rarr; <em>{t('modals.markdownHelp.italic')}</em></p>
          <p><code>~~{t('modals.markdownHelp.strikethrough')}~~</code> &rarr; <del>{t('modals.markdownHelp.strikethrough')}</del></p>

          <h4>{t('modals.markdownHelp.headings')}</h4>
          <p><code># Heading 1</code></p>
          <p><code>## Heading 2</code></p>
          <p><code>### Heading 3</code></p>

          <h4>{t('modals.markdownHelp.lists')}</h4>
          <p><code>- {t('modals.markdownHelp.unorderedItem')}</code></p>
          <p><code>1. {t('modals.markdownHelp.orderedItem')}</code></p>
          
          <h4>{t('modals.markdownHelp.linksAndImages')}</h4>
          <p><code>[{t('modals.markdownHelp.linkText')}](https://example.com)</code></p>
          <p><code>![{t('modals.markdownHelp.altText')}](image_url.png)</code></p>

          <h4>{t('modals.markdownHelp.code')}</h4>
          <p><code>`{t('modals.markdownHelp.inlineCode')}`</code></p>
          <pre><code>{'```\n'}{t('modals.markdownHelp.codeBlock')}{'\n```'}</code></pre>

          <h4>{t('modals.markdownHelp.other')}</h4>
          <p><code>&gt; {t('modals.markdownHelp.blockquote')}</code></p>
          <p><code>---</code> ({t('modals.markdownHelp.horizontalRule')})</p>

        </div>
        <button onClick={onClose} style={{ marginTop: '2rem', float: 'right' }}>
          {t('modals.markdownHelp.gotIt')}
        </button>
      </div>
    </div>
  );
};

export default MarkdownHelpModal;