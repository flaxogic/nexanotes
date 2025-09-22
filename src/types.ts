// FIX: Declares the 'emoji-picker' custom element globally for TypeScript JSX to prevent type errors.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'emoji-picker': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  summary?: string;
  isMarkdown?: boolean;
}

export interface Theme {
  name: string;
  colors: {
    '--background-color': string;
    '--text-color': string;
    '--primary-color': string;
    '--sidebar-bg': string;
    '--note-list-bg': string;
    '--note-item-bg': string;
    '--note-item-hover-bg': string;
    '--note-item-selected-bg': string;
    '--editor-bg': string;
    '--border-color': string;
    '--button-bg': string;
    '--button-hover-bg': string;
    '--font-family': string;
  };
}

export interface User {
  email: string;
  username: string;
  displayName: string;
  bio: string;
  role: 'user' | 'admin' | 'dev';
  profilePictureUrl?: string;
  themeName?: string;
  cursorStyle?: CursorStyle;
  cursorColor?: string;
  language?: 'en' | 'fr' | 'zh';
}

export type CursorStyle = 'default' | 'dot' | 'crosshair' | 'underline' | 'blade' | 'orbit' | 'glitch';

export interface Gif {
  url: string;
  alt: string;
}

export interface DiscussionPost {
  id: string;
  authorEmail: string;
  authorDisplayName: string;
  authorProfilePictureUrl?: string;
  content: string;
  createdAt: string;
  likes: string[];
}

// A Community for discussions
export interface Community {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  authorEmail: string;
}

export interface DiscussionThread {
  id:string;
  communityId: string | null; // Link thread to a community, or null for general
  title: string;
  authorEmail: string;
  authorDisplayName: string;
  authorProfilePictureUrl?: string;
  createdAt: string;
  posts: DiscussionPost[];
}

export interface WebConfig {
  appName: string;
  registrationEnabled: boolean;
}

export interface Publication {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  status: 'published' | 'pending';
  submittedBy?: {
    email: string;
    displayName: string;
  };
  publishedBy?: {
    email: string;
    displayName: string;
    role: 'admin' | 'dev';
  };
}