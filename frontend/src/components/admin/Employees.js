import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../Navbar';
import './Employees.css';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    position: '',
    salary: '',
    join_date: ''
  });
  const [error, setError] = useState('');
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
  const navigate = useNavigate();

  const departments = [
    'Nursing Services',
    'Physiotherapy',
    'Diagnostic Services',
    'Medicine Delivery',
    'Vaccination Services',
    'ICU Care',
    'Post-Hospitalization Care',
    'Mother & Child Care',
    'Administration',
    'Operations',
    'Customer Support',
    'Quality Assurance',
    'Marketing & Communications',
    'Finance & Accounts',
    'Human Resources',
    'IT & Technology'
  ];

  const positions = [
    'Registered Nurse (RN)',
    'Staff Nurse',
    'ICU Nurse',
    'Home Care Nurse',
    'Physiotherapist',
    'Senior Physiotherapist',
    'Diagnostic Technician',
    'Lab Technician',
    'Phlebotomist',
    'Healthcare Assistant (HCA)',
    'Vaccination Specialist',
    'Medical Equipment Technician',
    'Operations Manager',
    'Service Coordinator',
    'Patient Care Coordinator',
    'Customer Support Executive',
    'Quality Assurance Manager',
    'Quality Assurance Specialist',
    'Office Administrator',
    'HR Manager',
    'Talent Acquisition Specialist',
    'Accounts Manager',
    'Finance Officer',
    'Marketing Manager',
    'Marketing Executive',
    'Communications Specialist',
    'IT Manager',
    'Software Developer',
    'System Administrator',
    'Branch Manager',
    'Regional Manager',
    'General Manager',
    'Director'
  ];

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [searchTerm, departmentFilter, positionFilter, employees]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = [...employees];

    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.users?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }

    if (positionFilter) {
      filtered = filtered.filter(emp => emp.position === positionFilter);
    }

    setFilteredEmployees(filtered);
    setCurrentPage(1);
  };

  // FIXED: Changed API endpoint from /auth/register to /employees
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/employees', {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        department: formData.department,
        position: formData.position,
        salary: parseFloat(formData.salary),
        joinDate: formData.join_date
      });

      alert(`✅ Employee Added Successfully!\n\n📧 Login Credentials:\nEmail: ${formData.email}\nPassword: ${formData.password}\n\n⚠️ Please share these credentials with the employee.`);
      
      setShowForm(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        department: '',
        position: '',
        salary: '',
        join_date: ''
      });
      fetchEmployees();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add employee');
    }
  };

  const handleDelete = async (id, userId) => {
    if (window.confirm('⚠️ Delete Employee?\n\nThis will permanently delete the employee and their user account.')) {
      try {
        await api.delete(`/employees/${id}`);
        alert('✅ Employee deleted successfully!');
        fetchEmployees();
      } catch (error) {
        alert('❌ Error: ' + error.response?.data?.error);
      }
    }
  };

  const generatePassword = () => {
    const length = 10;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData({...formData, password: password});
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('');
    setPositionFilter('');
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading employees...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="employees-page">
        <div className="header">
          <div>
            <h1>Employee Management</h1>
            <p style={{color: '#666', fontSize: '14px', marginTop: '5px'}}>
              Care & Share - Home Healthcare Services
            </p>
          </div>
          <div style={{display: 'flex', gap: '10px'}}>
            <button className="btn-add" onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Cancel' : '+ Add Employee'}
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

        {error && (
          <div style={{
            background: '#fee',
            color: '#c33',
            padding: '15px',
            borderRadius: '5px',
            marginBottom: '20px',
            border: '1px solid #fdd'
          }}>
            ❌ {error}
          </div>
        )}

        {showForm && (
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            marginBottom: '30px'
          }}>
            <h2 style={{marginTop: 0, color: '#333'}}>Add New Employee</h2>
            <p style={{color: '#666', marginBottom: '25px'}}>
              Create employee account and assign credentials
            </p>
            
            <form onSubmit={handleSubmit}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    placeholder="e.g., Dr. Rajesh Kumar"
                  />
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    placeholder="employee@careandshare.co.in"
                  />
                </div>

                <div className="form-group" style={{gridColumn: 'span 2'}}>
                  <label>Temporary Password *</label>
                  <div style={{display: 'flex', gap: '10px'}}>
                    <input
                      type="text"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                      placeholder="Create temporary password"
                      style={{flex: 1}}
                    />
                    <button 
                      type="button"
                      onClick={generatePassword}
                      style={{
                        padding: '10px 20px',
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      🔑 Generate Password
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Position *</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    required
                  >
                    <option value="">Select Position</option>
                    {positions.map((pos) => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Monthly Salary (₹) *</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                    required
                    placeholder="35000"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label>Date of Joining *</label>
                  <input
                    type="date"
                    value={formData.join_date}
                    onChange={(e) => setFormData({...formData, join_date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                style={{
                  marginTop: '25px',
                  padding: '14px 35px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                ✓ Create Employee Account
              </button>
            </form>
          </div>
        )}

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '15px', alignItems: 'end'}}>
            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px'}}>
                🔍 Search Employees
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px'}}>
                Department
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '14px'
                }}
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px'}}>
                Position
              </label>
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '14px'
                }}
              >
                <option value="">All Positions</option>
                {positions.map((pos) => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            <button
              onClick={clearFilters}
              style={{
                padding: '10px 20px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                whiteSpace: 'nowrap'
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="employees-list">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
            <h3 style={{margin: 0}}>
              Employees ({filteredEmployees.length} {filteredEmployees.length !== employees.length && `of ${employees.length}`})
            </h3>
            <div style={{color: '#666', fontSize: '14px'}}>
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredEmployees.length)} of {filteredEmployees.length}
            </div>
          </div>
          
          {currentEmployees.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '50px',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <p style={{fontSize: '18px', color: '#666', marginBottom: '10px'}}>
                {employees.length === 0 ? 'No employees found' : 'No employees match your filters'}
              </p>
              {filteredEmployees.length === 0 && employees.length > 0 && (
                <button onClick={clearFilters} style={{
                  padding: '10px 20px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div style={{overflowX: 'auto'}}>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Position</th>
                      <th>Salary</th>
                      <th>Join Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentEmployees.map((emp) => (
                      <tr key={emp.id}>
                        <td 
                          style={{
                            fontWeight: '500',
                            color: '#667eea',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                          onClick={() => navigate(`/employee/${emp.id}`)}
                        >
                          {emp.users?.name || 'N/A'}
                        </td>
                        <td>{emp.users?.email || 'N/A'}</td>
                        <td>
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
                        <td>{emp.position}</td>
                        <td style={{fontWeight: '500'}}>₹{emp.salary?.toLocaleString('en-IN')}</td>
                        <td>{new Date(emp.join_date).toLocaleDateString('en-IN')}</td>
                        <td>
                          <button 
                            onClick={() => handleDelete(emp.id, emp.user_id)}
                            style={{
                              padding: '6px 12px',
                              background: '#e74c3c',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '13px'
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '30px',
                  paddingTop: '20px',
                  borderTop: '1px solid #eee'
                }}>
                  <button
                    onClick={() => paginate(1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: '8px 12px',
                      background: currentPage === 1 ? '#e0e0e0' : '#667eea',
                      color: currentPage === 1 ? '#999' : 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ⏮️ First
                  </button>
                  
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: '8px 12px',
                      background: currentPage === 1 ? '#e0e0e0' : '#667eea',
                      color: currentPage === 1 ? '#999' : 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ⏪ Previous
                  </button>

                  <div style={{display: 'flex', gap: '5px'}}>
                    {getPageNumbers().map(number => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        style={{
                          padding: '8px 12px',
                          background: currentPage === number ? '#667eea' : 'white',
                          color: currentPage === number ? 'white' : '#333',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: currentPage === number ? 'bold' : 'normal',
                          minWidth: '40px'
                        }}
                      >
                        {number}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '8px 12px',
                      background: currentPage === totalPages ? '#e0e0e0' : '#667eea',
                      color: currentPage === totalPages ? '#999' : 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Next ⏩
                  </button>

                  <button
                    onClick={() => paginate(totalPages)}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '8px 12px',
                      background: currentPage === totalPages ? '#e0e0e0' : '#667eea',
                      color: currentPage === totalPages ? '#999' : 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Last ⏭️
                  </button>
                  
                  <span style={{marginLeft: '15px', color: '#666', fontSize: '14px'}}>
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Employees;
