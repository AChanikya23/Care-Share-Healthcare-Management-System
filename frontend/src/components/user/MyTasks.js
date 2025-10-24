import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import Navbar from '../Navbar';
import './MyTasks.css';

const MyTasks = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const navigate = useNavigate();

  const fetchEmployeeTasks = useCallback(async (empId) => {
    try {
      const response = await api.get(`/tasks/employee/${empId}`);
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }, []);

  const fetchEmployeeData = useCallback(async () => {
    try {
      const empResponse = await api.get('/employees');
      const myEmployee = empResponse.data.employees?.find(
        emp => emp.users?.email === user?.email
      );
      
      if (myEmployee) {
        setEmployeeId(myEmployee.id);
        await fetchEmployeeTasks(myEmployee.id);
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, fetchEmployeeTasks]);

  useEffect(() => {
    if (user) {
      fetchEmployeeData();
    }
  }, [user, fetchEmployeeData]);

  const handleAccept = async (taskId) => {
    try {
      await api.post(`/tasks/${taskId}/accept`);
      alert('✅ Task accepted! You can now start working on it.');
      fetchEmployeeTasks(employeeId);
    } catch (error) {
      alert('Error: ' + error.response?.data?.error);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      await api.post(`/tasks/${selectedTask.id}/reject`, { reason: rejectReason });
      alert('Task rejected');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedTask(null);
      fetchEmployeeTasks(employeeId);
    } catch (error) {
      alert('Error: ' + error.response?.data?.error);
    }
  };

  const handleProgressUpdate = async (taskId, progress) => {
    try {
      await api.put(`/tasks/${taskId}`, { progress: parseInt(progress) });
      fetchEmployeeTasks(employeeId);
    } catch (error) {
      alert('Error updating progress: ' + error.response?.data?.error);
    }
  };

  const handleComplete = async (taskId) => {
    if (window.confirm('Mark this task as completed?')) {
      try {
        await api.put(`/tasks/${taskId}`, { status: 'completed', progress: 100 });
        alert('✅ Task marked as completed!');
        fetchEmployeeTasks(employeeId);
      } catch (error) {
        alert('Error: ' + error.response?.data?.error);
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

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <>
      <Navbar />
      <div style={{padding: '30px', background: '#f5f5f5', minHeight: 'calc(100vh - 60px)'}}>
        {/* Header */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
          <div>
            <h1 style={{margin: 0}}>My Tasks</h1>
            <p style={{color: '#666', marginTop: '5px'}}>View and manage your assigned tasks</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '10px 20px',
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

        {/* Stats */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px'}}>
          <div style={{background: 'white', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #ffc107'}}>
            <h3 style={{margin: '0 0 10px 0', color: '#666', fontSize: '14px'}}>Pending</h3>
            <p style={{fontSize: '32px', fontWeight: 'bold', color: '#ffc107', margin: 0}}>{pendingTasks.length}</p>
          </div>
          <div style={{background: 'white', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #2196f3'}}>
            <h3 style={{margin: '0 0 10px 0', color: '#666', fontSize: '14px'}}>In Progress</h3>
            <p style={{fontSize: '32px', fontWeight: 'bold', color: '#2196f3', margin: 0}}>{inProgressTasks.length}</p>
          </div>
          <div style={{background: 'white', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #4caf50'}}>
            <h3 style={{margin: '0 0 10px 0', color: '#666', fontSize: '14px'}}>Completed</h3>
            <p style={{fontSize: '32px', fontWeight: 'bold', color: '#4caf50', margin: 0}}>{completedTasks.length}</p>
          </div>
        </div>

        {/* Tasks */}
        {tasks.length === 0 ? (
          <div style={{background: 'white', padding: '50px', borderRadius: '10px', textAlign: 'center'}}>
            <div style={{fontSize: '64px', marginBottom: '20px'}}>📋</div>
            <h2>No Tasks Assigned</h2>
            <p style={{color: '#666'}}>You don't have any tasks assigned yet</p>
          </div>
        ) : (
          <div style={{display: 'grid', gap: '20px'}}>
            {tasks.map(task => (
              <div key={task.id} style={{
                background: 'white',
                padding: '25px',
                borderRadius: '10px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${getStatusColor(task.status)}`
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px'}}>
                  <div style={{flex: 1}}>
                    <h3 style={{margin: '0 0 10px 0'}}>{task.title}</h3>
                    <p style={{color: '#666', margin: '0 0 15px 0'}}>{task.description}</p>
                    
                    <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center'}}>
                      <span style={{
                        padding: '4px 8px',
                        background: getPriorityColor(task.priority) + '20',
                        color: getPriorityColor(task.priority),
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {task.priority.toUpperCase()} PRIORITY
                      </span>
                      
                      <span style={{fontSize: '14px', color: '#666'}}>
                        📅 Due: {new Date(task.due_date).toLocaleDateString('en-IN')}
                      </span>

                      {task.allowances && parseFloat(task.allowances) > 0 && (
                        <span style={{
                          padding: '4px 8px',
                          background: '#e8f5e9',
                          color: '#4caf50',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          💰 Allowance: ₹{parseFloat(task.allowances).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  <span style={{
                    padding: '6px 12px',
                    background: getStatusColor(task.status) + '20',
                    color: getStatusColor(task.status),
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
                  }}>
                    {task.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Progress Bar (for in-progress tasks) */}
                {task.status === 'in_progress' && (
                  <div style={{marginBottom: '15px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                      <span style={{fontSize: '14px', color: '#666'}}>Progress</span>
                      <span style={{fontSize: '14px', fontWeight: '500'}}>{task.progress || 0}%</span>
                    </div>
                    <div style={{height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden'}}>
                      <div style={{
                        width: `${task.progress || 0}%`,
                        height: '100%',
                        background: '#2196f3',
                        transition: 'width 0.3s'
                      }}></div>
                    </div>
                    
                    <div style={{marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center'}}>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={task.progress || 0}
                        onChange={(e) => handleProgressUpdate(task.id, e.target.value)}
                        style={{flex: 1}}
                      />
                      <span style={{fontSize: '14px', minWidth: '40px'}}>{task.progress || 0}%</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                  {task.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAccept(task.id)}
                        style={{
                          padding: '8px 16px',
                          background: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        ✓ Accept Task
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setShowRejectModal(true);
                        }}
                        style={{
                          padding: '8px 16px',
                          background: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        ✕ Reject Task
                      </button>
                    </>
                  )}

                  {task.status === 'in_progress' && (
                    <button
                      onClick={() => handleComplete(task.id)}
                      style={{
                        padding: '8px 16px',
                        background: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      ✓ Mark as Completed
                    </button>
                  )}

                  {task.status === 'completed' && (
                    <span style={{
                      padding: '8px 16px',
                      background: '#d4edda',
                      color: '#155724',
                      borderRadius: '5px',
                      fontSize: '14px'
                    }}>
                      ✓ Task Completed
                      {task.allowances && parseFloat(task.allowances) > 0 && (
                        <span style={{marginLeft: '10px'}}>
                          • Earned: ₹{parseFloat(task.allowances).toLocaleString('en-IN')}
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '10px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{marginTop: 0}}>Reject Task</h2>
            <p style={{color: '#666'}}>Please provide a reason for rejecting this task:</p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason..."
              rows="4"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                marginBottom: '20px'
              }}
            />

            <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedTask(null);
                }}
                style={{
                  padding: '10px 20px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                style={{
                  padding: '10px 20px',
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Reject Task
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyTasks;
