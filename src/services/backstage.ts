import { Note, User, DiscussionThread, DiscussionPost, Community, WebConfig, Publication } from '../types';

// --- DATABASE SIMULATION (using localStorage) ---
const DB_PREFIX = 'nexanotes_';

const readFromDb = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(`${DB_PREFIX}${key}`);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Failed to read from DB key "${key}":`, error);
    return null;
  }
};

const writeToDb = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(`${DB_PREFIX}${key}`, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to write to DB key "${key}":`, error);
  }
};

const removeFromDb = (key: string): void => {
  try {
    localStorage.removeItem(`${DB_PREFIX}${key}`);
  } catch (error) {
    console.error(`Failed to remove from DB key "${key}":`, error);
  }
}

// --- UTILITIES ---
const generateId = () => `id_${new Date().getTime()}_${Math.random().toString(36).substring(2, 9)}`;
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- INITIAL/DEFAULT DATA ---
const getDefaultWebConfig = (): WebConfig => ({
  appName: "NexaNotes",
  // FIX: Changed 'registration' shorthand property to 'registrationEnabled' to match WebConfig type.
  registrationEnabled: true,
});

const getDefaultUsers = (): User[] => [
  {
    email: 'hello@hello.com',
    username: 'dev_user',
    displayName: 'Dev User',
    bio: 'The main developer account.',
    role: 'dev',
    themeName: 'CyberPunk',
    cursorStyle: 'glitch',
    cursorColor: '#f923e2',
  },
];

// Initialize DB if empty
(() => {
  if (!readFromDb('users')) {
    writeToDb('users', getDefaultUsers());
  }
  if (!readFromDb('notes')) {
    writeToDb('notes', {});
  }
  if (!readFromDb('notes_all')) {
      writeToDb('notes_all', []);
  }
  if (!readFromDb('threads')) {
    writeToDb('threads', []);
  }
  if (!readFromDb('communities')) {
    writeToDb('communities', []);
  }
  if (!readFromDb('publications')) {
    writeToDb('publications', []);
  }
  if (!readFromDb('web_config')) {
    writeToDb('web_config', getDefaultWebConfig());
  }
})();

// --- API SIMULATION ---

// Auth and User Management
const getCurrentUser = async (): Promise<User | null> => {
  await delay(100);
  const email = readFromDb<string>('session');
  if (!email) return null;
  const users = readFromDb<User[]>('users') || [];
  return users.find(u => u.email === email) || null;
};

const login = async (email: string): Promise<{ user: User | null; error: string | null }> => {
  await delay(500);
  let users = readFromDb<User[]>('users') || [];
  let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  const webConfig = getWebConfig();

  if (!user) {
    if (webConfig.registrationEnabled) {
      // Auto-register user
      const newUser: User = {
        email: email.toLowerCase(),
        username: email.split('@')[0],
        displayName: email.split('@')[0],
        bio: '',
        role: 'user',
      };
      // check for pre-assigned role
      const roles = readFromDb<Record<string, User['role']>>('roles') || {};
      if (roles[newUser.email]) {
        newUser.role = roles[newUser.email];
        delete roles[newUser.email];
        writeToDb('roles', roles);
      }
      users.push(newUser);
      writeToDb('users', users);
      user = newUser;
    } else {
      return { user: null, error: 'User does not exist and registration is disabled.' };
    }
  }

  writeToDb('session', user.email);
  return { user, error: null };
};

const logout = async (): Promise<void> => {
  await delay(100);
  removeFromDb('session');
};

const updateUser = async (email: string, updates: Partial<User>): Promise<{ user: User | null; error: string | null }> => {
  let users = readFromDb<User[]>('users') || [];
  const userIndex = users.findIndex(u => u.email === email);
  if (userIndex === -1) {
    return { user: null, error: 'User not found.' };
  }
  users[userIndex] = { ...users[userIndex], ...updates };
  writeToDb('users', users);
  return { user: users[userIndex], error: null };
};

const getAllUsers = async (): Promise<User[]> => {
    return readFromDb<User[]>('users') || [];
};

const deleteUser = async (email: string): Promise<void> => {
    let users = readFromDb<User[]>('users') || [];
    writeToDb('users', users.filter(u => u.email !== email));
};

const setUserRole = async (email: string, role: User['role']): Promise<void> => {
    let users = readFromDb<User[]>('users') || [];
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (userIndex > -1) {
        users[userIndex].role = role;
        writeToDb('users', users);
    } else {
        // Pre-assign role for user who hasn't signed up yet
        const roles = readFromDb<Record<string, User['role']>>('roles') || {};
        roles[email.toLowerCase()] = role;
        writeToDb('roles', roles);
    }
};

// Notes Management
const createNote = async (authorEmail: string, title: string, content: string): Promise<Note> => {
  const newNote: Note = {
    id: generateId(),
    title,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const allNotes = readFromDb<Record<string, Note[]>>('notes') || {};
  if (!allNotes[authorEmail]) {
      allNotes[authorEmail] = [];
  }
  allNotes[authorEmail].unshift(newNote);
  writeToDb('notes', allNotes);

  const globalNotes = readFromDb<Note[]>('notes_all') || [];
  globalNotes.unshift(newNote);
  writeToDb('notes_all', globalNotes);

  return newNote;
};

const getNotes = async (authorEmail: string): Promise<Note[]> => {
  const allNotes = readFromDb<Record<string, Note[]>>('notes') || {};
  return (allNotes[authorEmail] || []).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

const updateNote = async (id: string, updates: Partial<Note>): Promise<Note | null> => {
  const allNotes = readFromDb<Record<string, Note[]>>('notes') || {};
  let updatedNote: Note | null = null;
  let ownerEmail: string | null = null;
  
  for (const email in allNotes) {
      const noteIndex = allNotes[email].findIndex(n => n.id === id);
      if (noteIndex !== -1) {
          allNotes[email][noteIndex] = { ...allNotes[email][noteIndex], ...updates, updatedAt: new Date().toISOString() };
          updatedNote = allNotes[email][noteIndex];
          ownerEmail = email;
          break;
      }
  }

  if (ownerEmail && updatedNote) {
    writeToDb('notes', allNotes);
    
    const globalNotes = readFromDb<Note[]>('notes_all') || [];
    const globalNoteIndex = globalNotes.findIndex(n => n.id === id);
    if (globalNoteIndex !== -1) {
        globalNotes[globalNoteIndex] = updatedNote;
        writeToDb('notes_all', globalNotes);
    }
  }

  return updatedNote;
};

const deleteNote = async (id: string): Promise<void> => {
    const allNotes = readFromDb<Record<string, Note[]>>('notes') || {};
    for (const email in allNotes) {
        allNotes[email] = allNotes[email].filter(n => n.id !== id);
    }
    writeToDb('notes', allNotes);

    const globalNotes = readFromDb<Note[]>('notes_all') || [];
    writeToDb('notes_all', globalNotes.filter(n => n.id !== id));
};

const getAllNotes = async (): Promise<Note[]> => {
  return readFromDb<Note[]>('notes_all') || [];
};


// Discussion Management
const getThreads = async (): Promise<DiscussionThread[]> => {
    return readFromDb<DiscussionThread[]>('threads') || [];
};

const getCommunities = async (): Promise<Community[]> => {
    return readFromDb<Community[]>('communities') || [];
};

const createCommunity = async (name: string, description: string, authorEmail: string): Promise<Community> => {
    const newCommunity: Community = {
        id: generateId(),
        name,
        description,
        createdAt: new Date().toISOString(),
        authorEmail,
    };
    const communities = readFromDb<Community[]>('communities') || [];
    communities.unshift(newCommunity);
    writeToDb('communities', communities);
    return newCommunity;
};

const createThread = async (communityId: string | null, title: string, content: string, author: User): Promise<DiscussionThread> => {
    const newPost: DiscussionPost = {
        id: generateId(),
        authorEmail: author.email,
        authorDisplayName: author.displayName,
        authorProfilePictureUrl: author.profilePictureUrl,
        content,
        createdAt: new Date().toISOString(),
        likes: [],
    };
    const newThread: DiscussionThread = {
        id: generateId(),
        communityId,
        title,
        authorEmail: author.email,
        authorDisplayName: author.displayName,
        authorProfilePictureUrl: author.profilePictureUrl,
        createdAt: new Date().toISOString(),
        posts: [newPost],
    };
    const threads = readFromDb<DiscussionThread[]>('threads') || [];
    threads.unshift(newThread);
    writeToDb('threads', threads);
    return newThread;
};

const addPostToThread = async (threadId: string, content: string, author: User): Promise<DiscussionThread> => {
    const threads = readFromDb<DiscussionThread[]>('threads') || [];
    const threadIndex = threads.findIndex(t => t.id === threadId);
    if (threadIndex === -1) throw new Error('Thread not found');

    const newPost: DiscussionPost = {
        id: generateId(),
        authorEmail: author.email,
        authorDisplayName: author.displayName,
        authorProfilePictureUrl: author.profilePictureUrl,
        content,
        createdAt: new Date().toISOString(),
        likes: [],
    };
    threads[threadIndex].posts.push(newPost);
    writeToDb('threads', threads);
    return threads[threadIndex];
};

const togglePostLike = async (threadId: string, postId: string, userEmail: string): Promise<DiscussionThread> => {
    const threads = readFromDb<DiscussionThread[]>('threads') || [];
    const thread = threads.find(t => t.id === threadId);
    if (!thread) throw new Error('Thread not found');
    
    const post = thread.posts.find(p => p.id === postId);
    if (!post) throw new Error('Post not found');

    const likeIndex = post.likes.indexOf(userEmail);
    if (likeIndex > -1) {
        post.likes.splice(likeIndex, 1);
    } else {
        post.likes.push(userEmail);
    }

    writeToDb('threads', threads);
    return thread;
};


// Web Config
const getWebConfig = (): WebConfig => {
    return readFromDb<WebConfig>('web_config') || getDefaultWebConfig();
};

const updateWebConfig = async(updates: Partial<WebConfig>): Promise<WebConfig> => {
    const currentConfig = getWebConfig();
    const newConfig = { ...currentConfig, ...updates };
    writeToDb('web_config', newConfig);
    return newConfig;
};

// Publications
const getPublications = async (): Promise<Publication[]> => {
  return readFromDb<Publication[]>('publications') || [];
};

const submitPublicationProposal = async (title: string, content: string, user: User): Promise<Publication> => {
  const proposal: Publication = {
    id: generateId(),
    title,
    content,
    createdAt: new Date().toISOString(),
    status: 'pending',
    submittedBy: {
      email: user.email,
      displayName: user.displayName,
    },
  };
  const publications = await getPublications();
  publications.unshift(proposal);
  writeToDb('publications', publications);
  return proposal;
};

const createDirectPublication = async (title: string, content: string, author: User): Promise<Publication> => {
  if (author.role !== 'admin' && author.role !== 'dev') throw new Error('Unauthorized');
  const publication: Publication = {
    id: generateId(),
    title,
    content,
    createdAt: new Date().toISOString(),
    status: 'published',
    publishedBy: {
      email: author.email,
      displayName: author.displayName,
      role: author.role,
    },
  };
  const publications = await getPublications();
  publications.unshift(publication);
  writeToDb('publications', publications);
  return publication;
};

const reviewPublication = async (id: string, publish: boolean, publisher: User): Promise<Publication[] | null> => {
  if (publisher.role !== 'admin' && publisher.role !== 'dev') throw new Error('Unauthorized');
  let publications = await getPublications();
  const index = publications.findIndex(p => p.id === id);
  if (index === -1) return null;

  if (publish) {
    publications[index].status = 'published';
    publications[index].publishedBy = {
      email: publisher.email,
      displayName: publisher.displayName,
      role: publisher.role,
    };
    publications[index].createdAt = new Date().toISOString(); // Update timestamp to publication date
  } else {
    // Reject by deleting
    publications.splice(index, 1);
  }
  
  writeToDb('publications', publications);
  return publications;
};

const deletePublication = async (id: string, user: User): Promise<Publication[]> => {
    if (user.role !== 'admin' && user.role !== 'dev') throw new Error('Unauthorized');
    let publications = await getPublications();
    publications = publications.filter(p => p.id !== id);
    writeToDb('publications', publications);
    return publications;
};


// FIX: Exported a 'backstage' object containing all service functions to be used by the application.
export const backstage = {
    getNotes,
    getThreads,
    getCommunities,
    getWebConfig,
    getCurrentUser,
    login,
    logout,
    createNote,
    updateNote,
    deleteNote,
    updateUser,
    createCommunity,
    createThread,
    addPostToThread,
    togglePostLike,
    getAllUsers,
    getAllNotes,
    deleteUser,
    setUserRole,
    updateWebConfig,
    getPublications,
    submitPublicationProposal,
    createDirectPublication,
    reviewPublication,
    deletePublication,
};