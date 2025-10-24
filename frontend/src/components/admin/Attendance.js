import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../Navbar';
import './Attendance.css';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayStats, setTodayStats] = useState({
    regularHours: 0,
    otHours: 0,
    totalHours: 0,
    presentCount: 0,
    totalEmployees: 0
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      // Fetch all employees
      const empResponse = await api.get('/employees');
      const allEmployees = empResponse.data.employees || [];
      setEmployees(allEmployees);

      // Fetch all attendance records
      const attResponse = await api.get('/attendance');
      const allAttendance = attResponse.data.attendance || [];
      setAttendance(allAttendance);

      // Calculate today's statistics
      const todayRecords = allAttendance.filter(
        att => att.date === selectedDate && att.status === 'present'
      );

      const regularHours = todayRecords.reduce((total, att) => {
        if (att.check_in && att.check_out) {
          const checkIn = new Date(att.check_in);
          const checkOut = new Date(att.check_out);
          const hours = (checkOut - checkIn) / (1000 * 60 * 60);
          return total + hours;
        }
        return total;
      }, 0);

      const otHours = todayRecords.reduce((total, att) => {
        if (att.ot_check_in && att.ot_check_out) {
          const otIn = new Date(att.ot_check_in);
          const otOut = new Date(att.ot_check_out);
          const hours = (otOut - otIn) / (1000 * 60 * 60);
          return total + hours;
        }
        return total;
      }, 0);

      setTodayStats({
        regularHours: regularHours.toFixed(2),
        otHours: otHours.toFixed(2),
        totalHours: (regularHours + otHours).toFixed(2),
        presentCount: todayRecords.length,
        totalEmployees: allEmployees.length
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '0.00';
    const diff = new Date(checkOut) - new Date(checkIn);
    return (diff / (1000 * 60 * 60)).toFixed(2);
  };

  const getEmployeeAttendance = (employeeId) => {
    return attendance.filter(att => att.employee_id === employeeId);
  };

  const getTodayAttendance = (employeeId) => {
    return attendance.find(
      att => att.employee_id === employeeId && att.date === selectedDate
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{padding: '50px', textAlign: 'center'}}>Loading attendance data...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{padding: '30px', background: '#f5f5f5', minHeight: 'calc(100vh - 60px)'}}>
        {/* Header */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
          <div>
            <h1 style={{margin: 0}}>Attendance Management</h1>
            <p style={{color: '#666', marginTop: '5px'}}>Monitor employee work hours and overtime</p>
          </div>
          <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
            <div>
              <label style={{marginRight: '10px', color: '#666'}}>Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '14px'
                }}
              />
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
        </div>

        {/* Today's Work Hours Summary */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '30px',
          borderRadius: '10px',
          color: 'white',
          marginBottom: '30px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{margin: '0 0 25px 0', fontSize: '24px', display: 'flex', alignItems: 'center'}}>
            <span style={{fontSize: '28px', marginRight: '10px'}}>📊</span>
            Today's Work Hours Summary
          </h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px'}}>
            <div>
              <p style={{fontSize: '15px', opacity: 0.9, margin: '0 0 8px 0'}}>Regular Hours</p>
              <p style={{fontSize: '36px', fontWeight: 'bold', margin: 0}}>
                {todayStats.regularHours} hrs
              </p>
              <p style={{fontSize: '13px', opacity: 0.8, margin: '5px 0 0 0'}}>Total regular work hours</p>
            </div>
            <div>
              <p style={{fontSize: '15px', opacity: 0.9, margin: '0 0 8px 0'}}>Overtime Hours</p>
              <p style={{fontSize: '36px', fontWeight: 'bold', margin: 0}}>
                {todayStats.otHours} hrs
              </p>
              <p style={{fontSize: '13px', opacity: 0.8, margin: '5px 0 0 0'}}>Total overtime worked</p>
            </div>
            <div>
              <p style={{fontSize: '15px', opacity: 0.9, margin: '0 0 8px 0'}}>Total Hours</p>
              <p style={{fontSize: '36px', fontWeight: 'bold', margin: 0}}>
                {todayStats.totalHours} hrs
              </p>
              <p style={{fontSize: '13px', opacity: 0.8, margin: '5px 0 0 0'}}>Combined work hours</p>
            </div>
            <div>
              <p style={{fontSize: '15px', opacity: 0.9, margin: '0 0 8px 0'}}>Present Staff</p>
              <p style={{fontSize: '36px', fontWeight: 'bold', margin: 0}}>
                {todayStats.presentCount} / {todayStats.totalEmployees}
              </p>
              <p style={{fontSize: '13px', opacity: 0.8, margin: '5px 0 0 0'}}>Employees present</p>
            </div>
          </div>
        </div>

        {/* Today's Hours Cards */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '30px'}}>
          {/* Regular Hours Card */}
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #00bcd4'
          }}>
            <h3 style={{color: '#666', fontSize: '16px', marginBottom: '10px'}}>Today's Regular Hours</h3>
            <p style={{fontSize: '48px', fontWeight: 'bold', color: '#00bcd4', margin: '10px 0'}}>
              {todayStats.regularHours} hrs
            </p>
            <p style={{color: '#999', fontSize: '14px', margin: 0}}>Total regular work hours</p>
          </div>

          {/* OT Hours Card */}
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #ff9800'
          }}>
            <h3 style={{color: '#666', fontSize: '16px', marginBottom: '10px'}}>Today's OT Hours</h3>
            <p style={{fontSize: '48px', fontWeight: 'bold', color: '#ff9800', margin: '10px 0'}}>
              {todayStats.otHours} hrs
            </p>
            <p style={{color: '#999', fontSize: '14px', margin: 0}}>Total overtime worked</p>
          </div>
        </div>

        {/* Employee Attendance Table */}
        <div style={{background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}}>
          <h2 style={{marginTop: 0, marginBottom: '20px'}}>Employee Attendance - {formatDate(selectedDate)}</h2>
          
          {employees.length === 0 ? (
            <p style={{textAlign: 'center', color: '#666', padding: '30px'}}>No employees found</p>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{background: '#f8f9fa', borderBottom: '2px solid #dee2e6'}}>
                    <th style={{padding: '12px', textAlign: 'left'}}>Employee</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>Department</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>Check In</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>Check Out</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>Regular Hrs</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>OT In</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>OT Out</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>OT Hrs</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>Total Hrs</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => {
                    const todayAtt = getTodayAttendance(emp.id);
                    const regularHrs = todayAtt ? calculateHours(todayAtt.check_in, todayAtt.check_out) : '0.00';
                    const otHrs = todayAtt ? calculateHours(todayAtt.ot_check_in, todayAtt.ot_check_out) : '0.00';
                    const totalHrs = (parseFloat(regularHrs) + parseFloat(otHrs)).toFixed(2);
                    
                    return (
                      <tr key={emp.id} style={{borderBottom: '1px solid #dee2e6'}}>
                        <td style={{padding: '12px'}}>
                          <div style={{fontWeight: '500'}}>{emp.users?.name || 'N/A'}</div>
                          <div style={{fontSize: '12px', color: '#999'}}>{emp.users?.email}</div>
                        </td>
                        <td style={{padding: '12px'}}>
                          <span style={{
                            padding: '4px 8px',
                            background: '#e3f2fd',
                            borderRadius: '4px',
                            fontSize: '12px',
                            color: '#1976d2'
                          }}>
                            {emp.department}
                          </span>
                        </td>
                        <td style={{padding: '12px', color: '#666'}}>{formatTime(todayAtt?.check_in)}</td>
                        <td style={{padding: '12px', color: '#666'}}>{formatTime(todayAtt?.check_out)}</td>
                        <td style={{padding: '12px', fontWeight: '500', color: '#00bcd4'}}>{regularHrs} hrs</td>
                        <td style={{padding: '12px', color: '#666'}}>{formatTime(todayAtt?.ot_check_in)}</td>
                        <td style={{padding: '12px', color: '#666'}}>{formatTime(todayAtt?.ot_check_out)}</td>
                        <td style={{padding: '12px', fontWeight: '500', color: '#ff9800'}}>{otHrs} hrs</td>
                        <td style={{padding: '12px', fontWeight: 'bold', color: '#7b1fa2'}}>{totalHrs} hrs</td>
                        <td style={{padding: '12px'}}>
                          {!todayAtt && (
                            <span style={{
                              padding: '4px 8px',
                              background: '#f8d7da',
                              color: '#721c24',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}>
                              Absent
                            </span>
                          )}
                          {todayAtt && todayAtt.ot_check_out && (
                            <span style={{
                              padding: '4px 8px',
                              background: '#d4edda',
                              color: '#155724',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}>
                              ✓ Complete
                            </span>
                          )}
                          {todayAtt && todayAtt.ot_check_in && !todayAtt.ot_check_out && (
                            <span style={{
                              padding: '4px 8px',
                              background: '#fff3cd',
                              color: '#856404',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}>
                              🟡 On OT
                            </span>
                          )}
                          {todayAtt && todayAtt.check_in && !todayAtt.check_out && (
                            <span style={{
                              padding: '4px 8px',
                              background: '#d1ecf1',
                              color: '#0c5460',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}>
                              🟢 Working
                            </span>
                          )}
                          {todayAtt && todayAtt.check_out && !todayAtt.ot_check_in && (
                            <span style={{
                              padding: '4px 8px',
                              background: '#d4edda',
                              color: '#155724',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}>
                              ✓ Done
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        <div style={{
          marginTop: '30px',
          background: 'white',
          padding: '25px',
          borderRadius: '10px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{marginTop: 0}}>📈 Quick Stats</h3>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px'}}>
            <div style={{padding: '15px', background: '#f8f9fa', borderRadius: '8px'}}>
              <div style={{fontSize: '12px', color: '#666', marginBottom: '5px'}}>Present Rate</div>
              <div style={{fontSize: '24px', fontWeight: 'bold', color: '#4caf50'}}>
                {todayStats.totalEmployees > 0 
                  ? ((todayStats.presentCount / todayStats.totalEmployees) * 100).toFixed(1)
                  : 0}%
              </div>
            </div>
            <div style={{padding: '15px', background: '#f8f9fa', borderRadius: '8px'}}>
              <div style={{fontSize: '12px', color: '#666', marginBottom: '5px'}}>Avg Hours/Employee</div>
              <div style={{fontSize: '24px', fontWeight: 'bold', color: '#2196f3'}}>
                {todayStats.presentCount > 0
                  ? (todayStats.totalHours / todayStats.presentCount).toFixed(2)
                  : 0} hrs
              </div>
            </div>
            <div style={{padding: '15px', background: '#f8f9fa', borderRadius: '8px'}}>
              <div style={{fontSize: '12px', color: '#666', marginBottom: '5px'}}>OT Percentage</div>
              <div style={{fontSize: '24px', fontWeight: 'bold', color: '#ff9800'}}>
                {todayStats.totalHours > 0
                  ? ((todayStats.otHours / todayStats.totalHours) * 100).toFixed(1)
                  : 0}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Attendance;
