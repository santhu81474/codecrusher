import React from 'react';

const SkillBadges = ({ skills, rating }) => {
  // Logic to determine badges based on ADA/Discrete Math scoring
  const getBadges = () => {
    const badges = [];
    
    if (rating >= 100) badges.push({ name: 'Pro Developer', color: '#58A6FF', icon: '🏆' });
    if (rating >= 50) badges.push({ name: 'Rising Star', color: '#3FB950', icon: '⭐' });
    
    skills.forEach(skill => {
        if (skill.toLowerCase() === 'react') badges.push({ name: 'React Verified', color: '#61DAFB', icon: '⚛️' });
        if (skill.toLowerCase() === 'node.js') badges.push({ name: 'Backend Master', color: '#68A063', icon: '🟢' });
    });
    
    return badges;
  };

  const badges = getBadges();

  if (badges.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
      {badges.map((badge, idx) => (
        <div key={idx} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px', 
          padding: '4px 10px', 
          borderRadius: '12px', 
          backgroundColor: `${badge.color}15`, 
          border: `1px solid ${badge.color}40`,
          fontSize: '11px',
          fontWeight: '600',
          color: badge.color
        }}>
          <span>{badge.icon}</span>
          {badge.name}
        </div>
      ))}
    </div>
  );
};

export default SkillBadges;
