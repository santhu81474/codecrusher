/**
 * Computes intersection of user skills and project required skills.
 * Discrete Mathematics Concept: Intersection of Sets.
 * Formula: (intersection / total required skills) * 100
 */
const calculateSkillMatch = (userSkills, requiredSkills) => {
  if (!requiredSkills || requiredSkills.length === 0) return 100;
  if (!userSkills || userSkills.length === 0) return 0;
  
  // Set Theory (Discrete Mathematics)
  const userSkillSet = new Set(userSkills.map(s => s.toLowerCase().trim()));
  let matchCount = 0;
  
  requiredSkills.forEach(reqSkill => {
    if (userSkillSet.has(reqSkill.toLowerCase().trim())) {
      matchCount++;
    }
  });
  
  return (matchCount / requiredSkills.length) * 100;
};

/**
 * Discrete Mathematics / ADA Concept:
 * Sorting Users based on score = rating + projectsCompleted
 * Efficient Method: O(n log n) using Merge Sort algorithm implementation.
 */
const mergeSortUsers = (users) => {
  if (users.length <= 1) return users;
  const mid = Math.floor(users.length / 2);
  const left = mergeSortUsers(users.slice(0, mid));
  const right = mergeSortUsers(users.slice(mid));
  return merge(left, right);
};

const merge = (left, right) => {
  let result = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    let scoreLeft = (left[i].rating || 0) + (left[i].projectsCompleted || 0);
    let scoreRight = (right[j].rating || 0) + (right[j].projectsCompleted || 0);
    
    // Sort descending (higher scores first)
    if (scoreLeft >= scoreRight) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  
  return result.concat(left.slice(i)).concat(right.slice(j));
};

module.exports = { calculateSkillMatch, mergeSortUsers };
