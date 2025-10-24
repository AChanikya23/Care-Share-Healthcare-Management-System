import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '15px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      color: 'white'
    }}>
      <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
        <img 
          src="/logo.png" 
          alt="Care & Share" 
          style={{
            height: '50px',
            width: 'auto',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/dashboard')}
        />
        <div>
          <h2 style={{margin: 0, fontSize: '20px', fontWeight: '600'}}>Care & Share</h2>
          <p style={{margin: 0, fontSize: '12px', opacity: 0.9}}>Home Healthcare Services</p>
        </div>
      </div>
      
      <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
        <span style={{fontSize: '14px', fontWeight: '500'}}>
          {user?.name} ({user?.role === 'admin' ? 'Admin' : 'User'})
        </span>
        <button 
          onClick={handleLogout}
          style={{
            padding: '8px 20px',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
