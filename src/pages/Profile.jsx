import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import SkillBadges from '../components/SkillBadges';
import ScoreRing from '../components/ScoreRing';
import Chart from 'react-apexcharts';
import { updateProfile, fetchProjects, fetchUserApplications, getSnippets, deleteProject as deleteProjectAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const Profile = () => {
    // Tab constants for Project Terminal
    const TAB_COMPLETED = 'Completed';
    const TAB_MY = 'My Projects';
    const TAB_APPS = 'Applications';
    const [activeTab, setActiveTab] = useState(TAB_COMPLETED);
    const { user, setUserFromProfile } = useAuth();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);

    const [githubEdit, setGithubEdit] = useState(user?.githubUrl || '');
    const [linkedinEdit, setLinkedinEdit] = useState(user?.linkedinUrl || '');
    const [savingSocial, setSavingSocial] = useState(false);
    const [socialMessage, setSocialMessage] = useState('');
    const [ownedProjects, setOwnedProjects] = useState([]);
    const [applications, setApplications] = useState([]);
    const [activity, setActivity] = useState([]);
    const [snippetCount, setSnippetCount] = useState(0);
    const [loadingActivity, setLoadingActivity] = useState(true);
  
    // Mocking profile extra details (used as fallback only)
    const profileDetails = {
      skills: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
      rating: 4.8,
      completedProjects: [
        { id: 101, title: 'CRM Dashboard' },
        { id: 102, title: 'Inventory API' }
      ]
    };

    const chartCategories = user?.skills?.length ? user.skills.slice(0, 5) : ['Frontend', 'Backend', 'DevOps', 'DSA', 'System Design'];
    const chartData = chartCategories.map((_, i) => [80, 70, 95, 90, 60][i % 5]);

    useEffect(() => {
      const load = async () => {
        if (!user?.id) {
          setLoadingActivity(false);
          return;
        }
        try {
          const [projectsRes, appsRes, snippetsRes] = await Promise.all([
            fetchProjects(),
            fetchUserApplications(),
            getSnippets()
          ]);
          const allProjects = projectsRes.data || [];
          const myOwned = allProjects.filter(p => p.ownerId?._id === user.id);
          setOwnedProjects(myOwned);

          const apps = appsRes.data || [];
          setApplications(apps);
          
          const snippets = snippetsRes.data || [];
          setSnippetCount(snippets.filter(s => s.authorId?._id === user.id).length);

          const monthMap = new Map();

          const addEvent = (dateString, type) => {
            if (!dateString) return;
            const d = new Date(dateString);
            if (Number.isNaN(d.getTime())) return;
            const y = d.getFullYear();
            const m = d.getMonth();
            const key = `${y}-${m}`;
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            if (!monthMap.has(key)) {
              monthMap.set(key, { year: y, month: m, label: `${monthNames[m]} ${y}`, created: 0, applied: 0 });
            }
            const entry = monthMap.get(key);
            if (type === 'created') entry.created += 1;
            if (type === 'applied') entry.applied += 1;
          };

          myOwned.forEach(p => addEvent(p.createdAt || p.timestamp, 'created'));
          apps.forEach(a => addEvent(a.appliedDate, 'applied'));

          const activityArray = Array.from(monthMap.values()).sort((a, b) => (
            a.year === b.year ? a.month - b.month : a.year - b.year
          ));

          setActivity(activityArray);
        } catch (err) {
          console.error('Error loading profile activity', err);
        } finally {
          setLoadingActivity(false);
        }
      };

      load();
    }, [user?.id]);

    const handleSaveSocial = async () => {
      try {
        setSavingSocial(true);
        setSocialMessage('');
        const { data } = await updateProfile({ githubUrl: githubEdit, linkedinUrl: linkedinEdit });
        setUserFromProfile(data);
        setSocialMessage('Links updated successfully.');
      } catch (err) {
        console.error('Error updating social links', err);
        setSocialMessage('Could not update links. Please try again.');
      } finally {
        setSavingSocial(false);
        setTimeout(() => setSocialMessage(''), 3000);
      }
    };

    const openDeleteModal = (project) => {
      setProjectToDelete(project);
      setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
      setProjectToDelete(null);
      setIsDeleteModalOpen(false);
    };

    const handleDeleteProject = async () => {
      if (!projectToDelete) return;
      try {
        await deleteProjectAPI(projectToDelete._id);
        setOwnedProjects(prev => prev.filter(p => p._id !== projectToDelete._id));
        toast.success(`Project "${projectToDelete.title}" deleted successfully.`);
        closeDeleteModal();
      } catch (err) {
        console.error('Failed to delete project', err);
        toast.error('Failed to delete project. Please try again.');
        closeDeleteModal();
      }
    };

    return (
      <>
        <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', gap: '40px', alignItems: 'flex-start', padding: '0 20px' }}>
          
          {/* Sidebar (300px fixed width for stability) */}
          <aside style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* User Identity Card */}
            <section className="glass-panel scan-line" style={{ padding: '32px 24px', position: 'relative' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px' }}>
                <div style={{ 
                  width: '100px', 
                  height: '100px', 
                  backgroundColor: 'var(--primary)', 
                  color: 'white', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '2.8rem', 
                  fontWeight: 800, 
                  boxShadow: '0 0 24px var(--primary-glow)',
                  border: '2px solid rgba(255,255,255,0.1)'
                }}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="mono" style={{ marginBottom: 4, fontSize: 22, color: 'var(--neon-green)' }}>{user?.name || 'User'}</h2>
                  <p className="mono" style={{ color: 'var(--text-muted)', fontSize: 13, letterSpacing: 0.5 }}>{user?.email}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', margin: '24px 0', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 20 }}>
                <a href={user?.githubUrl || '#'} target="_blank" rel="noreferrer" className="mono" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 12, color: 'var(--text-muted)' }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
                  GITHUB
                </a>
                <a href={user?.linkedinUrl || '#'} target="_blank" rel="noreferrer" className="mono" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 12, color: 'var(--text-muted)' }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M14.82 0H1.18A1.169 1.169 0 000 1.154v13.694A1.168 1.168 0 001.18 16h13.64A1.17 1.17 0 0016 14.845V1.15A1.171 1.171 0 0014.82 0zM4.744 13.64H2.369V5.996h2.375v7.644zm-1.18-8.684a1.377 1.377 0 11.002-2.753 1.377 1.377 0 01-.002 2.753zm10.07 8.684h-2.368V9.936c0-.883-.014-2.018-1.23-2.018-1.231 0-1.42 .961-1.42 1.956v3.766H6.25V5.996h2.273v1.045h.032c.316-.6 1.09-1.23 2.242-1.23 2.398 0 2.841 1.578 2.841 3.63v4.2z"></path></svg>
                  LINKEDIN
                </a>
              </div>

              {(!user?.githubUrl || !user?.linkedinUrl) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {!user?.githubUrl && (
                      <input type="url" placeholder="GitHub URL" value={githubEdit} onChange={(e) => setGithubEdit(e.target.value)} className="form-input mono" style={{ fontSize: 11, padding: '8px 12px' }} />
                  )}
                  {!user?.linkedinUrl && (
                      <input type="url" placeholder="LinkedIn URL" value={linkedinEdit} onChange={(e) => setLinkedinEdit(e.target.value)} className="form-input mono" style={{ fontSize: 11, padding: '8px 12px' }} />
                  )}
                  <button onClick={handleSaveSocial} className="btn btn-outline mono" style={{ fontSize: 11, padding: '8px', width: '100%' }}>
                    {savingSocial ? 'SYNCING...' : 'Update Social Nodes'}
                  </button>
                </div>
              )}
            </section>

            {/* Tactical Stats */}
            <section className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sync Stability</span>
                <span className="mono" style={{ color: '#F59E0B', fontWeight: 800 }}>★ {user?.rating || 0}</span>
              </div>
              <SkillBadges skills={user?.skills || []} rating={user?.rating || 0} />
              
              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="card neon-hover" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="mono" style={{ fontSize: 18, color: 'var(--link-color)', fontWeight: 700 }}>{ownedProjects.length}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Nodes_Created</div>
                </div>
                <div className="card neon-hover" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="mono" style={{ fontSize: 18, color: 'var(--neon-green)', fontWeight: 700 }}>{user?.applicationsCount || applications.length}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Apps_Deployed</div>
                </div>
                <div className="card neon-hover" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="mono" style={{ fontSize: 18, color: '#F59E0B', fontWeight: 700 }}>{user?.challengesSolved || 0}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Arena_Solved</div>
                </div>
                <div className="card neon-hover" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="mono" style={{ fontSize: 18, color: 'var(--link-color)', fontWeight: 700 }}>{snippetCount}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Forge_Snippets</div>
                </div>
              </div>

              <Link to="/skill-test" className="btn btn-primary mono" style={{ width: '100%', marginTop: 24, fontSize: 12 }}>Run Skill Validation</Link>
            </section>

            {/* Dynamic Metric Ring */}
            <section className="glass-panel scan-line" style={{ padding: '24px' }}>
              <div className="mono" style={{ fontSize: 12, color: 'var(--neon-green)', letterSpacing: 2, marginBottom: '24px', textAlign: 'center' }}>
                CRUSHER METRIC
              </div>
              <ScoreRing 
                codeActivity={Math.min((ownedProjects.length + applications.length) * 15, 100)} 
                collaboration={Math.min((user?.rating || 0) * 20, 100)} 
                challengeWins={Math.min((user?.challengesSolved || 0) * 25, 100)} 
                profileCompleteness={(user?.githubUrl ? 50 : 0) + (user?.linkedinUrl ? 50 : 0)} 
              />
            </section>
          </aside>

          {/* Main Content Area */}
          <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Top Row: Visualizations Hub */}
            <div style={{ display: 'grid', gridTemplateColumns: '5.5fr 4.5fr', gap: '24px' }}>
              
              {/* Skill Matrix Node */}
              <section className="glass-panel" style={{ padding: '24px' }}>
                <div className="mono" style={{ fontSize: 13, color: 'var(--neon-green)', marginBottom: 20, letterSpacing: 2 }}>Neural Skill Matrix</div>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <Chart
                      options={{
                        chart: { id: 'skill-radar', toolbar: { show: false }, background: 'transparent' },
                        xaxis: { 
                          categories: chartCategories, 
                          labels: { style: { colors: '#8b949e', fontSize: '10px', fontFamily: 'var(--font-mono)' } } 
                        },
                        yaxis: { show: false, min: 0, max: 100 },
                        fill: { opacity: 0.2, colors: ['#2ecc71'] },
                        stroke: { show: true, width: 2, colors: ['#2ecc71'] },
                        markers: { size: 4, colors: ['#2ecc71'] },
                        grid: { show: false },
                        theme: { mode: 'dark' }
                      }}
                      series={[{ name: 'Skill Level', data: chartData }]}
                      type="radar"
                      height="220"
                    />
                  </div>
                  <div style={{ width: '130px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {chartCategories.map(skill => (
                      <div key={skill} className="badge mono" style={{ fontSize: 9, margin: 0, textAlign: 'center' }}>{skill}</div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Proof-of-Work Grid */}
              <section className="glass-panel" style={{ padding: '24px' }}>
                <div className="mono" style={{ fontSize: 13, color: 'var(--link-color)', marginBottom: 20, letterSpacing: 2 }}>Proof of Work</div>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', maxWidth: '240px', margin: '0 auto' }}>
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div key={i} style={{ 
                      width: '13px', 
                      height: '13px', 
                      backgroundColor: i % 8 === 0 ? 'var(--neon-green)' : i % 5 === 0 ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                      borderRadius: '2px',
                      boxShadow: i % 8 === 0 ? '0 0 4px var(--neon-green)' : 'none'
                    }} />
                  ))}
                </div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 24, textAlign: 'center' }}>
                  Log Sequence: Attached Active
                </div>
              </section>
            </div>

            {/* Project Terminal */}
            <section className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#e5e7eb' }}>Project Terminal</h2>
                <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px' }}>
                  {[TAB_MY, TAB_APPS, TAB_COMPLETED].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        padding: '6px 14px',
                        border: 'none',
                        borderRadius: '6px',
                        backgroundColor: activeTab === tab ? 'var(--primary)' : 'transparent',
                        color: activeTab === tab ? 'white' : '#a1a1aa',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              
              <div style={{ minHeight: '200px' }}>
                {activeTab === TAB_MY && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {ownedProjects.map(p => (
                      <li key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                        <Link to={`/project/${p._id}`} style={{ color: '#c9d1d9', textDecoration: 'none', fontWeight: 500 }}>{p.title}</Link>
                        <button onClick={() => openDeleteModal(p)} className="text-red-500 hover:text-red-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </li>
                    ))}
                    {ownedProjects.length === 0 && <p className="text-gray-400 text-sm">You haven't created any projects yet.</p>}
                  </ul>
                )}
                {activeTab === TAB_APPS && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {applications.length === 0 ? (
                      <div className="mono" style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', padding: '40px' }}>Zero Active Deployments</div>
                    ) : applications.map(app => (
                      <li key={app._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                        <div className="mono" style={{ color: 'var(--text-main)', fontSize: 14 }}>{app.projectTitle || 'Project_Node'}</div>
                        <div className="badge mono" style={{ margin: 0, fontSize: 9, opacity: 0.8 }}>{app.status || 'PENDING'}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </main>
        </div>

        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-8 max-w-sm w-full">
              <h2 className="text-xl font-bold text-white mb-4">Confirm Deletion</h2>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete the project "{projectToDelete?.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProject}
                  className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 text-white font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
};

export default Profile;
