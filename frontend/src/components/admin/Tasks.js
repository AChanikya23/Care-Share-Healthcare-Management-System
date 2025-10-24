import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../Navbar';
import './Tasks.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    priority: 'medium',
    due_date: '',
    allowances: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const [tasksRes, empRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/employees')
      ]);
      
      setTasks(tasksRes.data.tasks || []);
      setEmployees(empRes.data.employees || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/tasks', formData);
      alert('✅ Task created and assigned successfully!');
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        assigned_to: '',
        priority: 'medium',
        due_date: '',
        allowances: ''
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        alert('Task deleted successfully');
        fetchData();
      } catch (error) {
        alert('Error deleting task: ' + error.response?.data?.error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'in_progress': return '#2196f3';
      case 'completed': return '#4caf50';
      case 'rejected': return '#f44336';
      default: return '#999';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return '⏳ Pending';
      case 'in_progress': return '🔄 In Progress';
      case 'completed': return '✓ Completed';
      case 'rejected': return '❌ Rejected';
      default: return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#999';
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{padding: '50px', textAlign: 'center'}}>Loading tasks...</div>
      </>
    );
  }

  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const rejectedTasks = tasks.filter(t => t.status === 'rejected').length;

  return (
    <>
      <Navbar />
      <div style={{padding: '30px', background: '#f5f5f5', minHeight: 'calc(100vh - 60px)'}}>
        {/* Header */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
          <div>
            <h1 style={{margin: 0}}>Task Management</h1>
            <p style={{color: '#666', marginTop: '5px'}}>Assign and track employee tasks</p>
          </div>
          <div style={{display: 'flex', gap: '10px'}}>
            <button 
              onClick={() => setShowForm(!showForm)}
              style={{
                padding: '12px 24px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {showForm ? '✕ Cancel' : '+ New Task'}
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '12px 24px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px'}}>
          <div style={{background: 'white', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #ffc107'}}>
            <h3 style={{margin: '0 0 10px 0', color: '#666', fontSize: '14px'}}>Pending Tasks</h3>
            <p style={{fontSize: '32px', fontWeight: 'bold', color: '#ffc107', margin: 0}}>{pendingTasks}</p>
          </div>
          <div style={{background: 'white', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #2196f3'}}>
            <h3 style={{margin: '0 0 10px 0', color: '#666', fontSize: '14px'}}>In Progress</h3>
            <p style={{fontSize: '32px', fontWeight: 'bold', color: '#2196f3', margin: 0}}>{inProgressTasks}</p>
          </div>
          <div style={{background: 'white', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #4caf50'}}>
            <h3 style={{margin: '0 0 10px 0', color: '#666', fontSize: '14px'}}>Completed</h3>
            <p style={{fontSize: '32px', fontWeight: 'bold', color: '#4caf50', margin: 0}}>{completedTasks}</p>
          </div>
          <div style={{background: 'white', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #f44336'}}>
            <h3 style={{margin: '0 0 10px 0', color: '#666', fontSize: '14px'}}>Rejected</h3>
            <p style={{fontSize: '32px', fontWeight: 'bold', color: '#f44336', margin: 0}}>{rejectedTasks}</p>
          </div>
        </div>

        {/* Create Task Form */}
        {showForm && (
          <div style={{background: 'white', padding: '30px', borderRadius: '10px', marginBottom: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}}>
            <h2 style={{marginTop: 0}}>Create New Task</h2>
            {error && (
              <div style={{background: '#fee', color: '#c33', padding: '10px', borderRadius: '5px', marginBottom: '20px'}}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                <div style={{gridColumn: 'span 2'}}>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Task Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    placeholder="Enter task title"
                    style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}
                  />
                </div>

                <div style={{gridColumn: 'span 2'}}>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                    placeholder="Enter task description"
                    rows="4"
                    style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}
                  />
                </div>

                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Assign To *</label>
                  <select
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                    required
                    style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.users?.name} - {emp.position}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Priority *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    required
                    style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Due Date *</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    required
                    style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}
                  />
                </div>

                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Allowances (₹)</label>
                  <input
                    type="number"
                    value={formData.allowances}
                    onChange={(e) => setFormData({...formData, allowances: e.target.value})}
                    placeholder="Enter allowance amount"
                    min="0"
                    step="0.01"
                    style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}
                  />
                  <small style={{color: '#666', fontSize: '12px', display: 'block', marginTop: '5px'}}>
                    Optional bonus/incentive for completing this task
                  </small>
                </div>
              </div>

              <button 
                type="submit"
                style={{
                  marginTop: '20px',
                  padding: '12px 30px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Create Task
              </button>
            </form>
          </div>
        )}

        {/* Tasks List */}
        <div style={{background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}}>
          <h2 style={{marginTop: 0}}>All Tasks ({tasks.length})</h2>
          
          {tasks.length === 0 ? (
            <p style={{textAlign: 'center', color: '#666', padding: '30px'}}>No tasks created yet</p>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{background: '#f8f9fa', borderBottom: '2px solid #dee2e6'}}>
                    <th style={{padding: '12px', textAlign: 'left'}}>Task</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>Assigned To</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>Priority</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>Due Date</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>Allowances</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>Status</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>Progress</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task.id} style={{borderBottom: '1px solid #dee2e6'}}>
                      <td style={{padding: '12px'}}>
                        <div style={{fontWeight: '500', marginBottom: '5px'}}>{task.title}</div>
                        <div style={{fontSize: '12px', color: '#999'}}>{task.description}</div>
                        {task.rejection_reason && (
                          <div style={{fontSize: '12px', color: '#f44336', marginTop: '5px'}}>
                            Reason: {task.rejection_reason}
                          </div>
                        )}
                      </td>
                      <td style={{padding: '12px'}}>
                        <div>{task.employees?.users?.name || 'N/A'}</div>
                        <div style={{fontSize: '12px', color: '#999'}}>{task.employees?.position}</div>
                      </td>
                      <td style={{padding: '12px'}}>
                        <span style={{
                          padding: '4px 8px',
                          background: getPriorityColor(task.priority) + '20',
                          color: getPriorityColor(task.priority),
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {task.priority.toUpperCase()}
                        </span>
                      </td>
                      <td style={{padding: '12px', color: '#666'}}>
                        {new Date(task.due_date).toLocaleDateString('en-IN')}
                      </td>
                      <td style={{padding: '12px'}}>
                        {task.allowances && parseFloat(task.allowances) > 0 ? (
                          <span style={{color: '#4caf50', fontWeight: '500'}}>
                            ₹{parseFloat(task.allowances).toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span style={{color: '#999'}}>-</span>
                        )}
                      </td>
                      <td style={{padding: '12px'}}>
                        <span style={{
                          padding: '4px 8px',
                          background: getStatusColor(task.status) + '20',
                          color: getStatusColor(task.status),
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {getStatusText(task.status)}
                        </span>
                      </td>
                      <td style={{padding: '12px'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                          <div style={{flex: 1, height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden'}}>
                            <div style={{
                              width: `${task.progress || 0}%`,
                              height: '100%',
                              background: task.status === 'completed' ? '#4caf50' : '#2196f3',
                              transition: 'width 0.3s'
                            }}></div>
                          </div>
                          <span style={{fontSize: '12px', color: '#666', minWidth: '35px'}}>
                            {task.progress || 0}%
                          </span>
                        </div>
                      </td>
                      <td style={{padding: '12px'}}>
                        <button
                          onClick={() => handleDelete(task.id)}
                          style={{
                            padding: '6px 12px',
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Tasks;
