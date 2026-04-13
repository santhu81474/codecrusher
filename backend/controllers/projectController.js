const Project = require('../models/Project');
const Application = require('../models/Application');
const { calculateSkillMatch } = require('../utils/mathUtils');

const createProject = async (req, res, next) => {
  try {
    const {
      title, description, requiredSkills, roleType, seniority,
      workMode, duration, openings, compensation, applicationDeadline, githubUrl
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
      githubUrl: githubUrl || '',
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
        select: 'name email username avatar isDemo',
        match: { isDemo: { $ne: true }, email: { $not: /demo/i } }
      })
      .sort({ createdAt: -1 })
      .lean();
    
    const realProjects = projects.filter(p => p.ownerId);
    res.set('Cache-Control', 'public, max-age=60');
    res.json(realProjects);
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('ownerId', 'name username avatar email')
      .populate('contributors', 'name username avatar')
      .populate('tasks.assignee', 'name username avatar');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
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

    // Check if user is the owner
    if (project.ownerId.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot apply to your own project', success: false });
    }

    // Check if already applied
    const existingApp = await Application.findOne({ projectId, userId: req.user.id });
    if (existingApp) {
      return res.json({ success: true, message: 'Already applied', matchScore: existingApp.matchScore, status: existingApp.status });
    }

    const matchScore = calculateSkillMatch(userSkills || [], project.requiredSkills);
    
    if (matchScore >= 50) {
      const application = await Application.create({
        projectId,
        userId: req.user.id,
        matchScore
      });
      
      if (!project.applicants.includes(req.user.id)) {
        project.applicants.push(req.user.id);
        await project.save();
      }
      return res.json({ success: true, message: 'Successfully applied', matchScore, status: application.status });
    } else {
      return res.json({ success: false, message: 'Skill match too low to apply', matchScore });
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

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to delete this project' });
    }

    await project.deleteOne();
    res.json({ message: 'Project removed' });
  } catch (error) {
    next(error);
  }
};

// Sprint Board Task Management
const addTask = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    // Only owner or contributors can add tasks
    const isAuthorized = project.ownerId.toString() === req.user.id || 
      (project.contributors || []).map(c => c.toString()).includes(req.user.id);
    if (!isAuthorized) return res.status(403).json({ message: 'Not authorized' });

    const { title, description, assignee, status, priority, dueDate } = req.body;
    project.tasks.push({ title, description, assignee, status: status || 'todo', priority: priority || 'medium', dueDate });
    await project.save();
    
    const updated = await Project.findById(req.params.id)
      .populate('tasks.assignee', 'name username avatar');
    res.json(updated.tasks);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const task = project.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { title, description, assignee, status, priority, dueDate } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignee !== undefined) task.assignee = assignee;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await project.save();
    const updated = await Project.findById(req.params.id)
      .populate('tasks.assignee', 'name username avatar');
    res.json(updated.tasks);
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    project.tasks = project.tasks.filter(t => t._id.toString() !== req.params.taskId);
    await project.save();
    res.json(project.tasks);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  applyToProject,
  getUserApplications,
  deleteProject,
  addTask,
  updateTask,
  deleteTask
};
