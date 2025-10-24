import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingTasks: 0,
    completedTasks: 0,
    totalHoursToday: 0,
    totalOTToday: 0,
    thisMonthPayroll: 0,
    avgAttendanceRate: 0
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      const empResponse = await api.get('/employees');
      const employees = empResponse.data.employees || [];
      
      const attResponse = await api.get('/attendance');
      const attendance = attResponse.data.attendance || [];
      
      const tasksResponse = await api.get('/tasks');
      const tasks = tasksResponse.data.tasks || [];
      
      const payrollResponse = await api.get('/payroll');
      const payrolls = payrollResponse.data.payslips || [];

      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = attendance.filter(att => att.date === today);
      
      let totalHours = 0;
      let totalOT = 0;
      todayAttendance.forEach(att => {
        if (att.check_in && att.check_out) {
          totalHours += (new Date(att.check_out) - new Date(att.check_in)) / (1000 * 60 * 60);
        }
        if (att.ot_check_in && att.ot_check_out) {
          totalOT += (new Date(att.ot_check_out) - new Date(att.ot_check_in)) / (1000 * 60 * 60);
        }
      });

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const thisMonthPayroll = payrolls
        .filter(p => p.month === currentMonth && p.year === currentYear)
        .reduce((sum, p) => sum + parseFloat(p.net_salary || 0), 0);

      const last7Days = Array.from({length: 7}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date;
      });

      const weeklyStats = [];
      const graphData = [];
      const maxEmployees = employees.length || 10;

      last7Days.forEach(date => {
        const dateStr = date.toISOString().split('T')[0];
        const dayAtt = attendance.filter(att => att.date === dateStr);
        const dayTasks = tasks.filter(t => t.due_date === dateStr);
        
        let hours = 0;
        let ot = 0;
        dayAtt.forEach(att => {
          if (att.check_in && att.check_out) {
            hours += (new Date(att.check_out) - new Date(att.check_in)) / (1000 * 60 * 60);
          }
          if (att.ot_check_in && att.ot_check_out) {
            ot += (new Date(att.ot_check_out) - new Date(att.ot_check_in)) / (1000 * 60 * 60);
          }
        });

        weeklyStats.push({
          date: dateStr,
          present: dayAtt.length,
          hours: hours.toFixed(1),
          ot: ot.toFixed(1),
          tasks: dayTasks.filter(t => t.status === 'completed').length,
          totalTasks: dayTasks.length
        });

        graphData.push({
          label: date.toLocaleDateString('en-IN', { weekday: 'short' }),
          date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          attendance: dayAtt.length,
          attendancePercent: (dayAtt.length / maxEmployees) * 100,
          hours: parseFloat(hours.toFixed(1)),
          hoursPercent: Math.min((hours / 80) * 100, 100),
          tasks: dayTasks.filter(t => t.status === 'completed').length,
          tasksPercent: dayTasks.length > 0 ? (dayTasks.filter(t => t.status === 'completed').length / dayTasks.length) * 100 : 0
        });
      });

      setStats({
        totalEmployees: employees.length,
        presentToday: todayAttendance.length,
        pendingTasks: tasks.filter(t => t.status === 'pending').length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        totalHoursToday: totalHours.toFixed(1),
        totalOTToday: totalOT.toFixed(1),
        thisMonthPayroll: thisMonthPayroll.toFixed(0),
        avgAttendanceRate: employees.length > 0 ? ((todayAttendance.length / employees.length) * 100).toFixed(1) : 0
      });

      setWeeklyData(weeklyStats);
      setChartData(graphData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Care & Share Dashboard</h1>
          <p className="dashboard-subtitle">Home Healthcare Management System</p>
        </div>
        <div className="dashboard-date">
          <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Quick Actions - At TOP */}
      <div className="quick-actions-top">
        <h3 className="section-title">⚡ Quick Actions</h3>
        <div className="quick-actions-horizontal">
          <button className="quick-action-card quick-action-purple" onClick={() => navigate('/employees')}>
            <div className="quick-action-icon">👥</div>
            <div className="quick-action-content">
              <h4>Manage Employees</h4>
              <p>Add, edit, view employees</p>
            </div>
          </button>

          <button className="quick-action-card quick-action-blue" onClick={() => navigate('/attendance')}>
            <div className="quick-action-icon">📅</div>
            <div className="quick-action-content">
              <h4>View Attendance</h4>
              <p>Check-in/out records</p>
            </div>
          </button>

          <button className="quick-action-card quick-action-green" onClick={() => navigate('/tasks')}>
            <div className="quick-action-icon">✓</div>
            <div className="quick-action-content">
              <h4>Manage Tasks</h4>
              <p>Assign & track tasks</p>
            </div>
          </button>

          <button className="quick-action-card quick-action-pink" onClick={() => navigate('/payroll')}>
            <div className="quick-action-icon">💰</div>
            <div className="quick-action-content">
              <h4>Generate Payroll</h4>
              <p>Monthly salary slips</p>
            </div>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card-purple">
          <div className="stat-content">
            <div className="stat-info">
              <p className="stat-label">Total Employees</p>
              <h2 className="stat-value">{stats.totalEmployees}</h2>
              <span className="stat-change positive">Active</span>
            </div>
            <div className="stat-icon">👥</div>
          </div>
        </div>

        <div className="stat-card stat-card-blue">
          <div className="stat-content">
            <div className="stat-info">
              <p className="stat-label">Present Today</p>
              <h2 className="stat-value">{stats.presentToday}</h2>
              <span className="stat-change">{stats.avgAttendanceRate}% attendance</span>
            </div>
            <div className="stat-icon">✅</div>
          </div>
        </div>

        <div className="stat-card stat-card-cyan">
          <div className="stat-content">
            <div className="stat-info">
              <p className="stat-label">Today's Hours</p>
              <h2 className="stat-value">{stats.totalHoursToday}h</h2>
              <span className="stat-change">+{stats.totalOTToday}h OT</span>
            </div>
            <div className="stat-icon">⏱️</div>
          </div>
        </div>

        <div className="stat-card stat-card-green">
          <div className="stat-content">
            <div className="stat-info">
              <p className="stat-label">Completed Tasks</p>
              <h2 className="stat-value">{stats.completedTasks}</h2>
              <span className="stat-change">{stats.pendingTasks} pending</span>
            </div>
            <div className="stat-icon">✓</div>
          </div>
        </div>

        <div className="stat-card stat-card-pink">
          <div className="stat-content">
            <div className="stat-info">
              <p className="stat-label">Pending Tasks</p>
              <h2 className="stat-value">{stats.pendingTasks}</h2>
              <span className="stat-change negative">Requires attention</span>
            </div>
            <div className="stat-icon">📋</div>
          </div>
        </div>

        <div className="stat-card stat-card-gradient">
          <div className="stat-content">
            <div className="stat-info">
              <p className="stat-label">This Month Payroll</p>
              <h2 className="stat-value">₹{parseFloat(stats.thisMonthPayroll).toLocaleString('en-IN')}</h2>
              <span className="stat-change">{new Date().toLocaleString('default', { month: 'short' })}</span>
            </div>
            <div className="stat-icon">💰</div>
          </div>
        </div>
      </div>

      {/* CSS Charts */}
      <div className="charts-section">
        {/* Attendance Chart */}
        <div className="dashboard-card">
          <h3 className="card-title">📊 Attendance Trend (Last 7 Days)</h3>
          <div className="css-chart">
            {chartData.map((day, index) => (
              <div key={index} className="chart-bar-container">
                <div className="chart-bar">
                  <div 
                    className="chart-bar-fill chart-bar-purple"
                    style={{height: `${day.attendancePercent}%`}}
                  >
                    <span className="chart-bar-value">{day.attendance}</span>
                  </div>
                </div>
                <div className="chart-label">
                  <div className="chart-day">{day.label}</div>
                  <div className="chart-date">{day.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Work Hours Chart */}
        <div className="dashboard-card">
          <h3 className="card-title">⏱️ Work Hours (Last 7 Days)</h3>
          <div className="css-chart">
            {chartData.map((day, index) => (
              <div key={index} className="chart-bar-container">
                <div className="chart-bar">
                  <div 
                    className="chart-bar-fill chart-bar-cyan"
                    style={{height: `${day.hoursPercent}%`}}
                  >
                    <span className="chart-bar-value">{day.hours}h</span>
                  </div>
                </div>
                <div className="chart-label">
                  <div className="chart-day">{day.label}</div>
                  <div className="chart-date">{day.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Overview Table */}
      <div className="dashboard-card weekly-table-card">
        <h3 className="card-title">📋 Last 7 Days Overview</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Present</th>
                <th>Hours</th>
                <th>OT Hours</th>
                <th>Tasks</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {weeklyData.map((day, index) => (
                <tr key={index}>
                  <td className="date-cell">
                    {new Date(day.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </td>
                  <td><span className="badge badge-blue">{day.present}</span></td>
                  <td><span className="badge badge-purple">{day.hours}h</span></td>
                  <td><span className="badge badge-orange">{day.ot}h</span></td>
                  <td><span className="badge badge-green">{day.tasks}/{day.totalTasks}</span></td>
                  <td>
                    {day.present > 0 ? (
                      <span className="status-badge status-active">Active</span>
                    ) : (
                      <span className="status-badge status-inactive">No Data</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon">📈</div>
          <div className="summary-content">
            <h4>Total Work Hours (Today)</h4>
            <p className="summary-value">{stats.totalHoursToday} hours</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">⏰</div>
          <div className="summary-content">
            <h4>Overtime Hours (Today)</h4>
            <p className="summary-value">{stats.totalOTToday} hours</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">✨</div>
          <div className="summary-content">
            <h4>Task Completion Rate</h4>
            <p className="summary-value">
              {stats.completedTasks + stats.pendingTasks > 0
                ? ((stats.completedTasks / (stats.completedTasks + stats.pendingTasks)) * 100).toFixed(0)
                : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
