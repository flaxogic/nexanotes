import React from 'react';
import { User } from '../types'; // CORRECT: Import the official User type

interface UserAvatarProps {
  user: User | null;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user }) => {
  if (!user) return null;

  const getInitials = (username: string) => {
    return username?.charAt(0).toUpperCase() || '?';
  };

  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  };

  if (user.avatarUrl) {
    return <img src={user.avatarUrl} alt={user.username} className="user-avatar-img" />;
  }

  return (
    <div
      className="user-avatar"
      style={{ backgroundColor: stringToColor(user.id) }}
      title={user.username}
    >
      {getInitials(user.username)}
    </div>
  );
};

export default UserAvatar;
