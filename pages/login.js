
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { API_BASE } from '../apiBase';


export default function Login() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    if (token) {
      fetch(`${API_BASE}/api/v1/videos`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      })
        .then(res => {
          if (res.ok) {
            router.replace('/dashboard');
          } else {
            setLoading(false);
          }
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleTikTokLogin = () => {
    const redirectUri = encodeURIComponent(window.location.origin + '/callback');
    window.location.href = `${API_BASE}/api/v1/login/tiktok?redirect_uri=${redirectUri}`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, Arial, sans-serif', fontWeight: 400 }}>
        <span style={{ fontSize: '1.2em', letterSpacing: '0.02em' }}>Loading...</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, Arial, sans-serif', fontWeight: 400 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
        .minimal-btn {
          background: #111;
          color: #fff;
          border: 1px solid #222;
          border-radius: 6px;
          padding: 0.6em 1.4em;
          font-family: Inter, Arial, sans-serif;
          font-size: 1em;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .minimal-btn:hover {
          background: #222;
        }
      `}</style>
      <h1 style={{ fontWeight: 600, fontSize: '2em', marginBottom: '1.5em', letterSpacing: '0.02em' }}>Login</h1>
      <button className="minimal-btn" onClick={handleTikTokLogin}>Sign in with TikTok</button>
    </div>
  );
}