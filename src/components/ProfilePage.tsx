import React, { useState } from 'react';
import { User } from '../types'; // <-- CORRECT: Import the official User type
import UserAvatar from './UserAvatar';

// The props now correctly use the imported User type
interface ProfilePageProps {
  user: User;
  onUpdateUser: (updatedUser: Partial<User>) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  // NOTE: The form state would go here if editing was implemented
  // For now, this is a read-only component.

  const handleEditToggle = () => setIsEditing(!isEditing);

  if (isEditing) {
    // This would be the editing form component
    return <div>Editing form goes here...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-grid">
        <aside className="profile-sidebar">
          <div className="profile-avatar-wrapper">
            <UserAvatar user={user} />
          </div>
          <h1>{user.username}</h1>
          <p className="profile-email">{user.email}</p>
          {user.role === 'admin' && <span className="admin-badge">Admin</span>}
          {user.role === 'dev' && <span className="dev-badge">Dev</span>}
          <p className="profile-bio">{user.bio || 'No bio provided.'}</p>
          <button onClick={handleEditToggle} className="edit-profile-btn">
            Edit Profile
          </button>
        </aside>

        <div className="profile-main-content">
          <section className="profile-stats">
            <div className="stat-card">
              <h2>0</h2>
              <p>Notes Created</p>
            </div>
            <div className="stat-card">
              <h2>0</h2>
              <p>Threads Started</p>
            </div>
            <div className="stat-card">
              <h2>0</h2>
              <p>Likes Received</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
