import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import './UserDashboard.css';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [employeeData, setEmployeeData] = useState(null);
  const [stats, setStats] = useState({
    todayAttendance: null,
    pendingTasks: 0,
    completedTasks: 0,
    thisMonthHours: 0,
    thisMonthOT: 0,
    lastPayslip: null,
    upcomingTasks: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch employee data
      const empResponse = await api.get('/employees');
      const myEmployee = empResponse.data.employees?.find(
        emp => emp.users?.email === user?.email
      );
      
      if (!myEmployee) {
        setLoading(false);
        return;
      }
      
      setEmployeeData(myEmployee);

      // Fetch today's attendance
      const today = new Date().toISOString().split('T')[0];
      const attResponse = await api.get(`/attendance/employee/${myEmployee.id}`);
      const todayAtt = attResponse.data.attendance?.find(att => att.date === today);

      // Fetch tasks
      const tasksResponse = await api.get(`/tasks/employee/${myEmployee.id}`);
      const tasks = tasksResponse.data.tasks || [];
      const pending = tasks.filter(t => t.status === 'pending').length;
      const completed = tasks.filter(t => t.status === 'completed').length;
      const upcoming = tasks.filter(t => t.status === 'pending').slice(0, 3);

      // Calculate this month's hours
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const monthlyAtt = attResponse.data.attendance?.filter(att => {
        const attDate = new Date(att.date);
        return attDate.getMonth() + 1 === currentMonth && attDate.getFullYear() === currentYear;
      }) || [];

      let totalHours = 0;
      let totalOT = 0;
      monthlyAtt.forEach(att => {
        if (att.check_in && att.check_out) {
          totalHours += (new Date(att.check_out) - new Date(att.check_in)) / (1000 * 60 * 60);
        }
        if (att.ot_check_in && att.ot_check_out) {
          totalOT += (new Date(att.ot_check_out) - new Date(att.ot_check_in)) / (1000 * 60 * 60);
        }
      });

      // Fetch latest payslip
      const payslipResponse = await api.get(`/payroll/employee/${myEmployee.id}`);
      const payslips = payslipResponse.data.payslips || [];
      const latestPayslip = payslips[0];

      setStats({
        todayAttendance: todayAtt,
        pendingTasks: pending,
        completedTasks: completed,
        thisMonthHours: totalHours.toFixed(1),
        thisMonthOT: totalOT.toFixed(1),
        lastPayslip: latestPayslip,
        upcomingTasks: upcoming
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);



  if (loading) {
    return <div style={{padding: '50px', textAlign: 'center'}}>Loading dashboard...</div>;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div style={{padding: '30px', background: '#f5f5f5', minHeight: '100vh'}}>
      {/* Welcome Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px',
        borderRadius: '15px',
        color: 'white',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '25px'}}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            fontWeight: 'bold',
            color: '#667eea',
            boxShadow: '0 5px 20px rgba(0,0,0,0.2)'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{flex: 1}}>
            <h1 style={{margin: '0 0 5px 0', fontSize: '36px'}}>{getGreeting()}, {user?.name}!</h1>
            {employeeData ? (
              <>
                <p style={{fontSize: '18px', opacity: 0.9, margin: '5px 0'}}>{employeeData.position}</p>
                <p style={{fontSize: '16px', opacity: 0.8, margin: '5px 0'}}>{employeeData.department}</p>
              </>
            ) : (
              <p style={{fontSize: '16px', opacity: 0.9, margin: '5px 0'}}>Welcome back!</p>
            )}
          </div>
          <div style={{textAlign: 'right'}}>
            <div style={{fontSize: '14px', opacity: 0.9, marginBottom: '5px'}}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long' })}
            </div>
            <div style={{fontSize: '24px', fontWeight: 'bold'}}>
              {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px'}}>
        <div style={{background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', borderLeft: '5px solid #4caf50'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
            <div>
              <div style={{fontSize: '14px', color: '#666', marginBottom: '10px'}}>Today's Status</div>
              <div style={{fontSize: '28px', fontWeight: 'bold', color: '#4caf50', marginBottom: '10px'}}>
                {stats.todayAttendance ? 'Present' : 'Not Checked In'}
              </div>
              {stats.todayAttendance && (
                <div style={{fontSize: '13px', color: '#999'}}>
                  Checked in at {new Date(stats.todayAttendance.check_in).toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})}
                </div>
              )}
            </div>
            <div style={{fontSize: '40px'}}>✅</div>
          </div>
        </div>

        <div style={{background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', borderLeft: '5px solid #2196f3'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
            <div>
              <div style={{fontSize: '14px', color: '#666', marginBottom: '10px'}}>Pending Tasks</div>
              <div style={{fontSize: '28px', fontWeight: 'bold', color: '#2196f3'}}>{stats.pendingTasks}</div>
              <div style={{fontSize: '13px', color: '#999'}}>{stats.completedTasks} completed</div>
            </div>
            <div style={{fontSize: '40px'}}>📋</div>
          </div>
        </div>

        <div style={{background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', borderLeft: '5px solid #ff9800'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
            <div>
              <div style={{fontSize: '14px', color: '#666', marginBottom: '10px'}}>This Month Hours</div>
              <div style={{fontSize: '28px', fontWeight: 'bold', color: '#ff9800'}}>{stats.thisMonthHours}</div>
              <div style={{fontSize: '13px', color: '#999'}}>+{stats.thisMonthOT} OT hours</div>
            </div>
            <div style={{fontSize: '40px'}}>⏱️</div>
          </div>
        </div>

        <div style={{background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', borderLeft: '5px solid #9c27b0'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
            <div>
              <div style={{fontSize: '14px', color: '#666', marginBottom: '10px'}}>Last Salary</div>
              <div style={{fontSize: '28px', fontWeight: 'bold', color: '#9c27b0'}}>
                {stats.lastPayslip ? `₹${parseFloat(stats.lastPayslip.net_salary).toLocaleString('en-IN')}` : 'N/A'}
              </div>
              {stats.lastPayslip && (
                <div style={{fontSize: '13px', color: '#999'}}>
                  {new Date().toLocaleString('default', { month: 'short' })} {new Date().getFullYear()}
                </div>
              )}
            </div>
            <div style={{fontSize: '40px'}}>💰</div>
          </div>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px'}}>
        {/* Main Content */}
        <div>
          {/* Quick Actions */}
          <div style={{background: 'white', padding: '30px', borderRadius: '15px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)'}}>
            <h3 style={{margin: '0 0 20px 0', fontSize: '20px'}}>⚡ Quick Actions</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px'}}>
              <button
                onClick={() => navigate('/my-attendance')}
                style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <span style={{fontSize: '24px'}}>📅</span>
                <span>Mark Attendance</span>
              </button>

              <button
                onClick={() => navigate('/my-tasks')}
                style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <span style={{fontSize: '24px'}}>✓</span>
                <span>View Tasks</span>
              </button>

              <button
                onClick={() => navigate('/my-payslips')}
                style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <span style={{fontSize: '24px'}}>💳</span>
                <span>Pay Slips</span>
              </button>

              <button
                onClick={() => navigate('/profile')}
                style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <span style={{fontSize: '24px'}}>👤</span>
                <span>My Profile</span>
              </button>
            </div>
          </div>

          {/* Upcoming Tasks */}
          {stats.upcomingTasks.length > 0 && (
            <div style={{background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)'}}>
              <h3 style={{margin: '0 0 20px 0', fontSize: '20px'}}>📌 Upcoming Tasks</h3>
              <div style={{display: 'grid', gap: '15px'}}>
                {stats.upcomingTasks.map(task => (
                  <div key={task.id} style={{
                    padding: '20px',
                    background: '#f8f9fa',
                    borderRadius: '10px',
                    borderLeft: '4px solid #2196f3'
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                      <h4 style={{margin: 0, fontSize: '16px'}}>{task.title}</h4>
                      <span style={{
                        padding: '4px 12px',
                        background: task.priority === 'high' ? '#fee' : task.priority === 'medium' ? '#ffc' : '#efe',
                        color: task.priority === 'high' ? '#c33' : task.priority === 'medium' ? '#860' : '#363',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {task.priority} priority
                      </span>
                    </div>
                    <p style={{color: '#666', fontSize: '14px', margin: '0 0 10px 0'}}>{task.description}</p>
                    <div style={{fontSize: '13px', color: '#999'}}>
                      Due: {new Date(task.due_date).toLocaleDateString('en-IN')}
                      {task.allowances > 0 && (
                        <span style={{marginLeft: '15px', color: '#4caf50', fontWeight: '500'}}>
                          💰 ₹{parseFloat(task.allowances).toLocaleString('en-IN')} bonus
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Profile Summary */}
          {employeeData && (
            <div style={{background: 'white', padding: '25px', borderRadius: '15px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)'}}>
              <h3 style={{margin: '0 0 20px 0', fontSize: '18px'}}>📊 My Profile</h3>
              <div style={{marginBottom: '15px'}}>
                <div style={{fontSize: '12px', color: '#999', marginBottom: '5px'}}>Employee ID</div>
                <div style={{fontSize: '14px', fontWeight: '500'}}>{employeeData.id.slice(0, 8)}</div>
              </div>
              <div style={{marginBottom: '15px'}}>
                <div style={{fontSize: '12px', color: '#999', marginBottom: '5px'}}>Department</div>
                <div style={{fontSize: '14px', fontWeight: '500'}}>{employeeData.department}</div>
              </div>
              <div style={{marginBottom: '15px'}}>
                <div style={{fontSize: '12px', color: '#999', marginBottom: '5px'}}>Position</div>
                <div style={{fontSize: '14px', fontWeight: '500'}}>{employeeData.position}</div>
              </div>
              <div style={{marginBottom: '15px'}}>
                <div style={{fontSize: '12px', color: '#999', marginBottom: '5px'}}>Joined</div>
                <div style={{fontSize: '14px', fontWeight: '500'}}>
                  {new Date(employeeData.join_date).toLocaleDateString('en-IN')}
                </div>
              </div>
              <button
                onClick={() => navigate('/profile')}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginTop: '10px'
                }}
              >
                View Full Profile
              </button>
            </div>
          )}

          {/* Quick Tip */}
          <div style={{background: '#fff9e6', padding: '20px', borderRadius: '15px', border: '2px dashed #ffc107'}}>
            <h4 style={{margin: '0 0 10px 0', fontSize: '16px', color: '#f57c00'}}>💡 Quick Tip</h4>
            <p style={{fontSize: '14px', color: '#666', margin: 0, lineHeight: '1.6'}}>
              Remember to check in daily and complete your tasks on time to earn performance bonuses!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
