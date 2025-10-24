import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../Navbar';
import './Payroll.css';

const Payroll = () => {
  const [payslips, setPayslips] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fetchData = useCallback(async () => {
    try {
      const [payrollRes, empRes] = await Promise.all([
        api.get('/payroll'),
        api.get('/employees')
      ]);
      
      setPayslips(payrollRes.data.payslips || []);
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

  const handleGeneratePayroll = async () => {
    if (!selectedEmployee) {
      alert('Please select an employee');
      return;
    }

    setGenerating(true);
    try {
      const response = await api.post('/payroll/generate', {
        employee_id: selectedEmployee,
        month: selectedMonth,
        year: selectedYear
      });

      alert(`✅ Payroll Generated Successfully!\n\nEmployee: ${response.data.summary.employeeName}\nMonth: ${months[selectedMonth - 1]} ${selectedYear}\nRegular Hours: ${response.data.summary.regularHours} hrs\nOT Hours: ${response.data.summary.otHours} hrs\nTask Allowances: ₹${response.data.summary.taskAllowances}\nNet Salary: ₹${response.data.summary.netSalary}`);
      
      setShowGenerateForm(false);
      setSelectedEmployee('');
      fetchData();
    } catch (error) {
      alert('❌ Error: ' + (error.response?.data?.error || 'Failed to generate payroll'));
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this payroll record?')) {
      try {
        await api.delete(`/payroll/${id}`);
        alert('Payroll deleted successfully');
        fetchData();
      } catch (error) {
        alert('Error: ' + error.response?.data?.error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'generated': return '#ffc107';
      case 'approved': return '#2196f3';
      case 'paid': return '#4caf50';
      default: return '#999';
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{padding: '50px', textAlign: 'center'}}>Loading payroll...</div>
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
            <h1 style={{margin: 0}}>Payroll Management</h1>
            <p style={{color: '#666', marginTop: '5px'}}>Generate and manage employee payroll</p>
          </div>
          <div style={{display: 'flex', gap: '10px'}}>
            <button 
              onClick={() => setShowGenerateForm(!showGenerateForm)}
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
              {showGenerateForm ? '✕ Cancel' : '+ Generate Payroll'}
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

        {/* Generate Payroll Form */}
        {showGenerateForm && (
          <div style={{background: 'white', padding: '30px', borderRadius: '10px', marginBottom: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}}>
            <h2 style={{marginTop: 0}}>Generate Payroll</h2>
            <p style={{color: '#666', marginBottom: '20px'}}>
              System will automatically calculate: Base Salary + OT Pay + Task Allowances - Deductions
            </p>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Employee *</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
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
                <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Month *</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}
                >
                  {months.map((month, idx) => (
                    <option key={idx} value={idx + 1}>{month}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Year *</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}
                >
                  {[2024, 2025, 2026].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleGeneratePayroll}
              disabled={generating}
              style={{
                padding: '12px 30px',
                background: generating ? '#ccc' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: generating ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              {generating ? 'Generating...' : '💰 Generate Payroll'}
            </button>
          </div>
        )}

        {/* Payroll List */}
        <div style={{background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}}>
          <h2 style={{marginTop: 0}}>All Payroll Records ({payslips.length})</h2>
          
          {payslips.length === 0 ? (
            <p style={{textAlign: 'center', color: '#666', padding: '30px'}}>No payroll records yet</p>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{background: '#f8f9fa', borderBottom: '2px solid #dee2e6'}}>
                    <th style={{padding: '12px', textAlign: 'left'}}>Employee</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>Period</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>Basic Salary</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>Hours</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>OT Pay</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>Allowances</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>Deductions</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>Net Salary</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>Status</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payslips.map(payslip => (
                    <tr key={payslip.id} style={{borderBottom: '1px solid #dee2e6'}}>
                      <td style={{padding: '12px'}}>
                        <div style={{fontWeight: '500'}}>{payslip.employees?.users?.name || 'N/A'}</div>
                        <div style={{fontSize: '12px', color: '#999'}}>{payslip.employees?.position}</div>
                      </td>
                      <td style={{padding: '12px'}}>
                        {months[payslip.month - 1]} {payslip.year}
                      </td>
                      <td style={{padding: '12px', fontWeight: '500'}}>
                        ₹{parseFloat(payslip.basic_salary).toLocaleString('en-IN')}
                      </td>
                      <td style={{padding: '12px'}}>
                        <div style={{fontSize: '12px'}}>
                          <div>Reg: {payslip.regular_hours || 0} hrs</div>
                          <div style={{color: '#ff9800'}}>OT: {payslip.ot_hours || 0} hrs</div>
                        </div>
                      </td>
                      <td style={{padding: '12px', color: '#ff9800', fontWeight: '500'}}>
                        ₹{parseFloat(payslip.ot_pay || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{padding: '12px', color: '#4caf50', fontWeight: '500'}}>
                        ₹{parseFloat(payslip.total_allowances || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{padding: '12px', color: '#f44336'}}>
                        -₹{parseFloat(payslip.deductions || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{padding: '12px', fontWeight: 'bold', color: '#2196f3', fontSize: '16px'}}>
                        ₹{parseFloat(payslip.net_salary).toLocaleString('en-IN')}
                      </td>
                      <td style={{padding: '12px'}}>
                        <span style={{
                          padding: '4px 8px',
                          background: getStatusColor(payslip.status) + '20',
                          color: getStatusColor(payslip.status),
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {payslip.status?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{padding: '12px'}}>
                        <button
                          onClick={() => handleDelete(payslip.id)}
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

export default Payroll;
