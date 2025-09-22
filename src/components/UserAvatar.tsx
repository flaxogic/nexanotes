import React from 'react';

interface UserAvatarProps {
  user: {
    displayName: string;
    profilePictureUrl?: string;
  };
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, className = '' }) => {
  const getInitials = (name: string) => {
    const names = name.split(' ').filter(Boolean);
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  };

  const intToRGB = (i: number) => {
    const c = (i & 0x00FFFFFF).toString(16).toUpperCase();
    return "00000".substring(0, 6 - c.length) + c;
  };

  if (user.profilePictureUrl) {
    return (
      <img
        src={user.profilePictureUrl}
        alt={user.displayName}
        className={`user-avatar-img ${className}`}
        title={user.displayName}
      />
    );
  }

  const initials = getInitials(user.displayName);
  const color = `#${intToRGB(hashCode(user.displayName))}`;

  return (
    <div className={`user-avatar ${className}`} style={{ backgroundColor: color }} title={user.displayName}>
      {initials}
    </div>
  );
};

export default UserAvatar;