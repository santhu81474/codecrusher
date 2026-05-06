import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { fetchProjects, applyToProject } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalProjects: 0, myApplications: 0, myOwned: 0 });
  const [activity] = useState([
    { id: 1, text: 'Alex joined Project Quantum', time: '2m ago', type: 'join' },
    { id: 2, text: 'Sarah submitted a review', time: '5m ago', type: 'review' },
    { id: 3, text: 'New asset deployed successfully', time: '12m ago', type: 'deploy' },
  ]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [invertedIndex, setInvertedIndex] = useState({});

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q') || '';

  useEffect(() => {
    const loadRealProjects = async () => {
      const cached = sessionStorage.getItem('cached_projects');
      if (cached) {
        const data = JSON.parse(cached);
        setProjects(data);
        const mine = (data || []).filter(p => p.applicants?.includes(user?.id));
        const owned = (data || []).filter(p => p.ownerId?._id === user?.id);
        setStats({
          totalProjects: data?.length || 0,
          myApplications: mine.length,
          myOwned: owned.length
        });
        setLoading(false);
      }

      try {
        const { data } = await fetchProjects();
        sessionStorage.setItem('cached_projects', JSON.stringify(data));
        setProjects(data);
        const mine = (data || []).filter(p => p.applicants?.includes(user?.id));
        const owned = (data || []).filter(p => p.ownerId?._id === user?.id);
        setStats({
          totalProjects: data?.length || 0,
          myApplications: mine.length,
          myOwned: owned.length
        });
      } catch (error) {
        console.error("Error fetching live projects dataset:", error);
      } finally {
        setLoading(false);
      }
    };
    loadRealProjects();
  }, []);

  const handleApply = async (projectId) => {
    try {
      const { data } = await applyToProject(projectId, user?.skills || []);
      if (!data.success && data.success !== undefined) {
        alert(`Application Failed: ${data.message} (Match Score: ${data.matchScore}%)`);
        return;
      }
      alert(`Success: ${data.message} (Match Score: ${data.matchScore}%)`);
      
      setProjects(prev => prev.map(p => {
        if (p._id === projectId) {
          return { ...p, applicants: [...(p.applicants || []), user?.id] };
        }
        return p;
      }));
    } catch (error) {
      alert(`Application Failed: ${error.response?.data?.message || 'Score match too low or invalid request'}`);
    }
  };

  useEffect(() => {
    if (projects.length > 0) {
      setTimeout(() => {
        const index = {};
        projects.forEach(p => {
          const keywords = `${p.title} ${p.description} ${p.ownerId?.name || ''}`.toLowerCase().split(/\W+/).filter(w => w.length > 2);
          keywords.forEach(word => {
            if (!index[word]) index[word] = new Set();
            index[word].add(p._id);
          });
        });
        setInvertedIndex(index);
      }, 0);
    }
  }, [projects]);

  if (!user) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
          <div className="text-white/60 mb-4">You are not logged in.</div>
          <Link to="/login" className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 transition-colors rounded-lg text-white font-medium">Log In</Link>
        </div>
      </div>
    );
  }

  const getFilteredProjects = () => {
    if (!searchQuery.trim()) return projects;
    
    const searchTerms = searchQuery.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    if (searchTerms.length === 0) return projects.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchingIds = null;
    searchTerms.forEach(term => {
      const idsForTerm = invertedIndex[term] || new Set();
      if (matchingIds === null) {
        matchingIds = new Set(idsForTerm);
      } else {
        matchingIds = new Set([...matchingIds].filter(id => idsForTerm.has(id)));
      }
    });

    return projects.filter(p => matchingIds?.has(p._id));
  };

  const filteredProjects = getFilteredProjects();

  if (loading) return (
    <div className="max-w-[1300px] mx-auto flex gap-8 px-5 min-h-[80vh] pt-8 animate-pulse">
      <div className="flex-[7] min-w-0">
        <div className="h-[120px] bg-white/5 rounded-2xl mb-8" />
        <div className="flex gap-4 mb-8">
          <div className="h-24 bg-white/5 rounded-2xl flex-1" />
          <div className="h-24 bg-white/5 rounded-2xl flex-1" />
          <div className="h-24 bg-white/5 rounded-2xl flex-1" />
        </div>
        <div className="grid grid-cols-2 gap-5">
          {[1,2,3,4].map(i => <div key={i} className="h-[280px] bg-white/5 rounded-2xl" />)}
        </div>
      </div>
      <div className="flex-[3] flex flex-col gap-6">
        <div className="h-[400px] bg-white/5 rounded-2xl" />
        <div className="h-[250px] bg-white/5 rounded-2xl" />
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen pt-8 pb-16">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[30%] h-[30%] rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />
      
      <div className="max-w-[1300px] mx-auto flex flex-col lg:flex-row gap-8 px-5 relative z-10">
        {/* Left Column: Main Dashboard (70%) */}
        <div className="flex-[7] min-w-0">
          
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-white/10 p-8 mb-8 backdrop-blur-md transition-all hover:border-white/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
                Welcome back, {user?.name?.split(' ')[0] || 'Explorer'}
              </h1>
              <p className="text-indigo-200/70 font-medium">
                Here's what's happening in your workspace today.
              </p>
            </div>
          </div>

          {/* Premium Stats Row */}
          <div className="flex gap-4 mb-10 overflow-x-auto pb-2 -mx-2 px-2 snap-x">
            <div className="flex-1 min-w-[200px] snap-center rounded-2xl bg-white/[0.03] border border-white/5 p-6 backdrop-blur-xl relative overflow-hidden group hover:bg-white/[0.05] transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
              <div className="text-blue-400 mb-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <div className="text-4xl font-bold text-white mb-1">{stats.totalProjects}</div>
              <div className="text-sm text-white/50 font-medium uppercase tracking-wider">Total Projects</div>
            </div>

            <div className="flex-1 min-w-[200px] snap-center rounded-2xl bg-white/[0.03] border border-white/5 p-6 backdrop-blur-xl relative overflow-hidden group hover:bg-white/[0.05] transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
              <div className="text-emerald-400 mb-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="text-4xl font-bold text-white mb-1">{stats.myApplications}</div>
              <div className="text-sm text-white/50 font-medium uppercase tracking-wider">Active Apps</div>
            </div>

            <div className="flex-1 min-w-[200px] snap-center rounded-2xl bg-white/[0.03] border border-white/5 p-6 backdrop-blur-xl relative overflow-hidden group hover:bg-white/[0.05] transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
              <div className="text-amber-400 mb-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
              </div>
              <div className="text-4xl font-bold text-white mb-1">{stats.myOwned}</div>
              <div className="text-sm text-white/50 font-medium uppercase tracking-wider">Owned Assets</div>
            </div>
          </div>

          {/* Section Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Discover Projects</h2>
            {searchQuery && (
              <div className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                Results for "{searchQuery}"
              </div>
            )}
          </div>

          {/* Project Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.length === 0 ? (
              <div className="col-span-2 flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
                <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No projects found</h3>
                <p className="text-white/50 max-w-md mb-6">We couldn't find any projects matching your criteria. Try adjusting your search or start a new project.</p>
                <Link to="/projects/create" className="px-6 py-2.5 bg-white text-black font-medium rounded-xl hover:bg-gray-200 transition-colors shadow-lg shadow-white/10">
                  Create New Project
                </Link>
              </div>
            ) : (
              filteredProjects.map(project => {
                const hasApplied = project.applicants?.includes(user?.id);
                
                return (
                  <div key={project._id} 
                    className="group flex flex-col p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.15] hover:bg-white/[0.04] transition-all duration-300 cursor-pointer backdrop-blur-md relative overflow-hidden"
                    onClick={() => setSelectedProject(project)}>
                    
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">{project.title}</h3>
                        <span className="text-xs font-medium text-white/40 bg-white/5 px-2.5 py-1 rounded-full whitespace-nowrap">
                          {new Date(project.timestamp).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-[10px] font-bold text-white">
                          {(project.ownerId?.name || 'A')[0].toUpperCase()}
                        </div>
                        <span className="text-sm text-white/60">
                          by <span className="text-white/80 font-medium">{project.ownerId?.name || 'Anonymous User'}</span>
                        </span>
                      </div>
                      
                      <p className="text-white/60 text-sm mb-6 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.requiredSkills.slice(0, 3).map(skill => (
                          <span key={skill} className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {skill}
                          </span>
                        ))}
                        {project.requiredSkills.length > 3 && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/50 border border-white/10">
                            +{project.requiredSkills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-5 border-t border-white/[0.05] flex justify-between items-center mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {[...Array(Math.min(project.applicants?.length || 0, 3))].map((_, i) => (
                            <div key={i} className="w-7 h-7 rounded-full bg-gray-700 border-2 border-[#12121a] flex items-center justify-center text-[10px]" />
                          ))}
                        </div>
                        <span className="text-xs text-white/50 ml-2">{project.applicants?.length || 0} members</span>
                      </div>
                      
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            hasApplied 
                            ? 'bg-white/5 text-white/50 cursor-default' 
                            : 'bg-white text-black hover:bg-gray-200 shadow-lg shadow-white/10 hover:shadow-white/20 hover:-translate-y-0.5'
                          }`}
                          onClick={(e) => { e.stopPropagation(); !hasApplied && handleApply(project._id); }} 
                          disabled={hasApplied}
                        >
                          {hasApplied ? 'Applied' : 'Join'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Sidebar (30%) */}
        <div className="flex-[3] flex flex-col gap-6">
          
          {/* Quick Actions */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-indigo-600/10 to-transparent border border-indigo-500/20 backdrop-blur-md">
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <Link to="/create" className="group flex items-center justify-between p-4 rounded-2xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5">
                <span>Deploy Project</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
              <Link to="/leaderboard" className="flex items-center justify-between p-4 rounded-2xl bg-white/5 text-white/80 font-medium hover:bg-white/10 hover:text-white transition-all border border-white/5">
                <span>Leaderboard</span>
              </Link>
              <Link to="/arena" className="flex items-center justify-between p-4 rounded-2xl bg-white/5 text-white/80 font-medium hover:bg-white/10 hover:text-white transition-all border border-white/5">
                <span>Algo Arena</span>
              </Link>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <h3 className="text-lg font-bold text-white">Live Activity</h3>
            </div>
            
            <div className="flex flex-col gap-5">
              {activity.map((a, index) => (
                <div key={a.id} className="flex gap-4 relative">
                  {index !== activity.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-[-20px] w-px bg-white/10" />
                  )}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                    a.type === 'join' ? 'bg-blue-500/20 text-blue-400' :
                    a.type === 'review' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    <div className="w-2 h-2 rounded-full bg-current" />
                  </div>
                  <div>
                    <p className="text-sm text-white/80 leading-snug mb-1">{a.text}</p>
                    <span className="text-xs text-white/40">{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="p-5 rounded-2xl bg-black/40 border border-white/5 flex justify-between items-center mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-white/60">System Operational</span>
            </div>
            <span className="text-xs font-medium text-white/40">12ms Ping</span>
          </div>
        </div>

        {/* Project Details Modal */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={() => setSelectedProject(null)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div 
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0f0f13] border border-white/10 rounded-3xl shadow-2xl shadow-black/50" 
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex justify-between items-center p-6 bg-[#0f0f13]/90 backdrop-blur-md border-b border-white/5">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedProject.title}</h2>
                  <div className="text-sm text-white/50 flex items-center gap-2">
                    <span>by <span className="text-white/80">{selectedProject.ownerId?.name || 'Anonymous User'}</span></span>
                    <span>•</span>
                    <span>{new Date(selectedProject.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedProject(null)} 
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              
              {/* Modal Body */}
              <div className="p-6 sm:p-8">
                <div className="mb-8">
                  <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">About Project</h4>
                  <p className="text-white/80 text-base leading-relaxed whitespace-pre-wrap">{selectedProject.description}</p>
                </div>

                <div className="mb-8">
                  <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Required Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.requiredSkills?.map(skill => (
                      <span key={skill} className="px-4 py-2 rounded-xl text-sm font-medium bg-white/5 text-white/80 border border-white/10">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Team Members</div>
                    <div className="text-3xl font-bold text-white">{selectedProject.applicants?.length || 0}</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Project ID</div>
                    <div className="text-sm font-mono text-white/60 truncate">{selectedProject._id}</div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    to={`/projects/${selectedProject._id}/chat`} 
                    className="flex-1 py-3.5 px-6 rounded-xl text-center font-medium bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10"
                  >
                    Open Terminal Chat
                  </Link>
                  <button 
                    className={`flex-1 py-3.5 px-6 rounded-xl font-medium transition-all shadow-lg ${
                      selectedProject.applicants?.includes(user?.id) 
                      ? 'bg-white/10 text-white/50 cursor-default shadow-none' 
                      : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5'
                    }`}
                    onClick={() => !selectedProject.applicants?.includes(user?.id) && handleApply(selectedProject._id)}
                    disabled={selectedProject.applicants?.includes(user?.id)}
                  >
                    {selectedProject.applicants?.includes(user?.id) ? 'Application Sent' : 'Apply to Join'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
