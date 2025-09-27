import React, { useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import SettingsModal from './components/SettingsModal';
import ProfilePage from './components/ProfilePage';
import Auth from './components/Auth';
import SharedNoteViewer from './components/SharedNoteViewer';
import CustomCursor from './components/CustomCursor';
import AdminDashboard from './components/AdminDashboard';
import HomePage from './components/HomePage';
import DiscussionPage from './components/DiscussionPage';
import { Note, User } from './types';
import { themes } from './styles/themes';

const App: React.FC = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [theme, setTheme] = useState('NexaDark');
    const [activeView, setActiveView] = useState('notes');
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // This useEffect is no longer needed to load from localStorage.
    // We will replace this with Firebase's auth state listener in a future step.
    /*
    useEffect(() => {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            setCurrentUser(JSON.parse(savedUser));
        }
    }, []);
    */

    useEffect(() => {
        document.documentElement.className = '';
        document.documentElement.classList.add(themes[theme].className);
    }, [theme]);

    const handleNoteSelect = (id: string) => {
        setActiveNoteId(id);
    };

    const activeNote = notes.find(note => note.id === activeNoteId);

    // THIS IS THE UPDATED FUNCTION
    const handleAuthSuccess = (userFromAuth: User) => {
        console.log("Authentication successful! User data:", userFromAuth);
        setCurrentUser(userFromAuth);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        // We will add Firebase logout logic here later
    };

    if (!currentUser) {
        return <Auth onAuthSuccess={handleAuthSuccess} />;
    }

    return (
        <>
            <CustomCursor />
            <div className="app-wrapper">
                <TopBar
                    user={currentUser}
                    onLogout={handleLogout}
                    onNavigate={setActiveView}
                    activeView={activeView}
                />
                <main className="app-container">
                    {/* Render content based on activeView */}
                    {activeView === 'notes' && (
                        <div className="content-area">
                            <NoteList notes={notes} onNoteSelect={handleNoteSelect} activeNoteId={activeNoteId} />
                            <NoteEditor note={activeNote} onNoteUpdate={() => {}} />
                        </div>
                    )}
                    {activeView === 'home' && <HomePage />}
                    {activeView === 'discussion' && <DiscussionPage currentUser={currentUser} />}
                    {activeView === 'profile' && <ProfilePage user={currentUser} onUpdateUser={() => {}} />}
                    {activeView === 'admin' && currentUser.role === 'admin' && <AdminDashboard />}
                </main>
            </div>
            {isSettingsVisible && (
                <SettingsModal
                    onClose={() => setIsSettingsVisible(false)}
                    currentTheme={theme}
                    onThemeChange={setTheme}
                />
            )}
        </>
    );
};

export default App;
