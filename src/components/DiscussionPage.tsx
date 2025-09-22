import React, { useState, useMemo, useEffect } from 'react';
import { DiscussionThread, User, Community } from '../types.ts';
import UserAvatar from './UserAvatar.tsx';
import { useTranslation } from '../App.tsx';

interface DiscussionPageProps {
  threads: DiscussionThread[];
  user: User;
  onCreateThread: (communityId: string | null, title: string, content: string) => void;
  onAddPost: (threadId: string, content: string) => void;
  onToggleLike: (threadId: string, postId: string) => void;
  communities: Community[];
  onCreateCommunity: (name: string, description: string) => void;
}

const NewCommunityModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}> = ({ isOpen, onClose, onCreate }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && description.trim()) {
      onCreate(name, description);
      setName('');
      setDescription('');
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('modals.newCommunity.title')}</h2>
          <button onClick={onClose} className="modal-close-btn" aria-label={t('common.close')}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="new-thread-form">
          <input
            type="text"
            placeholder={t('modals.newCommunity.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={50}
            aria-label={t('modals.newCommunity.namePlaceholder')}
          />
          <textarea
            placeholder={t('modals.newCommunity.descriptionPlaceholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            maxLength={200}
            aria-label={t('modals.newCommunity.descriptionPlaceholder')}
          />
          <div className="new-thread-form-actions">
            <button type="button" onClick={onClose}>{t('common.cancel')}</button>
            <button type="submit">{t('modals.newCommunity.create')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};


const NewThreadModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, content: string) => void;
}> = ({ isOpen, onClose, onCreate }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onCreate(title, content);
      setTitle('');
      setContent('');
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('modals.newThread.title')}</h2>
          <button onClick={onClose} className="modal-close-btn" aria-label={t('common.close')}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="new-thread-form">
          <input
            type="text"
            placeholder={t('modals.newThread.titlePlaceholder')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            aria-label={t('modals.newThread.titlePlaceholder')}
          />
          <textarea
            placeholder={t('modals.newThread.contentPlaceholder')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            aria-label={t('modals.newThread.contentPlaceholder')}
          />
          <div className="new-thread-form-actions">
            <button type="button" onClick={onClose}>{t('common.cancel')}</button>
            <button type="submit">{t('modals.newThread.create')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DiscussionPage: React.FC<DiscussionPageProps> = ({ threads, user, onCreateThread, onAddPost, onToggleLike, communities, onCreateCommunity }) => {
  const { t } = useTranslation();
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | 'general' | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [isThreadModalOpen, setIsThreadModalOpen] = useState(false);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  type MobileView = 'communities' | 'threads' | 'content';
  const [mobileView, setMobileView] = useState<MobileView>('communities');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleSelectCommunity = (id: string | 'general') => {
    setSelectedCommunityId(id);
    setActiveThreadId(null);
    if(isMobile) {
      setMobileView('threads');
    }
  };
  
  const handleSelectThread = (id: string) => {
    setActiveThreadId(id);
    if(isMobile) {
      setMobileView('content');
    }
  };
  
  const handleMobileBack = () => {
    if (mobileView === 'content') {
      setMobileView('threads');
      setActiveThreadId(null);
    } else if (mobileView === 'threads') {
      setMobileView('communities');
      setSelectedCommunityId(null);
    }
  }

  const handleCreateThread = (title: string, content: string) => {
    if (selectedCommunityId) {
      const communityId = selectedCommunityId === 'general' ? null : selectedCommunityId;
      onCreateThread(communityId, title, content);
    }
  }

  const filteredThreads = useMemo(() => {
    if (!selectedCommunityId) return [];

    const threadsToFilter = (selectedCommunityId === 'general')
      ? threads.filter(thread => thread.communityId === null || thread.communityId === undefined)
      : threads.filter(thread => thread.communityId === selectedCommunityId);

    return [...threadsToFilter]
      .sort((a, b) => {
        const lastPostA = a.posts[a.posts.length - 1];
        const lastPostB = b.posts[b.posts.length - 1];
        const timeA = lastPostA ? new Date(lastPostA.createdAt).getTime() : new Date(a.createdAt).getTime();
        const timeB = lastPostB ? new Date(lastPostB.createdAt).getTime() : new Date(b.createdAt).getTime();
        return timeB - timeA;
      });
  }, [threads, selectedCommunityId]);

  const activeThread = useMemo(
    () => filteredThreads.find(t => t.id === activeThreadId),
    [filteredThreads, activeThreadId]
  );

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeThreadId && replyContent.trim()) {
      onAddPost(activeThreadId, replyContent);
      setReplyContent('');
    }
  };
  
  const CommunitiesColumn = (
    <div className="communities-sidebar">
      <div className="communities-sidebar-header">
        <h2>{t('pages.discussion.hubTitle')}</h2>
      </div>
        <div style={{ padding: '0 1rem 1rem 1rem', borderBottom: '1px solid var(--border-color)'}}>
          <button className="new-community-btn" onClick={() => setIsCommunityModalOpen(true)}>
          {t('pages.discussion.createCommunity')}
        </button>
      </div>
      <div className="community-list">
          <div
            className={`community-item ${selectedCommunityId === 'general' ? 'selected' : ''}`}
            onClick={() => handleSelectCommunity('general')}
          >
            <h3>{t('pages.discussion.general')}</h3>
            <p>{t('pages.discussion.generalDescription')}</p>
          </div>
        {communities.map(community => (
          <div
            key={community.id}
            className={`community-item ${community.id === selectedCommunityId ? 'selected' : ''}`}
            onClick={() => handleSelectCommunity(community.id)}
          >
            <h3>{community.name}</h3>
            <p>{community.description}</p>
          </div>
        ))}
          {communities.length === 0 && (
            <div className="discussion-placeholder">
              <p>{t('pages.discussion.noCommunities')}</p>
            </div>
          )}
      </div>
    </div>
  );
  
  const ThreadsColumn = (
    <div className="threads-list-col">
      <div className="discussion-sidebar">
        <div className="discussion-sidebar-header">
           {isMobile && <button className="mobile-back-btn" onClick={handleMobileBack}>&larr; {t('common.back')}</button>}
          <h2>{t('pages.discussion.threads')}</h2>
          <button 
            className="new-thread-btn" 
            onClick={() => setIsThreadModalOpen(true)}
            disabled={!selectedCommunityId}
            title={!selectedCommunityId ? t('pages.discussion.selectHubFirst') : t('pages.discussion.startNewDiscussion')}
          >
            {t('pages.discussion.startNew')}
          </button>
        </div>
        <div className="thread-list">
          {filteredThreads.map(thread => (
            <div
              key={thread.id}
              className={`thread-item ${thread.id === activeThreadId ? 'selected' : ''}`}
              onClick={() => handleSelectThread(thread.id)}
            >
              <h3>{thread.title}</h3>
              <div className="thread-meta">
                <span>{thread.posts.length} {thread.posts.length === 1 ? t('common.post') : t('common.posts')}</span> &middot;{' '}
                <span>{t('common.by')} {thread.authorDisplayName}</span>
              </div>
            </div>
          ))}
          {filteredThreads.length === 0 && (
            <div className="discussion-placeholder">
              <p>{t('pages.discussion.noDiscussions')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ContentColumn = (
    <div className="discussion-main-content">
      {activeThread ? (
        <div className="active-thread-view">
          <div className="active-thread-header">
            {isMobile && <button className="mobile-back-btn" onClick={handleMobileBack}>&larr; {t('common.back')}</button>}
            <h1>{activeThread.title}</h1>
            <p>{t('pages.discussion.startedBy', { authorDisplayName: activeThread.authorDisplayName, date: new Date(activeThread.createdAt).toLocaleDateString() })}</p>
          </div>
          <div className="posts-container">
            {activeThread.posts.map(post => (
              <div key={post.id} className="post-item">
                <UserAvatar user={{ displayName: post.authorDisplayName, profilePictureUrl: post.authorProfilePictureUrl }} />
                <div className="post-main">
                  <div className="post-header">
                    <strong>{post.authorDisplayName}</strong>
                    <small>{new Date(post.createdAt).toLocaleString()}</small>
                  </div>
                  <div className="post-content">{post.content}</div>
                    <div className="post-footer">
                    <button
                      className={`like-btn ${post.likes.includes(user.email) ? 'liked' : ''}`}
                      onClick={() => onToggleLike(activeThread.id, post.id)}
                      aria-label={`Like post by ${post.authorDisplayName}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                      <span>{post.likes.length > 0 ? post.likes.length : ''}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleReplySubmit} className="reply-form">
            <textarea
              placeholder={t('pages.discussion.replyPlaceholder')}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              aria-label="Reply content"
              required
            />
            <button type="submit">{t('pages.discussion.sendReply')}</button>
          </form>
        </div>
      ) : selectedCommunityId ? (
          <div className="discussion-placeholder full-page">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <h2>{t('pages.discussion.canvasTitle')}</h2>
          <p>{t('pages.discussion.canvasDescription')}</p>
        </div>
      ) : (
         <div className="discussion-placeholder full-page">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
            <h2>{t('pages.discussion.exploreTitle')}</h2>
            <p>{t('pages.discussion.exploreDescription')}</p>
          </div>
      )}
    </div>
  );

  return (
    <>
      <div className={`discussion-page-3-col ${isMobile ? `mobile-view-${mobileView}` : ''}`}>
        {isMobile ? (
          <>
            {mobileView === 'communities' && CommunitiesColumn}
            {mobileView === 'threads' && ThreadsColumn}
            {mobileView === 'content' && ContentColumn}
          </>
        ) : (
          <>
            {CommunitiesColumn}
            {selectedCommunityId && ThreadsColumn}
            {ContentColumn}
          </>
        )}
      </div>
      <NewCommunityModal
        isOpen={isCommunityModalOpen}
        onClose={() => setIsCommunityModalOpen(false)}
        onCreate={onCreateCommunity}
      />
      <NewThreadModal 
        isOpen={isThreadModalOpen}
        onClose={() => setIsThreadModalOpen(false)}
        onCreate={handleCreateThread}
      />
    </>
  );
};

export default DiscussionPage;