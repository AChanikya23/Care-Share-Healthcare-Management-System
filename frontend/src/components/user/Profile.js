import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import Navbar from '../Navbar';
import './Profile.css';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long!' });
      return;
    }

    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });

      setMessage({ type: 'success', text: '✅ Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to change password' 
      });
    }
  };

  const handleViewFullProfile = async () => {
    try {
      console.log('🔍 Fetching employees...');
      console.log('Current user:', user);
      
      const empResponse = await api.get('/employees');
      console.log('✅ Employees Response:', empResponse.data);
      
      const myEmployee = empResponse.data.employees?.find(
        emp => emp.users?.email === user?.email
      );
      console.log('👤 My Employee Record:', myEmployee);
      
      if (myEmployee) {
        console.log('✅ Found employee! Navigating to:', `/employee/${myEmployee.id}`);
        navigate(`/employee/${myEmployee.id}`);
      } else {
        console.error('❌ No employee record found for email:', user?.email);
        alert('Employee profile not found. Please contact admin to create your employee record.');
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      console.error('Error details:', error.response?.data);
      alert('Error loading profile: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <>
      <Navbar />
      <div style={{
        padding: '30px',
        background: '#f5f5f5',
        minHeight: 'calc(100vh - 60px)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <div>
            <h1 style={{margin: 0, fontSize: '32px'}}>My Profile</h1>
            <p style={{color: '#666', marginTop: '5px', fontSize: '14px'}}>
              Manage your account settings and view your profile
            </p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '10px 20px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← Back
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '30px',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div>
            <div style={{
              background: 'white',
              borderRadius: '10px',
              padding: '30px',
              textAlign: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>

              <h2 style={{margin: '0 0 10px 0', color: '#333'}}>{user?.name}</h2>
              <p style={{color: '#999', fontSize: '14px', marginBottom: '20px'}}>
                {user?.email}
              </p>

              <div style={{
                padding: '10px 20px',
                background: user?.role === 'admin' ? '#e3f2fd' : '#f3e5f5',
                borderRadius: '20px',
                display: 'inline-block',
                fontSize: '13px',
                fontWeight: '500',
                color: user?.role === 'admin' ? '#1976d2' : '#7b1fa2',
                marginBottom: '20px'
              }}>
                {user?.role === 'admin' ? '👑 Administrator' : '👤 Employee'}
              </div>

              <div style={{
                borderTop: '1px solid #eee',
                paddingTop: '20px',
                marginTop: '20px'
              }}>
                <button
                  onClick={handleViewFullProfile}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '10px'
                  }}
                >
                  📊 View Full Work History
                </button>
                
                <button
                  onClick={() => navigate('/my-attendance')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#f8f9fa',
                    color: '#333',
                    border: '1px solid #dee2e6',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '10px'
                  }}
                >
                  📅 My Attendance
                </button>
                
                <button
                  onClick={() => navigate('/my-tasks')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#f8f9fa',
                    color: '#333',
                    border: '1px solid #dee2e6',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '10px'
                  }}
                >
                  📋 My Tasks
                </button>
                
                <button
                  onClick={() => navigate('/my-payslips')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#f8f9fa',
                    color: '#333',
                    border: '1px solid #dee2e6',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  💰 My Payslips
                </button>
              </div>
            </div>

            <div style={{
              background: 'white',
              borderRadius: '10px',
              padding: '25px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{margin: '0 0 20px 0', fontSize: '18px'}}>Account Information</h3>
              
              <div style={{marginBottom: '15px'}}>
                <div style={{fontSize: '12px', color: '#999', marginBottom: '5px'}}>User ID</div>
                <div style={{fontSize: '14px', fontWeight: '500', color: '#333'}}>{user?.id?.slice(0, 8)}...</div>
              </div>

              <div style={{marginBottom: '15px'}}>
                <div style={{fontSize: '12px', color: '#999', marginBottom: '5px'}}>Account Type</div>
                <div style={{fontSize: '14px', fontWeight: '500', color: '#333'}}>
                  {user?.role === 'admin' ? 'Administrator' : 'Standard User'}
                </div>
              </div>

              <div>
                <div style={{fontSize: '12px', color: '#999', marginBottom: '5px'}}>Email Address</div>
                <div style={{fontSize: '14px', fontWeight: '500', color: '#333'}}>{user?.email}</div>
              </div>
            </div>
          </div>

          <div>
            <div style={{
              background: 'white',
              borderRadius: '10px',
              padding: '35px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <div style={{marginBottom: '30px'}}>
                <h2 style={{margin: '0 0 10px 0', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                  🔒 Security Settings
                </h2>
                <p style={{color: '#666', fontSize: '14px', margin: 0}}>
                  Change your password to keep your account secure
                </p>
              </div>

              {message.text && (
                <div style={{
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '25px',
                  background: message.type === 'success' ? '#d4edda' : '#f8d7da',
                  color: message.type === 'success' ? '#155724' : '#721c24',
                  border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  {message.type === 'success' ? '✅' : '❌'} {message.text}
                </div>
              )}

              <form onSubmit={handleChangePassword}>
                <div style={{marginBottom: '25px'}}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    fontSize: '14px',
                    color: '#333'
                  }}>
                    Current Password *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Enter your current password"
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'border-color 0.3s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <div style={{marginBottom: '25px'}}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    fontSize: '14px',
                    color: '#333'
                  }}>
                    New Password *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Enter new password"
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'border-color 0.3s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                  <small style={{color: '#999', fontSize: '12px', display: 'block', marginTop: '5px'}}>
                    Minimum 6 characters required
                  </small>
                </div>

                <div style={{marginBottom: '25px'}}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    fontSize: '14px',
                    color: '#333'
                  }}>
                    Confirm New Password *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter new password"
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'border-color 0.3s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <div style={{marginBottom: '25px'}}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    <input
                      type="checkbox"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      style={{marginRight: '8px', cursor: 'pointer'}}
                    />
                    Show passwords
                  </label>
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  🔐 Change Password
                </button>
              </form>

              <div style={{
                marginTop: '30px',
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '8px',
                borderLeft: '4px solid #667eea'
              }}>
                <h4 style={{margin: '0 0 10px 0', fontSize: '14px', color: '#333'}}>
                  💡 Password Security Tips
                </h4>
                <ul style={{
                  margin: 0,
                  paddingLeft: '20px',
                  fontSize: '13px',
                  color: '#666',
                  lineHeight: '1.8'
                }}>
                  <li>Use a combination of letters, numbers, and symbols</li>
                  <li>Avoid using personal information</li>
                  <li>Don't reuse passwords from other accounts</li>
                  <li>Change your password regularly</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
