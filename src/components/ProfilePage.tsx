import React, { useState, useEffect, useRef } from 'react';
import { Note, User } from '../types.ts';
import UserAvatar from './UserAvatar.tsx';
import { useTranslation } from '../App.tsx';

interface ProfilePageProps {
  notes: Note[];
  onGoToNotes: () => void;
  user: User;
  onSaveProfile: (updatedData: Partial<User>) => Promise<string | null>;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ notes, onGoToNotes, user, onSaveProfile }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    bio: '',
    email: '',
    profilePictureUrl: '',
  });
  const [errors, setErrors] = useState({ username: '', email: '', general: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect to safely synchronize local state with the user prop when it's available or changes.
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName,
        username: user.username,
        bio: user.bio,
        email: user.email,
        profilePictureUrl: user.profilePictureUrl || '',
      });
    }
  }, [user]);

  const totalNotes = notes.length;
  const totalWords = notes.reduce((sum, note) => sum + (note.content.split(/\s+/).filter(Boolean).length), 0);
  const averageWords = totalNotes > 0 ? Math.round(totalWords / totalNotes) : 0;
  const notesSummarized = notes.filter(note => note.summary).length;

  const validate = (name: string, value: string): string => {
    if (name === 'username') {
      if (!value) return 'Username cannot be empty.';
      const regex = /^[a-zA-Z0-9_]{3,15}$/;
      if (!regex.test(value)) return 'Must be 3-15 characters using letters, numbers, and underscores.';
    }
    if (name === 'email') {
      if (!value) return 'Email cannot be empty.';
      if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email address.';
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      const error = validate(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePictureUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const usernameError = validate('username', formData.username);

    if (usernameError) {
      setErrors({ username: usernameError, email: '', general: '' });
      return;
    }
    
    setErrors({ username: '', email: '', general: '' });
    
    const resultError = await onSaveProfile({
        displayName: formData.displayName,
        username: formData.username,
        bio: formData.bio,
        profilePictureUrl: formData.profilePictureUrl,
    });

    if (resultError) {
        setErrors(prev => ({...prev, general: resultError}));
    } else {
        setIsEditing(false);
    }
  };

  if (!user) {
    return <div>{t('common.loading')}</div>;
  }

  if (isEditing) {
    return (
      <div className="profile-page">
        <form className="profile-edit-form" onSubmit={handleSubmit}>
          <h2>{t('pages.profile.editTitle')}</h2>
          {errors.general && <p className="input-error-message">{errors.general}</p>}
          
          <div className="profile-input-group" style={{ alignItems: 'center' }}>
            <label>{t('pages.profile.profilePicture')}</label>
            <div className="profile-avatar-editor" onClick={handleAvatarClick} role="button" tabIndex={0} aria-label="Upload new profile picture">
              <UserAvatar 
                user={{ displayName: user.displayName, profilePictureUrl: formData.profilePictureUrl }} 
              />
              <div className="avatar-edit-overlay">{t('pages.profile.changePhoto')}</div>
            </div>
            <input 
              ref={fileInputRef}
              type="file" 
              id="photo-upload" 
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoChange} 
            />
          </div>

          <div className="profile-input-group">
            <label htmlFor="displayName">{t('pages.profile.displayName')}</label>
            <input id="displayName" name="displayName" type="text" value={formData.displayName} onChange={handleChange} />
          </div>

          <div className="profile-input-group">
            <label htmlFor="username">{t('pages.profile.username')}</label>
            <input id="username" name="username" type="text" value={formData.username} onChange={handleChange} />
            {errors.username && <p className="input-error-message">{errors.username}</p>}
          </div>
          
          <div className="profile-input-group">
            <label htmlFor="email">{t('pages.profile.email')}</label>
            <input id="email" name="email" type="email" value={formData.email} readOnly disabled />
          </div>

          <div className="profile-input-group">
            <label htmlFor="bio">{t('pages.profile.bio')}</label>
            <textarea id="bio" name="bio" rows={4} value={formData.bio} onChange={handleChange}></textarea>
          </div>

          <div className="profile-edit-actions">
            <button type="button" onClick={() => setIsEditing(false)}>{t('common.cancel')}</button>
            <button type="submit">{t('pages.profile.save')}</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-grid">
        <aside className="profile-sidebar">
          <div className="profile-avatar-wrapper">
            <UserAvatar user={user} />
          </div>
          <h1>{user.displayName}</h1>
          <p className="profile-username">@{user.username}</p>
          <p className="profile-email">{user.email}</p>
          {user.role === 'admin' && <span className="admin-badge">{t('topbar.admin')}</span>}
          {user.role === 'dev' && <span className="dev-badge">{t('topbar.dev')}</span>}
          <p className="profile-bio">{user.bio || t('pages.profile.noBio')}</p>
          <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>{t('pages.profile.editButton')}</button>
        </aside>
        
        <main className="profile-main-content">
          <div className="profile-stats">
            <div className="stat-card">
              <h2>{totalNotes}</h2>
              <p>{t('pages.profile.totalNotes')}</p>
            </div>
            <div className="stat-card">
              <h2>{totalWords}</h2>
              <p>{t('pages.profile.totalWords')}</p>
            </div>
            <div className="stat-card">
              <h2>{averageWords}</h2>
              <p>{t('pages.profile.avgWords')}</p>
            </div>
            <div className="stat-card">
              <h2>{notesSummarized}</h2>
              <p>{t('pages.profile.notesSummarized')}</p>
            </div>
          </div>
          <div className="back-to-notes-btn-wrapper">
             <button onClick={onGoToNotes}>&larr; {t('pages.profile.backToNotes')}</button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;