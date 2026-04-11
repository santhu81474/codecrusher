import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../services/api';

const CreateProject = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillsConfig, setSkillsConfig] = useState('');
  const [roleType, setRoleType] = useState('');
  const [seniority, setSeniority] = useState('');
  const [workMode, setWorkMode] = useState('Remote');
  const [duration, setDuration] = useState('');
  const [openings, setOpenings] = useState(1);
  const [compensation, setCompensation] = useState('');
  const [applicationDeadline, setApplicationDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Formatting CSV inputs uniformly for DB
    const requiredSkills = skillsConfig.split(',').map(s => s.trim()).filter(s => s);

    try {
      await createProject({
        title,
        description,
        requiredSkills,
        roleType,
        seniority,
        workMode,
        duration,
        openings,
        compensation,
        applicationDeadline: applicationDeadline || undefined
      });
      alert('Production successfully committed to MongoDB collection!');
      navigate('/dashboard');
    } catch (error) {
      alert(`Server Deploy Failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '980px', margin: '40px auto', padding: '32px' }}>
      <h1 className="page-title" style={{ marginBottom: '24px' }}>Draft Network Project</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.7fr) minmax(0, 1.1fr)', gap: '24px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-main)', marginBottom: '8px' }}>Project Key Identifier (Title)</label>
          <input 
            type="text" 
            className="form-input w-full"
            placeholder="e.g. Next.js Enterprise Node Controller"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-main)', marginBottom: '8px' }}>Extensive Documentation (Description)</label>
          <textarea 
            className="form-input w-full"
            style={{ minHeight: '120px', resize: 'vertical' }}
            placeholder="Deploy the scope, runtime timelines, and discrete goals..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-main)', marginBottom: '4px' }}>Role Type</label>
            <select
              className="form-input w-full"
              value={roleType}
              onChange={e => setRoleType(e.target.value)}
            >
              <option value="">Select a role type</option>
              <option value="Internship">Internship</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Freelance">Freelance / Contract</option>
              <option value="Open Source">Open Source</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-main)', marginBottom: '4px' }}>Seniority</label>
            <select
              className="form-input w-full"
              value={seniority}
              onChange={e => setSeniority(e.target.value)}
            >
              <option value="">Any level</option>
              <option value="Student">Student / Fresher</option>
              <option value="Junior">Junior</option>
              <option value="Mid">Mid-level</option>
              <option value="Senior">Senior</option>
              <option value="Lead">Lead</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }}>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-main)', marginBottom: '4px' }}>Work Mode</label>
            <select
              className="form-input w-full"
              value={workMode}
              onChange={e => setWorkMode(e.target.value)}
            >
              <option value="Remote">Remote</option>
              <option value="Onsite">Onsite</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-main)', marginBottom: '4px' }}>Duration</label>
            <input
              type="text"
              className="form-input w-full"
              placeholder="e.g. 3 months, 6 weeks"
              value={duration}
              onChange={e => setDuration(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-main)', marginBottom: '4px' }}>Openings</label>
            <input
              type="number"
              min="1"
              className="form-input w-full"
              value={openings}
              onChange={e => setOpenings(Number(e.target.value) || 1)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-main)', marginBottom: '4px' }}>Compensation</label>
            <input
              type="text"
              className="form-input w-full"
              placeholder="e.g. Stipend, Paid, Equity only"
              value={compensation}
              onChange={e => setCompensation(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-main)', marginBottom: '4px' }}>Application Deadline</label>
            <input
              type="date"
              className="form-input w-full"
              value={applicationDeadline}
              onChange={e => setApplicationDeadline(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-main)', marginBottom: '8px' }}>Target Alignments (Skills - CSV format)</label>
          <input 
            type="text" 
            className="form-input w-full"
            placeholder="React, Node.js, Graph Theory"
            value={skillsConfig}
            onChange={e => setSkillsConfig(e.target.value)}
            required
          />
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}><path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm6.5-.25A.75.75 0 017.25 7h1a.75.75 0 01.75.75v2.75h.25a.75.75 0 010 1.5h-2a.75.75 0 010-1.5h.25v-2h-.25a.75.75 0 01-.75-.75zM8 6a1 1 0 100-2 1 1 0 000 2z"></path></svg>
            This array will be mathematically calculated via Intersection logic against users trying to accept requirements.
          </p>
        </div>
        <button
          type="submit"
          className="btn btn-primary mt-4"
          disabled={loading}
          style={{ padding: '12px 24px', fontSize: '16px', marginTop: '10px' }}
        >
          {loading ? 'Transmitting to Server...' : 'Commit Source & Publish Payload'}
        </button>
        </form>

        {/* Live preview card to make creation interactive */}
        <div className="card" style={{ alignSelf: 'flex-start' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <h3 className="card-title" style={{ marginBottom: 0 }}>{title || 'Project title preview'}</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{applicationDeadline ? `Apply by ${new Date(applicationDeadline).toLocaleDateString()}` : 'No deadline set'}</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '10px' }}>{description || 'Describe your project so candidates know what they are joining.'}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
            {roleType && (
              <span className="badge">{roleType}</span>
            )}
            {seniority && (
              <span className="badge">{seniority}</span>
            )}
            {workMode && (
              <span className="badge">{workMode}</span>
            )}
            {duration && (
              <span className="badge">{duration}</span>
            )}
            {!!openings && (
              <span className="badge">{openings} opening{openings > 1 ? 's' : ''}</span>
            )}
            {compensation && (
              <span className="badge">{compensation}</span>
            )}
          </div>
          <div>
            <h4 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '6px' }}>Skills preview</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {skillsConfig.split(',').map(s => s.trim()).filter(Boolean).slice(0, 8).map(skill => (
                <span key={skill} className="badge" style={{ fontSize: '11px' }}>{skill}</span>
              ))}
              {skillsConfig.trim() === '' && (
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Skills you add will appear here.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
