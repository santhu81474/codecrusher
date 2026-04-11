import React, { useEffect, useState } from 'react';

const ScoreRing = ({ 
  codeActivity = 0, 
  collaboration = 0, 
  challengeWins = 0, 
  profileCompleteness = 0 
}) => {
  // We calculate a total metric score out of 100 based on the sub-scores
  // You can weight these however you like!
  const maxScore = 400; // max 100 per category
  const actualScore = Math.min(
    codeActivity + collaboration + challengeWins + profileCompleteness, 
    maxScore
  );
  const percentage = Math.round((actualScore / maxScore) * 100);

  // Animation state
  const [animatedPct, setAnimatedPct] = useState(0);

  useEffect(() => {
    // Basic counting animation
    let start = 0;
    const duration = 1500; // 1.5 seconds
    const increment = percentage / (duration / 16); // 60fps

    const timer = setInterval(() => {
      start += increment;
      if (start >= percentage) {
        setAnimatedPct(percentage);
        clearInterval(timer);
      } else {
        setAnimatedPct(Math.round(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [percentage]);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPct / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
      {/* Animated Ring */}
      <div style={{ position: 'relative', width: '150px', height: '150px' }}>
        {/* Background track */}
        <svg fill="transparent" width="150" height="150" viewBox="0 0 150 150">
          <circle 
            cx="75" cy="75" r={radius} 
            stroke="rgba(255,255,255,0.1)" strokeWidth="12" 
          />
          {/* Animated progress track */}
          <circle 
            cx="75" cy="75" r={radius} 
            stroke="var(--neon-green, #4ade80)" 
            strokeWidth="12" 
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.1s linear', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        </svg>
        
        {/* Center Text */}
        <div style={{ 
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' 
        }}>
          <span className="mono" style={{ fontSize: '32px', fontWeight: '800', color: 'white', textShadow: '0 0 10px var(--neon-green, #4ade80)' }}>
            {animatedPct}
          </span>
          <span className="mono" style={{ fontSize: '10px', color: 'var(--text-muted, #9ca3af)', letterSpacing: '1px' }}>
            CRUSH METRIC
          </span>
        </div>
      </div>

      {/* Sub-score Bars */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <SubScore label="Code Activity" value={codeActivity} color="#3b82f6" />
        <SubScore label="Collaboration" value={collaboration} color="#a855f7" />
        <SubScore label="Challenge Wins" value={challengeWins} color="#f59e0b" />
        <SubScore label="Profile Logic" value={profileCompleteness} color="#ef4444" />
      </div>
    </div>
  );
};

const SubScore = ({ label, value, color }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Small delay to let the ring animation start first
    const timer = setTimeout(() => {
      setWidth(Math.min(value, 100));
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }} className="mono">
        <span style={{ color: 'var(--text-muted, #9ca3af)' }}>{label}</span>
        <span style={{ fontWeight: 'bold', color: 'white' }}>{value}/100</span>
      </div>
      <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ 
          width: `${width}%`, 
          height: '100%', 
          backgroundColor: color, 
          borderRadius: '3px',
          boxShadow: `0 0 8px ${color}`,
          transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' 
        }} />
      </div>
    </div>
  );
};

export default ScoreRing;