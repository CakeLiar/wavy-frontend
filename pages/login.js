
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
    window.location.href = `${API_BASE}/login/tiktok?redirect_uri=${redirectUri}`;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Login</h1>
      <button onClick={handleTikTokLogin}>Sign in with TikTok</button>
    </div>
  );
}