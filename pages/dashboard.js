import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getTokenFromUrl, getStoredToken, saveToken, logout } from '../utils/auth';

export default function Dashboard() {
  const [accessToken, setAccessToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Centralized token retrieval: try URL first, then sessionStorage
    let token = getTokenFromUrl();
    if (!token) {
      token = getStoredToken();
    } else {
      saveToken(token);
    }
    
    if (token) {
      setAccessToken(token);
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await logout(accessToken);
    } finally {
      router.push('/login');
    }
  };

  return (
    <div className="page">
      <div className="header-row">
        <h1 className="title">Wavy Dashboard</h1>
        <div style={{ display: 'flex', gap: '0.6em', alignItems: 'center' }}>
          <button className="minimal-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh',
        gap: '2em'
      }}>
        <h2 style={{ fontSize: '2em', fontWeight: 600, marginBottom: '1em' }}>Choose your dashboard</h2>
        <div style={{ display: 'flex', gap: '2em' }}>
          <button 
            className="dashboard-choice-btn"
            onClick={() => router.push('/creator/dashboard')}
          >
            <div className="dashboard-choice-icon">🎬</div>
            <div className="dashboard-choice-title">Creator</div>
            <div className="dashboard-choice-desc">Manage your videos and content</div>
          </button>
          <button 
            className="dashboard-choice-btn"
            onClick={() => router.push('/brand/dashboard')}
          >
            <div className="dashboard-choice-icon">🏢</div>
            <div className="dashboard-choice-title">Brand</div>
            <div className="dashboard-choice-desc">Manage campaigns and creators</div>
          </button>
        </div>
      </div>
    </div>
  );
}