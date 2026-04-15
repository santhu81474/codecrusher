import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getProjectById, addProjectTask, updateProjectTask, deleteProjectTask, generateSprintPlan } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const COLUMNS = [
  { id: 'backlog', label: 'Backlog', color: '#7a828e' },
  { id: 'todo', label: 'To Do', color: 'var(--text-muted)' },
  { id: 'in_progress', label: 'In Progress', color: 'var(--accent-amber)' },
  { id: 'review', label: 'In Review', color: 'var(--primary)' },
  { id: 'done', label: 'Done', color: 'var(--accent-green)' },
];

const PRIORITY_COLORS = {
  low: { bg: 'rgba(16,185,129,0.1)', color: 'var(--accent-green)', label: 'Low' },
  medium: { bg: 'rgba(245,158,11,0.1)', color: 'var(--accent-amber)', label: 'Medium' },
  high: { bg: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)', label: 'High' },
};

const SprintBoard = () => {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingToColumn, setAddingToColumn] = useState('backlog');
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });
  const [generating, setGenerating] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getProjectById(projectId);
        setProject(data);
        setTasks(data.tasks || []);
      } catch (err) {
        toast.error('Failed to load project');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  const getColumnTasks = (status) => tasks.filter(t => t.status === status);

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;
    try {
      const { data } = await addProjectTask(projectId, { ...newTask, status: addingToColumn });
      setTasks(data);
      setNewTask({ title: '', description: '', priority: 'medium' });
      setShowAddModal(false);
      toast.success('Task added');
    } catch (err) {
      toast.error('Failed to add task');
    }
  };

  const handleMoveTask = async (taskId, newStatus) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    try {
      const { data } = await updateProjectTask(projectId, taskId, { status: newStatus });
      setTasks(data);
    } catch (err) {
      toast.error('Failed to move task');
      // Revert
      const { data } = await getProjectById(projectId);
      setTasks(data.tasks || []);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      const { data } = await deleteProjectTask(projectId, taskId);
      setTasks(data);
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleAIPlan = async () => {
    if (!project?.description) {
      toast.error('Project needs a description for AI planning');
      return;
    }
    setGenerating(true);
    try {
      const { data } = await generateSprintPlan(project.description);
      // Add all generated tasks
      const allTasks = [];
      for (const [status, statusTasks] of Object.entries(data)) {
        if (Array.isArray(statusTasks)) {
          for (const task of statusTasks) {
            allTasks.push({ ...task, status });
          }
        }
      }
      // Batch add tasks
      for (const task of allTasks) {
        await addProjectTask(projectId, task);
      }
      // Refresh
      const { data: refreshed } = await getProjectById(projectId);
      setTasks(refreshed.tasks || []);
      toast.success(`Generated ${allTasks.length} tasks!`);
    } catch (err) {
      toast.error('AI planning failed');
    } finally {
      setGenerating(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== columnId) {
      handleMoveTask(draggedTask._id, columnId);
    }
    setDraggedTask(null);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 20px' }}>
        <div className="skeleton" style={{ height: '40px', width: '300px', marginBottom: '24px', borderRadius: '8px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: '400px', borderRadius: '12px' }} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '4px' }}>Sprint Board</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{project?.title}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleAIPlan} disabled={generating} className="btn btn-outline" style={{ fontSize: '12px', gap: '6px' }}>
            {generating ? 'Generating...' : '✦ AI Sprint Planner'}
          </button>
          <button onClick={() => { setAddingToColumn('backlog'); setShowAddModal(true); }} className="btn btn-primary" style={{ fontSize: '12px' }}>
            + Add Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', minHeight: '500px' }}>
        {COLUMNS.map(col => (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            {/* Column Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: col.color }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{col.label}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--border-color)', padding: '1px 6px', borderRadius: '10px' }}>
                  {getColumnTasks(col.id).length}
                </span>
              </div>
              <button 
                onClick={() => { setAddingToColumn(col.id); setShowAddModal(true); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px', padding: '2px 6px', borderRadius: '4px' }}
              >
                +
              </button>
            </div>

            {/* Column Body */}
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', borderRadius: '10px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '100px', border: '1px dashed var(--border-color)' }}>
              {getColumnTasks(col.id).map(task => {
                const p = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
                return (
                  <div
                    key={task._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    className="card neon-hover"
                    style={{ padding: '12px', cursor: 'grab', margin: 0 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{task.title}</h4>
                      <button onClick={() => handleDeleteTask(task._id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', padding: 0, lineHeight: 1 }}>×</button>
                    </div>
                    {task.description && (
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '8px' }}>
                        {task.description.length > 80 ? task.description.slice(0, 80) + '...' : task.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: p.bg, color: p.color, fontWeight: 500 }}>{p.label}</span>
                      {task.assignee && (
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '9px', fontWeight: 600 }}>
                          {task.assignee?.name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {getColumnTasks(col.id).length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '12px', opacity: 0.5 }}>
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div role="dialog" aria-modal="true" onClick={() => setShowAddModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: '450px', animation: 'pageIn 0.2s ease-out' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '20px', color: 'var(--text-primary)' }}>Add Task</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Title</label>
                <input type="text" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className="form-input" placeholder="Task title" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Description</label>
                <textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} className="form-input" rows="3" placeholder="Optional description" style={{ resize: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Priority</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {Object.entries(PRIORITY_COLORS).map(([key, val]) => (
                    <button key={key} onClick={() => setNewTask({ ...newTask, priority: key })} className="btn" style={{ flex: 1, fontSize: '12px', padding: '6px', background: newTask.priority === key ? val.bg : 'transparent', color: val.color, border: `1px solid ${newTask.priority === key ? val.color : 'var(--border-color)'}` }}>
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button onClick={() => setShowAddModal(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                <button onClick={handleAddTask} className="btn btn-primary" style={{ flex: 1 }}>Add Task</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintBoard;
