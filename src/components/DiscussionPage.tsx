import React, { useState } from 'react';
import { User } from '../types'; // CORRECT: Import the official User type

interface DiscussionPageProps {
  currentUser: User;
}

const DiscussionPage: React.FC<DiscussionPageProps> = ({ currentUser }) => {
  // Placeholder state and functions
  const [activeView] = useState('communities'); // 'communities', 'threads', 'content'

  return (
    <div className={`discussion-page-3-col mobile-view-${activeView}`}>
      {/* Communities Sidebar */}
      <aside className="communities-sidebar">
        <div className="communities-sidebar-header">
          <h2>Communities</h2>
          <button>+</button>
        </div>
        {/* Community list would be rendered here */}
      </aside>
      
      {/* Threads List Column */}
      <section className="threads-list-col">
        <div className="discussion-sidebar">
          <div className="discussion-sidebar-header">
            <h2>Threads</h2>
            <button>+</button>
          </div>
          {/* Thread list would be rendered here */}
        </div>
      </section>

      {/* Main Content */}
      <main className="discussion-main-content">
        <div className="discussion-placeholder full-page">
          <h2>Select a thread to view</h2>
          <p>Or create a new one to start a conversation.</p>
        </div>
      </main>
    </div>
  );
};

export default DiscussionPage;
