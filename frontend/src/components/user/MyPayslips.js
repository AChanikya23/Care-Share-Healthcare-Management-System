import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import Navbar from '../Navbar';
import './MyPayslips.css';

const MyPayslips = () => {
  const { user } = useContext(AuthContext);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const navigate = useNavigate();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fetchEmployeePayslips = useCallback(async (empId, empData) => {
    try {
      const response = await api.get(`/payroll/employee/${empId}`);
      setPayslips(response.data.payslips || []);
      setEmployeeDetails(empData);
    } catch (error) {
      console.error('Error fetching payslips:', error);
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
        await fetchEmployeePayslips(myEmployee.id, myEmployee);
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, fetchEmployeePayslips]);

  useEffect(() => {
    if (user) {
      fetchEmployeeData();
    }
  }, [user, fetchEmployeeData]);

  const downloadPayslipAsPDF = (payslip) => {
    const printWindow = window.open('', '', 'height=800,width=800');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${months[payslip.month - 1]} ${payslip.year}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #667eea;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
          }
          .subtitle {
            color: #666;
            font-size: 14px;
          }
          .payslip-title {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin: 20px 0;
            color: #333;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            background: #f8f9fa;
            padding: 10px;
            font-weight: bold;
            border-left: 4px solid #667eea;
            margin-bottom: 15px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          table td {
            padding: 10px;
            border-bottom: 1px solid #eee;
          }
          table td:first-child {
            font-weight: 500;
            width: 60%;
          }
          table td:last-child {
            text-align: right;
            font-weight: bold;
          }
          .earnings {
            color: #4caf50;
          }
          .deductions {
            color: #f44336;
          }
          .total-row {
            background: #f8f9fa;
            font-size: 18px;
            font-weight: bold;
          }
          .net-salary {
            background: #667eea;
            color: white;
            font-size: 20px;
            padding: 15px !important;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            text-align: center;
            color: #999;
            font-size: 12px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          .info-box {
            border: 1px solid #eee;
            padding: 15px;
            border-radius: 5px;
          }
          .info-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
          }
          .info-value {
            font-weight: bold;
            font-size: 14px;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Care & Share</div>
          <div class="subtitle">Home Healthcare Services</div>
        </div>

        <div class="payslip-title">SALARY SLIP</div>

        <div class="info-grid">
          <div class="info-box">
            <div class="info-label">Employee Name</div>
            <div class="info-value">${employeeDetails?.users?.name || 'N/A'}</div>
          </div>
          <div class="info-box">
            <div class="info-label">Employee ID</div>
            <div class="info-value">${employeeId}</div>
          </div>
          <div class="info-box">
            <div class="info-label">Department</div>
            <div class="info-value">${employeeDetails?.department || 'N/A'}</div>
          </div>
          <div class="info-box">
            <div class="info-label">Designation</div>
            <div class="info-value">${employeeDetails?.position || 'N/A'}</div>
          </div>
          <div class="info-box">
            <div class="info-label">Pay Period</div>
            <div class="info-value">${months[payslip.month - 1]} ${payslip.year}</div>
          </div>
          <div class="info-box">
            <div class="info-label">Payment Date</div>
            <div class="info-value">${new Date(payslip.payment_date).toLocaleDateString('en-IN')}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">EARNINGS</div>
          <table>
            <tr>
              <td>Basic Salary</td>
              <td class="earnings">₹${parseFloat(payslip.basic_salary).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>Regular Hours (${payslip.regular_hours || 0} hrs)</td>
              <td class="earnings">Included in Basic</td>
            </tr>
            <tr>
              <td>Overtime Pay (${payslip.ot_hours || 0} hrs @ ₹${parseFloat(payslip.ot_rate || 0).toFixed(2)}/hr)</td>
              <td class="earnings">₹${parseFloat(payslip.ot_pay || 0).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>Task Completion Allowances</td>
              <td class="earnings">₹${parseFloat(payslip.task_allowances || 0).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>Other Allowances</td>
              <td class="earnings">₹${parseFloat((payslip.total_allowances || 0) - (payslip.task_allowances || 0)).toLocaleString('en-IN')}</td>
            </tr>
            <tr class="total-row">
              <td>Gross Salary</td>
              <td class="earnings">₹${parseFloat(payslip.gross_salary || 0).toLocaleString('en-IN')}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">DEDUCTIONS</div>
          <table>
            <tr>
              <td>Income Tax (TDS)</td>
              <td class="deductions">₹${(parseFloat(payslip.deductions || 0) * 0.5).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>Provident Fund (PF)</td>
              <td class="deductions">₹${(parseFloat(payslip.deductions || 0) * 0.3).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>Professional Tax</td>
              <td class="deductions">₹${(parseFloat(payslip.deductions || 0) * 0.2).toLocaleString('en-IN')}</td>
            </tr>
            <tr class="total-row">
              <td>Total Deductions</td>
              <td class="deductions">₹${parseFloat(payslip.deductions || 0).toLocaleString('en-IN')}</td>
            </tr>
          </table>
        </div>

        <table>
          <tr class="net-salary">
            <td>NET SALARY</td>
            <td>₹${parseFloat(payslip.net_salary).toLocaleString('en-IN')}</td>
          </tr>
        </table>

        <div class="footer">
          <p>This is a computer-generated payslip and does not require a signature.</p>
          <p>Care & Share - Home Healthcare Services | careandshare.co.in</p>
          <p>Generated on ${new Date().toLocaleDateString('en-IN')}</p>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{padding: '50px', textAlign: 'center'}}>Loading payslips...</div>
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
            <h1 style={{margin: 0}}>My Payslips</h1>
            <p style={{color: '#666', marginTop: '5px'}}>View and download your salary slips</p>
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

        {/* Payslips */}
        {payslips.length === 0 ? (
          <div style={{background: 'white', padding: '50px', borderRadius: '10px', textAlign: 'center'}}>
            <div style={{fontSize: '64px', marginBottom: '20px'}}>💰</div>
            <h2>No Payslips Available</h2>
            <p style={{color: '#666'}}>Your salary slips will appear here once generated by admin</p>
          </div>
        ) : (
          <div style={{display: 'grid', gap: '20px'}}>
            {payslips.map(payslip => (
              <div key={payslip.id} style={{
                background: 'white',
                padding: '30px',
                borderRadius: '10px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '25px'}}>
                  <div>
                    <h2 style={{margin: '0 0 5px 0', color: '#333'}}>
                      {months[payslip.month - 1]} {payslip.year}
                    </h2>
                    <p style={{color: '#666', margin: 0}}>
                      Payment Date: {new Date(payslip.payment_date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <button
                    onClick={() => downloadPayslipAsPDF(payslip)}
                    style={{
                      padding: '10px 20px',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    📥 Download PDF
                  </button>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '25px'}}>
                  <div style={{padding: '15px', background: '#e3f2fd', borderRadius: '8px'}}>
                    <div style={{fontSize: '12px', color: '#666', marginBottom: '5px'}}>Basic Salary</div>
                    <div style={{fontSize: '20px', fontWeight: 'bold', color: '#2196f3'}}>
                      ₹{parseFloat(payslip.basic_salary).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div style={{padding: '15px', background: '#fff3e0', borderRadius: '8px'}}>
                    <div style={{fontSize: '12px', color: '#666', marginBottom: '5px'}}>OT Pay ({payslip.ot_hours || 0} hrs)</div>
                    <div style={{fontSize: '20px', fontWeight: 'bold', color: '#ff9800'}}>
                      ₹{parseFloat(payslip.ot_pay || 0).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div style={{padding: '15px', background: '#e8f5e9', borderRadius: '8px'}}>
                    <div style={{fontSize: '12px', color: '#666', marginBottom: '5px'}}>Allowances</div>
                    <div style={{fontSize: '20px', fontWeight: 'bold', color: '#4caf50'}}>
                      ₹{parseFloat(payslip.total_allowances || 0).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div style={{padding: '15px', background: '#ffebee', borderRadius: '8px'}}>
                    <div style={{fontSize: '12px', color: '#666', marginBottom: '5px'}}>Deductions</div>
                    <div style={{fontSize: '20px', fontWeight: 'bold', color: '#f44336'}}>
                      -₹{parseFloat(payslip.deductions || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{color: 'white', fontSize: '18px', fontWeight: '500'}}>
                    Net Salary
                  </div>
                  <div style={{color: 'white', fontSize: '32px', fontWeight: 'bold'}}>
                    ₹{parseFloat(payslip.net_salary).toLocaleString('en-IN')}
                  </div>
                </div>

                <div style={{marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '5px'}}>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '13px', color: '#666'}}>
                    <div>
                      <strong>Regular Hours:</strong> {payslip.regular_hours || 0} hrs
                    </div>
                    <div>
                      <strong>OT Hours:</strong> {payslip.ot_hours || 0} hrs
                    </div>
                    <div>
                      <strong>Task Allowances:</strong> ₹{parseFloat(payslip.task_allowances || 0).toLocaleString('en-IN')}
                    </div>
                    <div>
                      <strong>Gross Salary:</strong> ₹{parseFloat(payslip.gross_salary || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyPayslips;
