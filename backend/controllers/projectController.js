const Project = require('../models/Project');
const Application = require('../models/Application');
const { calculateSkillMatch } = require('../utils/mathUtils');

const createProject = async (req, res, next) => {
  try {
    const {
      title,
      description,
      requiredSkills,
      roleType,
      seniority,
      workMode,
      duration,
      openings,
      compensation,
      applicationDeadline
    } = req.body;
    const project = await Project.create({
      title,
      description,
      requiredSkills: requiredSkills || [],
      ownerId: req.user.id,
      roleType: roleType || '',
      seniority: seniority || '',
      workMode: workMode || '',
      duration: duration || '',
      openings: openings || 1,
      compensation: compensation || '',
      applicationDeadline: applicationDeadline || undefined
    });
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({})
      .populate({
        path: 'ownerId',
        select: 'name email isDemo',
        match: { isDemo: { $ne: true }, email: { $not: /demo/i } }
      });
    
    // Filter out projects where the owner was excluded by the populate match
    const realProjects = projects.filter(p => p.ownerId);
    res.json(realProjects);
  } catch (error) {
    next(error);
  }
};

const applyToProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { userSkills } = req.body; 
    
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const matchScore = calculateSkillMatch(userSkills || [], project.requiredSkills);
    
    if (matchScore >= 50) {
      // Create application record if it doesn't exist
      let application = await Application.findOne({ projectId, userId: req.user.id });
      if (!application) {
        application = await Application.create({
          projectId,
          userId: req.user.id,
          matchScore
        });
        
        // Update project applicants array for visual count consistency
        if (!project.applicants.includes(req.user.id)) {
          project.applicants.push(req.user.id);
          await project.save();
        }
      }
      res.json({ message: 'Successfully applied', matchScore, status: application.status });
    } else {
      res.status(400).json({ message: 'Skill match too low to apply', matchScore });
    }
  } catch (error) {
    next(error);
  }
};

const getUserApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ userId: req.user.id })
      .populate('projectId', 'title createdAt');
    
    const formatted = applications.map(app => ({
      id: app.projectId?._id,
      applicationId: app._id,
      title: app.projectId?.title || 'Unknown Project',
      status: app.status,
      appliedDate: app.appliedAt.toISOString().split('T')[0]
    }));
    
    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

module.exports = { createProject, getProjects, applyToProject, getUserApplications };
