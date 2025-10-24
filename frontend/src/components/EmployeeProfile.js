import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from './Navbar';
import './EmployeeProfile.css';

const EmployeeProfile = () => {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [stats, setStats] = useState({
    totalDays: 0,
    totalRegularHours: 0,
    totalOTHours: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalAllowances: 0,
    totalSalaryEarned: 0,
    avgAttendanceRate: 0
  });
  const [recentActivity, setRecentActivity] = useState({
    attendance: [],
    tasks: [],
    payslips: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeProfile();
    }
  }, [employeeId]);

  const fetchEmployeeProfile = async () => {
    try {
      // Fetch employee details
      const empResponse = await api.get('/employees');
      const empData = empResponse.data.employees?.find(e => e.id === employeeId);
      
      if (!empData) {
        alert('Employee not found');
        navigate('/employees');
        return;
      }
      
      setEmployee(empData);

      // Fetch attendance history
      const attResponse = await api.get(`/attendance/employee/${employeeId}`);
      const attendanceData = attResponse.data.attendance || [];

      // Fetch tasks
      const tasksResponse = await api.get(`/tasks/employee/${employeeId}`);
      const tasksData = tasksResponse.data.tasks || [];

      // Fetch payslips
      const payslipsResponse = await api.get(`/payroll/employee/${employeeId}`);
      const payslipsData = payslipsResponse.data.payslips || [];

      // Calculate statistics
      const totalRegularHours = attendanceData.reduce((sum, att) => {
        if (att.check_in && att.check_out) {
          const hours = (new Date(att.check_out) - new Date(att.check_in)) / (1000 * 60 * 60);
          return sum + hours;
        }
        return sum;
      }, 0);

      const totalOTHours = attendanceData.reduce((sum, att) => {
        if (att.ot_check_in && att.ot_check_out) {
          const hours = (new Date(att.ot_check_out) - new Date(att.ot_check_in)) / (1000 * 60 * 60);
          return sum + hours;
        }
        return sum;
      }, 0);

      const completedTasks = tasksData.filter(t => t.status === 'completed');
      const totalAllowances = completedTasks.reduce((sum, t) => sum + parseFloat(t.allowances || 0), 0);
      
      const totalSalaryEarned = payslipsData.reduce((sum, p) => sum + parseFloat(p.net_salary || 0), 0);

      // Calculate days since joining
      const joinDate = new Date(empData.join_date);
      const today = new Date();
      const totalDays = Math.floor((today - joinDate) / (1000 * 60 * 60 * 24));
      
      // Calculate attendance rate
      const workingDays = totalDays; // Simplified
      const presentDays = attendanceData.length;
      const avgAttendanceRate = workingDays > 0 ? (presentDays / workingDays * 100) : 0;

      setStats({
        totalDays,
        totalRegularHours: totalRegularHours.toFixed(2),
        totalOTHours: totalOTHours.toFixed(2),
        totalTasks: tasksData.length,
        completedTasks: completedTasks.length,
        totalAllowances: totalAllowances.toFixed(2),
        totalSalaryEarned: totalSalaryEarned.toFixed(2),
        avgAttendanceRate: avgAttendanceRate.toFixed(1)
      });

      setRecentActivity({
        attendance: attendanceData.slice(0, 10),
        tasks: tasksData.slice(0, 10),
        payslips: payslipsData.slice(0, 5)
      });

    } catch (error) {
      console.error('Error fetching profile:', error);
      alert('Error loading employee profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDaysWorked = () => {
    const joinDate = new Date(employee.join_date);
    const today = new Date();
    const diffTime = Math.abs(today - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{padding: '50px', textAlign: 'center'}}>Loading employee profile...</div>
      </>
    );
  }

  if (!employee) {
    return (
      <>
        <Navbar />
        <div style={{padding: '50px', textAlign: 'center'}}>Employee not found</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{padding: '30px', background: '#f5f5f5', minHeight: 'calc(100vh - 60px)'}}>
        {/* Header with Back Button */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
          <h1 style={{margin: 0}}>Employee Profile</h1>
          <button 
            onClick={() => navigate(-1)}
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

        {/* Employee Header Card */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px',
          borderRadius: '10px',
          color: 'white',
          marginBottom: '30px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '30px'}}>
            <div style={{
              width: '120px',
              height: '120px',
              background: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#667eea'
            }}>
              {employee.users?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{flex: 1}}>
              <h2 style={{margin: '0 0 10px 0', fontSize: '32px'}}>{employee.users?.name}</h2>
              <p style={{fontSize: '18px', opacity: 0.9, margin: '0 0 5px 0'}}>{employee.position}</p>
              <p style={{fontSize: '16px', opacity: 0.8, margin: 0}}>{employee.department}</p>
            </div>
            <div style={{textAlign: 'right'}}>
              <div style={{fontSize: '14px', opacity: 0.9, marginBottom: '5px'}}>Employee Since</div>
              <div style={{fontSize: '24px', fontWeight: 'bold'}}>{formatDate(employee.join_date)}</div>
              <div style={{fontSize: '14px', opacity: 0.9, marginTop: '5px'}}>
                {calculateDaysWorked()} days
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px'}}>
          <div style={{background: 'white', padding: '25px', borderRadius: '10px', borderLeft: '4px solid #2196f3'}}>
            <div style={{fontSize: '14px', color: '#666', marginBottom: '8px'}}>Total Work Hours</div>
            <div style={{fontSize: '32px', fontWeight: 'bold', color: '#2196f3'}}>{stats.totalRegularHours}</div>
            <div style={{fontSize: '12px', color: '#999', marginTop: '5px'}}>Regular Hours</div>
          </div>

          <div style={{background: 'white', padding: '25px', borderRadius: '10px', borderLeft: '4px solid #ff9800'}}>
            <div style={{fontSize: '14px', color: '#666', marginBottom: '8px'}}>Overtime Hours</div>
            <div style={{fontSize: '32px', fontWeight: 'bold', color: '#ff9800'}}>{stats.totalOTHours}</div>
            <div style={{fontSize: '12px', color: '#999', marginTop: '5px'}}>Extra Hours Worked</div>
          </div>

          <div style={{background: 'white', padding: '25px', borderRadius: '10px', borderLeft: '4px solid #4caf50'}}>
            <div style={{fontSize: '14px', color: '#666', marginBottom: '8px'}}>Tasks Completed</div>
            <div style={{fontSize: '32px', fontWeight: 'bold', color: '#4caf50'}}>
              {stats.completedTasks} / {stats.totalTasks}
            </div>
            <div style={{fontSize: '12px', color: '#999', marginTop: '5px'}}>
              {stats.totalTasks > 0 ? ((stats.completedTasks / stats.totalTasks) * 100).toFixed(0) : 0}% Success Rate
            </div>
          </div>

          <div style={{background: 'white', padding: '25px', borderRadius: '10px', borderLeft: '4px solid #9c27b0'}}>
            <div style={{fontSize: '14px', color: '#666', marginBottom: '8px'}}>Total Earnings</div>
            <div style={{fontSize: '32px', fontWeight: 'bold', color: '#9c27b0'}}>
              ₹{parseFloat(stats.totalSalaryEarned).toLocaleString('en-IN')}
            </div>
            <div style={{fontSize: '12px', color: '#999', marginTop: '5px'}}>Net Salary Received</div>
          </div>

          <div style={{background: 'white', padding: '25px', borderRadius: '10px', borderLeft: '4px solid #00bcd4'}}>
            <div style={{fontSize: '14px', color: '#666', marginBottom: '8px'}}>Attendance Rate</div>
            <div style={{fontSize: '32px', fontWeight: 'bold', color: '#00bcd4'}}>{stats.avgAttendanceRate}%</div>
            <div style={{fontSize: '12px', color: '#999', marginTop: '5px'}}>Present Days</div>
          </div>

          <div style={{background: 'white', padding: '25px', borderRadius: '10px', borderLeft: '4px solid #f44336'}}>
            <div style={{fontSize: '14px', color: '#666', marginBottom: '8px'}}>Task Allowances</div>
            <div style={{fontSize: '32px', fontWeight: 'bold', color: '#f44336'}}>
              ₹{parseFloat(stats.totalAllowances).toLocaleString('en-IN')}
            </div>
            <div style={{fontSize: '12px', color: '#999', marginTop: '5px'}}>Bonus Earned</div>
          </div>
        </div>

        {/* Employee Details */}
        <div style={{background: 'white', padding: '30px', borderRadius: '10px', marginBottom: '30px'}}>
          <h3 style={{marginTop: 0}}>Employment Details</h3>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px'}}>
            <div>
              <div style={{fontSize: '12px', color: '#999', marginBottom: '5px'}}>Email</div>
              <div style={{fontWeight: '500'}}>{employee.users?.email}</div>
            </div>
            <div>
              <div style={{fontSize: '12px', color: '#999', marginBottom: '5px'}}>Monthly Salary</div>
              <div style={{fontWeight: '500'}}>₹{employee.salary?.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <div style={{fontSize: '12px', color: '#999', marginBottom: '5px'}}>Join Date</div>
              <div style={{fontWeight: '500'}}>{formatDate(employee.join_date)}</div>
            </div>
          </div>
        </div>

        {/* Recent Activity Tabs */}
        <div style={{background: 'white', padding: '30px', borderRadius: '10px'}}>
          <h3 style={{marginTop: 0}}>Work History</h3>

          {/* Attendance History */}
          <div style={{marginBottom: '40px'}}>
            <h4 style={{color: '#667eea', marginBottom: '15px'}}>📅 Recent Attendance ({recentActivity.attendance.length})</h4>
            {recentActivity.attendance.length === 0 ? (
              <p style={{color: '#999'}}>No attendance records found</p>
            ) : (
              <div style={{overflowX: 'auto'}}>
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                  <thead>
                    <tr style={{background: '#f8f9fa', borderBottom: '2px solid #dee2e6'}}>
                      <th style={{padding: '10px', textAlign: 'left'}}>Date</th>
                      <th style={{padding: '10px', textAlign: 'left'}}>Check In</th>
                      <th style={{padding: '10px', textAlign: 'left'}}>Check Out</th>
                      <th style={{padding: '10px', textAlign: 'left'}}>Reg Hours</th>
                      <th style={{padding: '10px', textAlign: 'left'}}>OT Hours</th>
                      <th style={{padding: '10px', textAlign: 'left'}}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.attendance.map((att) => {
                      const regHours = att.check_in && att.check_out
                        ? ((new Date(att.check_out) - new Date(att.check_in)) / (1000 * 60 * 60)).toFixed(2)
                        : 0;
                      const otHours = att.ot_check_in && att.ot_check_out
                        ? ((new Date(att.ot_check_out) - new Date(att.ot_check_in)) / (1000 * 60 * 60)).toFixed(2)
                        : 0;
                      
                      return (
                        <tr key={att.id} style={{borderBottom: '1px solid #eee'}}>
                          <td style={{padding: '10px'}}>{formatDate(att.date)}</td>
                          <td style={{padding: '10px'}}>{formatTime(att.check_in)}</td>
                          <td style={{padding: '10px'}}>{formatTime(att.check_out)}</td>
                          <td style={{padding: '10px', color: '#2196f3', fontWeight: '500'}}>{regHours} hrs</td>
                          <td style={{padding: '10px', color: '#ff9800', fontWeight: '500'}}>{otHours} hrs</td>
                          <td style={{padding: '10px'}}>
                            <span style={{
                              padding: '3px 8px',
                              background: '#d4edda',
                              color: '#155724',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}>
                              {att.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Tasks History */}
          <div style={{marginBottom: '40px'}}>
            <h4 style={{color: '#667eea', marginBottom: '15px'}}>📋 Tasks ({recentActivity.tasks.length})</h4>
            {recentActivity.tasks.length === 0 ? (
              <p style={{color: '#999'}}>No tasks assigned yet</p>
            ) : (
              <div style={{display: 'grid', gap: '15px'}}>
                {recentActivity.tasks.map((task) => (
                  <div key={task.id} style={{
                    padding: '15px',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${
                      task.status === 'completed' ? '#4caf50' :
                      task.status === 'in_progress' ? '#2196f3' :
                      task.status === 'rejected' ? '#f44336' : '#ffc107'
                    }`
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                      <div style={{fontWeight: '500'}}>{task.title}</div>
                      <span style={{
                        padding: '3px 8px',
                        background: task.status === 'completed' ? '#d4edda' : '#fff3cd',
                        color: task.status === 'completed' ? '#155724' : '#856404',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {task.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div style={{fontSize: '13px', color: '#666', marginBottom: '5px'}}>{task.description}</div>
                    <div style={{display: 'flex', gap: '15px', fontSize: '12px', color: '#999'}}>
                      <span>Due: {formatDate(task.due_date)}</span>
                      {task.allowances > 0 && (
                        <span style={{color: '#4caf50'}}>💰 ₹{parseFloat(task.allowances).toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payslips History */}
          <div>
            <h4 style={{color: '#667eea', marginBottom: '15px'}}>💰 Salary History ({recentActivity.payslips.length})</h4>
            {recentActivity.payslips.length === 0 ? (
              <p style={{color: '#999'}}>No payslips generated yet</p>
            ) : (
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px'}}>
                {recentActivity.payslips.map((payslip) => {
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  return (
                    <div key={payslip.id} style={{
                      padding: '20px',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #dee2e6'
                    }}>
                      <div style={{fontSize: '14px', fontWeight: '500', marginBottom: '10px'}}>
                        {months[payslip.month - 1]} {payslip.year}
                      </div>
                      <div style={{fontSize: '24px', fontWeight: 'bold', color: '#667eea', marginBottom: '10px'}}>
                        ₹{parseFloat(payslip.net_salary).toLocaleString('en-IN')}
                      </div>
                      <div style={{fontSize: '12px', color: '#666'}}>
                        <div>Reg: {payslip.regular_hours || 0} hrs | OT: {payslip.ot_hours || 0} hrs</div>
                        <div style={{marginTop: '5px'}}>Allowances: ₹{parseFloat(payslip.total_allowances || 0).toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeProfile;
