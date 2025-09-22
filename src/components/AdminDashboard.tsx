import React, { useState, useEffect, useMemo } from 'react';
import { marked } from 'marked';
import { Note, User, WebConfig, Publication } from '../types.ts';
import { useTranslation } from '../App.tsx';

interface AdminDashboardProps {
  allUsers: User[];
  allNotes: Note[];
  onGoToNotes: () => void;
  currentUser: User;
  onDeleteUser: (email: string) => void;
  onSetRole: (email: string, role: User['role']) => void;
  webConfig: WebConfig | null;
  onUpdateWebConfig: (updates: Partial<WebConfig>) => void;
  publications: Publication[];
  onCreatePublication: (title: string, content: string) => void;
  onReviewPublication: (id: string, publish: boolean) => void;
  onDeletePublication: (id: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  allUsers,
  allNotes,
  onGoToNotes,
  currentUser,
  onDeleteUser,
  onSetRole,
  webConfig,
  onUpdateWebConfig,
  publications,
  onCreatePublication,
  onReviewPublication,
  onDeletePublication,
}) => {
  const { t } = useTranslation();
  const totalUsers = allUsers.length;
  const totalNotes = allNotes.length;
  const [targetEmail, setTargetEmail] = useState('');
  const [targetRole, setTargetRole] = useState<User['role']>('user');
  const [configFormData, setConfigFormData] = useState<WebConfig>({ appName: '', registrationEnabled: true });
  const [pubTitle, setPubTitle] = useState('');
  const [pubContent, setPubContent] = useState('');

  useEffect(() => {
    if (webConfig) {
      setConfigFormData(webConfig);
    }
  }, [webConfig]);

  const isDev = currentUser.role === 'dev';

  const pendingSubmissions = useMemo(() => 
    publications.filter(p => p.status === 'pending')
    .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), 
    [publications]
  );

  const publishedAnnouncements = useMemo(() =>
    publications.filter(p => p.status === 'published')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [publications]
  );

  const handleSetRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetEmail.trim() === '') return;
    if (!/\S+@\S+\.\S+/.test(targetEmail)) {
      alert('Please enter a valid email address.');
      return;
    }
    onSetRole(targetEmail.trim(), targetRole);
    setTargetEmail('');
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setConfigFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleConfigSave = () => {
    onUpdateWebConfig(configFormData);
  };
  
  const handleCreatePublicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pubTitle.trim() && pubContent.trim()) {
        onCreatePublication(pubTitle, pubContent);
        setPubTitle('');
        setPubContent('');
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-content">
        <div className="admin-header">
          <h1>{t('pages.admin.title')}</h1>
          <button onClick={onGoToNotes}>&larr; {t('pages.admin.backToNotes')}</button>
        </div>

        <div className="admin-stats">
          <div className="admin-stat-card">
            <h2>{totalUsers}</h2>
            <p>{t('pages.admin.totalUsers')}</p>
          </div>
          <div className="admin-stat-card">
            <h2>{totalNotes}</h2>
            <p>{t('pages.admin.totalNotes')}</p>
          </div>
        </div>

        <div className="admin-management-section">
          <h3>{t('pages.admin.publicationsManagement')}</h3>
          
          <h4>{t('pages.admin.pendingSubmissions')}</h4>
          {pendingSubmissions.length > 0 ? (
            <div className="admin-user-table-wrapper">
              <table className="admin-user-table">
                <thead>
                  <tr>
                    <th>{t('pages.admin.publicationTitle')}</th>
                    <th>{t('pages.admin.submittedBy')}</th>
                    <th className="actions-cell">{t('pages.admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingSubmissions.map(p => (
                    <tr key={p.id}>
                      <td>{p.title}</td>
                      <td>{p.submittedBy?.displayName || 'N/A'}</td>
                      <td>
                        <div className="actions-container">
                          <button onClick={() => onReviewPublication(p.id, true)}>{t('common.publish')}</button>
                          <button className="delete" onClick={() => onReviewPublication(p.id, false)}>{t('common.reject')}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>{t('pages.admin.noPending')}</p>
          )}

          <h4 style={{marginTop: '2rem'}}>{t('pages.admin.createPublication')}</h4>
          <form onSubmit={handleCreatePublicationSubmit} className="new-thread-form">
            <input type="text" placeholder={t('pages.admin.publicationTitle')} value={pubTitle} onChange={e => setPubTitle(e.target.value)} required />
            <textarea placeholder={t('pages.admin.publicationContent')} value={pubContent} onChange={e => setPubContent(e.target.value)} required />
            <div className="new-thread-form-actions">
              <button type="submit">{t('common.publish')}</button>
            </div>
          </form>

          <h4 style={{marginTop: '2rem'}}>{t('pages.admin.publishedAnnouncements')}</h4>
          {publishedAnnouncements.length > 0 ? (
            <div className="admin-user-table-wrapper">
              <table className="admin-user-table">
                <thead>
                  <tr>
                    <th>{t('pages.admin.publicationTitle')}</th>
                    <th>{t('common.by')}</th>
                    <th className="actions-cell">{t('pages.admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {publishedAnnouncements.map(p => (
                    <tr key={p.id}>
                      <td>{p.title}</td>
                      <td>{p.publishedBy?.displayName || 'N/A'}</td>
                      <td>
                        <div className="actions-container">
                          <button className="delete" onClick={() => onDeletePublication(p.id)}>{t('common.delete')}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
             <p>{t('pages.admin.noPublished')}</p>
          )}
        </div>

        <div className="admin-management-section">
          <h3>{t('pages.admin.userManagement')}</h3>
          <div className="admin-user-table-wrapper">
            <table className="admin-user-table">
              <thead>
                <tr>
                  <th>{t('pages.admin.displayName')}</th>
                  <th>{t('pages.admin.email')}</th>
                  <th>{t('pages.admin.role')}</th>
                  <th className="actions-cell">{t('pages.admin.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.sort((a,b) => a.email.localeCompare(b.email)).map((user) => (
                  <tr key={user.email}>
                    <td>{user.displayName}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>{user.role}</span>
                    </td>
                    <td>
                      <div className="actions-container">
                        {user.role === 'user' && (
                          <button onClick={() => onSetRole(user.email, 'admin')} disabled={!isDev}>
                            {t('pages.admin.makeAdmin')}
                          </button>
                        )}
                        {user.role === 'admin' && (
                          <>
                            <button onClick={() => onSetRole(user.email, 'dev')} disabled={!isDev}>
                              {t('pages.admin.makeDev')}
                            </button>
                            <button onClick={() => onSetRole(user.email, 'user')} disabled={!isDev}>
                              {t('pages.admin.makeUser')}
                            </button>
                          </>
                        )}
                        {user.role === 'dev' && (
                          <button onClick={() => onSetRole(user.email, 'admin')} disabled={!isDev || user.email === 'hello@hello.com'}>
                              {t('pages.admin.makeAdmin')}
                          </button>
                        )}
                        <button
                          className="delete"
                          onClick={() => onDeleteUser(user.email)}
                          disabled={
                            !isDev ||
                            user.email === currentUser.email ||
                            user.email === 'hello@hello.com' ||
                            (user.role === 'dev' && currentUser.email !== 'hello@hello.com')
                          }
                          aria-label={`Delete ${user.email}`}
                        >
                          {t('common.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {isDev && (
          <div className="admin-management-section">
              <h3>{t('pages.admin.setRoleByEmail')}</h3>
              <form onSubmit={handleSetRoleSubmit} className="admin-set-role-form">
                  <input 
                      type="email" 
                      placeholder="user@example.com"
                      value={targetEmail}
                      onChange={(e) => setTargetEmail(e.target.value)}
                      aria-label="Target user email"
                  />
                  <select value={targetRole} onChange={(e) => setTargetRole(e.target.value as User['role'])}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="dev">Dev</option>
                  </select>
                  <button type="submit">{t('pages.admin.setRole')}</button>
              </form>
              <p>{t('pages.admin.setRoleNote')}</p>
          </div>
        )}
        
         {isDev && webConfig && (
          <div className="admin-management-section">
            <h3>{t('pages.admin.configTitle')}</h3>
            <div className="profile-edit-form" style={{ maxWidth: 'none', padding: 0, background: 'none', border: 'none', gap: '1.5rem' }}>
              <div className="profile-input-group">
                <label htmlFor="appName">{t('pages.admin.appName')}</label>
                <input id="appName" name="appName" type="text" value={configFormData.appName} onChange={handleConfigChange} />
              </div>
               <div className="profile-input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
                <input id="registrationEnabled" name="registrationEnabled" type="checkbox" checked={configFormData.registrationEnabled} onChange={handleConfigChange} style={{width: 'auto'}} />
                <label htmlFor="registrationEnabled" style={{marginBottom: 0}}>{t('pages.admin.allowRegistrations')}</label>
              </div>
              <div className="profile-edit-actions" style={{ justifyContent: 'flex-start' }}>
                <button onClick={handleConfigSave}>{t('pages.admin.saveConfig')}</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;