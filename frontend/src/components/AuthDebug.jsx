// src/components/AuthDebug.jsx
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AuthDebug = () => {
  const { user, token, loading } = useContext(AuthContext);

  const debugInfo = {
    user,
    token: token ? 'Present' : 'Missing',
    tokenLength: token ? token.length : 0,
    loading,
    localStorage: {
      authToken: localStorage.getItem('authToken') ? 'Present' : 'Missing',
      userData: localStorage.getItem('userData') ? 'Present' : 'Missing',
    }
  };

  const clearStorage = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.reload();
  };

  const inspectToken = () => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        console.log('Token payload:', payload);
        alert('Check console for token details');
      } catch (error) {
        console.error('Error parsing token:', error);
        alert('Invalid token format');
      }
    } else {
      alert('No token found in localStorage');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'white',
      border: '2px solid #ccc',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 1000,
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Auth Debug Info</h4>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Context State:</strong>
        <pre style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px', fontSize: '11px' }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button 
          onClick={clearStorage}
          style={{
            background: '#ff4444',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Clear Storage
        </button>
        
        <button 
          onClick={inspectToken}
          style={{
            background: '#4444ff',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Inspect Token
        </button>
        
        <button 
          onClick={() => console.log('Full localStorage:', localStorage)}
          style={{
            background: '#44ff44',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Log Storage
        </button>
      </div>
    </div>
  );
};

export default AuthDebug;