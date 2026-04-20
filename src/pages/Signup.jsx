import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [skills, setSkills] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
      await signup(name, email, password, skillsArray, githubUrl, linkedinUrl);
      navigate('/dashboard');
    } catch (err) {
      console.error("Signup Error:", err);
      const status = err.response?.status;
      if (status === 400) {
        setError(err.response?.data?.message || 'Invalid details or user already exists.');
      } else if (status === 500) {
        setError('Server error during signup. Please try again later.');
      } else {
        setError(err.response?.data?.message || err.message || 'Unexpected error during signup.');
      }
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '60px auto', padding: '32px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '300', marginBottom: 0 }}>Create your account</h2>
      </div>

      {error && <div style={{ backgroundColor: 'rgba(248, 81, 73, 0.1)', border: '1px solid rgba(248, 81, 73, 0.4)', color: '#ff7b72', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="block font-medium mb-2" style={{ color: 'var(--text-main)', fontSize: '14px' }}>Full Name</label>
          <input 
            type="text" 
            className="form-input w-full" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            style={{ padding: '8px 12px' }}
          />
        </div>
        <div>
          <label className="block font-medium mb-2" style={{ color: 'var(--text-main)', fontSize: '14px' }}>Email address</label>
          <input 
            type="email" 
            className="form-input w-full" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ padding: '8px 12px' }}
          />
        </div>
        <div>
          <label className="block font-medium mb-2" style={{ color: 'var(--text-main)', fontSize: '14px' }}>Password</label>
          <input 
            type="password" 
            className="form-input w-full" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ padding: '8px 12px' }}
          />
        </div>
        <div>
          <label className="block font-medium mb-2" style={{ color: 'var(--text-main)', fontSize: '14px' }}>Skills (comma-separated)</label>
          <input 
            type="text" 
            className="form-input w-full" 
            placeholder="e.g. React, Node.js, Graph Theory"
            value={skills} 
            onChange={(e) => setSkills(e.target.value)} 
            style={{ padding: '8px 12px' }}
          />
        </div>
        <div>
          <label className="block font-medium mb-2" style={{ color: 'var(--text-main)', fontSize: '14px' }}>GitHub Profile Link</label>
          <input 
            type="url" 
            className="form-input w-full" 
            placeholder="https://github.com/yourusername"
            value={githubUrl} 
            onChange={(e) => setGithubUrl(e.target.value)} 
            style={{ padding: '8px 12px' }}
          />
        </div>
        <div>
          <label className="block font-medium mb-2" style={{ color: 'var(--text-main)', fontSize: '14px' }}>LinkedIn Profile Link</label>
          <input 
            type="url" 
            className="form-input w-full" 
            placeholder="https://linkedin.com/in/yourusername"
            value={linkedinUrl} 
            onChange={(e) => setLinkedinUrl(e.target.value)} 
            style={{ padding: '8px 12px' }}
          />
        </div>
        <button type="submit" className="btn btn-primary mt-2" style={{ width: '100%', padding: '10px' }}>Create Account</button>
      </form>

      <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--link-color)' }}>Sign in instead.</Link>
      </div>
    </div>
  );
};

export default Signup;
