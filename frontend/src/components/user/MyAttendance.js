import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import Navbar from '../Navbar';
import './MyAttendance.css';

const MyAttendance = () => {
  const { user } = useContext(AuthContext);
  const [attendance, setAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState(null);
  const [regularHours, setRegularHours] = useState(0);
  const [otHours, setOtHours] = useState(0);
  const navigate = useNavigate();

  const fetchTodayAttendance = useCallback(async (empId) => {
    try {
      const response = await api.get(`/attendance/today/${empId}`);
      setAttendance(response.data.attendance);
      setRegularHours(response.data.regularHours || 0);
      setOtHours(response.data.otHours || 0);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  }, []);

  const fetchAttendanceHistory = useCallback(async (empId) => {
    try {
      const response = await api.get(`/attendance/employee/${empId}`);
      setAttendanceHistory(response.data.attendance || []);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
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
        await fetchTodayAttendance(myEmployee.id);
        await fetchAttendanceHistory(myEmployee.id);
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, fetchTodayAttendance, fetchAttendanceHistory]);

  useEffect(() => {
    if (user) {
      fetchEmployeeData();
    }
  }, [user, fetchEmployeeData]);

  const handleCheckIn = async () => {
    if (!employeeId) {
      alert('Employee record not found!');
      return;
    }

    try {
      await api.post('/attendance/checkin', { employee_id: employeeId });
      alert('✅ Checked in successfully!');
      fetchTodayAttendance(employeeId);
      fetchAttendanceHistory(employeeId);
    } catch (error) {
      alert('❌ ' + (error.response?.data?.error || 'Check-in failed'));
    }
  };

  const handleCheckOut = async () => {
    if (!employeeId) {
      alert('Employee record not found!');
      return;
    }

    try {
      const response = await api.post('/attendance/checkout', { employee_id: employeeId });
      alert(`✅ Checked out successfully!\nRegular Hours: ${response.data.regularHours} hrs`);
      fetchTodayAttendance(employeeId);
      fetchAttendanceHistory(employeeId);
    } catch (error) {
      alert('❌ ' + (error.response?.data?.error || 'Check-out failed'));
    }
  };

  const handleOTCheckIn = async () => {
    if (!employeeId) {
      alert('Employee record not found!');
      return;
    }

    try {
      await api.post('/attendance/ot-checkin', { employee_id: employeeId });
      alert('✅ OT Check-in successful!');
      fetchTodayAttendance(employeeId);
      fetchAttendanceHistory(employeeId);
    } catch (error) {
      alert('❌ ' + (error.response?.data?.error || 'OT check-in failed'));
    }
  };

  const handleOTCheckOut = async () => {
    if (!employeeId) {
      alert('Employee record not found!');
      return;
    }

    try {
      const response = await api.post('/attendance/ot-checkout', { employee_id: employeeId });
      alert(`✅ OT Check-out successful!\nOT Hours: ${response.data.otHours} hrs`);
      fetchTodayAttendance(employeeId);
      fetchAttendanceHistory(employeeId);
    } catch (error) {
      alert('❌ ' + (error.response?.data?.error || 'OT check-out failed'));
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
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut) - new Date(checkIn);
    return (diff / (1000 * 60 * 60)).toFixed(2);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{padding: '50px', textAlign: 'center'}}>Loading...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{padding: '30px', background: '#f5f5f5', minHeight: 'calc(100vh - 60px)'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
          <div>
            <h1 style={{margin: 0}}>My Attendance</h1>
            <p style={{color: '#666', marginTop: '5px'}}>Track your work hours and overtime</p>
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
            ← Back to Dashboard
          </button>
        </div>

        {/* Today's Attendance Card */}
        <div style={{background: 'white', padding: '30px', borderRadius: '10px', marginBottom: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}}>
          <h2 style={{marginTop: 0}}>Today's Attendance - {formatDate(new Date())}</h2>
          
          {/* Regular Shift */}
          <div style={{marginBottom: '30px'}}>
            <h3 style={{marginBottom: '15px'}}>Regular Shift</h3>
            <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap'}}>
              <button 
                onClick={handleCheckIn}
                disabled={attendance?.check_in}
                style={{
                  padding: '15px 40px',
                  background: attendance?.check_in ? '#95a5a6' : '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: attendance?.check_in ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                {attendance?.check_in ? '✓ Checked In' : 'Check In'}
              </button>
              <button 
                onClick={handleCheckOut}
                disabled={!attendance?.check_in || attendance?.check_out}
                style={{
                  padding: '15px 40px',
                  background: attendance?.check_out ? '#95a5a6' : '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: (!attendance?.check_in || attendance?.check_out) ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                {attendance?.check_out ? '✓ Checked Out' : 'Check Out'}
              </button>
            </div>
          </div>

          {/* Overtime */}
          <div style={{marginBottom: '30px'}}>
            <h3 style={{marginBottom: '15px'}}>Overtime (OT)</h3>
            <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap'}}>
              <button 
                onClick={handleOTCheckIn}
                disabled={!attendance?.check_out || attendance?.ot_check_in}
                style={{
                  padding: '15px 40px',
                  background: attendance?.ot_check_in ? '#95a5a6' : '#f39c12',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: (!attendance?.check_out || attendance?.ot_check_in) ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                {attendance?.ot_check_in ? '✓ OT Checked In' : 'OT Check In'}
              </button>
              <button 
                onClick={handleOTCheckOut}
                disabled={!attendance?.ot_check_in || attendance?.ot_check_out}
                style={{
                  padding: '15px 40px',
                  background: attendance?.ot_check_out ? '#95a5a6' : '#e67e22',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: (!attendance?.ot_check_in || attendance?.ot_check_out) ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                {attendance?.ot_check_out ? '✓ OT Checked Out' : 'OT Check Out'}
              </button>
            </div>
          </div>

          {/* Status and Hours */}
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px'}}>
            {/* Today's Status */}
            <div style={{padding: '20px', background: '#f8f9fa', borderRadius: '8px'}}>
              <h3 style={{marginTop: 0}}>Today's Status</h3>
              <p style={{fontSize: '18px', fontWeight: '500', marginBottom: '15px'}}>
                {!attendance?.check_in && '❌ Not Checked In'}
                {attendance?.check_in && !attendance?.check_out && '🟢 Currently Working'}
                {attendance?.check_out && !attendance?.ot_check_in && '✓ Regular Shift Complete'}
                {attendance?.ot_check_in && !attendance?.ot_check_out && '🟡 On Overtime'}
                {attendance?.ot_check_out && '✓ All Done for Today'}
              </p>
              <div style={{fontSize: '14px', color: '#666'}}>
                <p><strong>Check In:</strong> {formatTime(attendance?.check_in)}</p>
                <p><strong>Check Out:</strong> {formatTime(attendance?.check_out)}</p>
                <p><strong>OT In:</strong> {formatTime(attendance?.ot_check_in)}</p>
                <p><strong>OT Out:</strong> {formatTime(attendance?.ot_check_out)}</p>
              </div>
            </div>

            {/* Hours Worked */}
            <div style={{padding: '20px', background: '#e3f2fd', borderRadius: '8px'}}>
              <h3 style={{marginTop: 0}}>Hours Worked</h3>
              <div style={{marginTop: '15px'}}>
                <div style={{
                  padding: '15px',
                  background: 'white',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  border: '2px solid #2196f3'
                }}>
                  <p style={{color: '#666', fontSize: '14px', marginBottom: '5px'}}>Regular Hours</p>
                  <p style={{fontSize: '32px', fontWeight: 'bold', color: '#2196f3', margin: 0}}>
                    {regularHours} hrs
                  </p>
                </div>
                <div style={{
                  padding: '15px',
                  background: 'white',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  border: '2px solid #ff9800'
                }}>
                  <p style={{color: '#666', fontSize: '14px', marginBottom: '5px'}}>OT Hours</p>
                  <p style={{fontSize: '32px', fontWeight: 'bold', color: '#ff9800', margin: 0}}>
                    {otHours} hrs
                  </p>
                </div>
                <div style={{
                  padding: '10px',
                  background: '#f3e5f5',
                  borderRadius: '5px',
                  textAlign: 'center'
                }}>
                  <p style={{margin: 0, fontSize: '16px', color: '#7b1fa2', fontWeight: '500'}}>
                    <strong>Total:</strong> {(parseFloat(regularHours) + parseFloat(otHours)).toFixed(2)} hrs
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance History */}
        <div style={{background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}}>
          <h2 style={{marginTop: 0}}>Attendance History</h2>
          {attendanceHistory.length === 0 ? (
            <p style={{textAlign: 'center', color: '#666', padding: '20px'}}>No attendance records found</p>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{background: '#f8f9fa', borderBottom: '2px solid #dee2e6'}}>
                    <th style={{padding: '12px', textAlign: 'left'}}>Date</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>Check In</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>Check Out</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>Regular Hrs</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>OT In</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>OT Out</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>OT Hrs</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceHistory.map((record) => (
                    <tr key={record.id} style={{borderBottom: '1px solid #dee2e6'}}>
                      <td style={{padding: '12px'}}>{formatDate(record.date)}</td>
                      <td style={{padding: '12px'}}>{formatTime(record.check_in)}</td>
                      <td style={{padding: '12px'}}>{formatTime(record.check_out)}</td>
                      <td style={{padding: '12px', fontWeight: '500', color: '#2196f3'}}>
                        {calculateHours(record.check_in, record.check_out)} hrs
                      </td>
                      <td style={{padding: '12px'}}>{formatTime(record.ot_check_in)}</td>
                      <td style={{padding: '12px'}}>{formatTime(record.ot_check_out)}</td>
                      <td style={{padding: '12px', fontWeight: '500', color: '#ff9800'}}>
                        {calculateHours(record.ot_check_in, record.ot_check_out)} hrs
                      </td>
                      <td style={{padding: '12px'}}>
                        <span style={{
                          padding: '4px 8px',
                          background: record.status === 'present' ? '#d4edda' : '#f8d7da',
                          color: record.status === 'present' ? '#155724' : '#721c24',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {record.status}
                        </span>
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

export default MyAttendance;
