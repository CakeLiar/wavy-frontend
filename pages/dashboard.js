import { useEffect, useState } from 'react';
import { API_BASE } from '../apiBase';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Print query parameters to the console
    const url = new URL(window.location.href);
    const params = Object.fromEntries(url.searchParams.entries());
    console.log('Dashboard query parameters:', params);

    // Check for access token in URL (after backend redirect)
    let token = url.searchParams.get('access_token');
    if (!token) {
      // Try to get from sessionStorage (if previously saved)
      token = sessionStorage.getItem('access_token');
    } else {
      // Save token for future requests
      sessionStorage.setItem('access_token', token);
      // Remove token from URL for cleanliness
      url.searchParams.delete('access_token');
      window.history.replaceState({}, document.title, url.pathname + url.search);
    }
    setAccessToken(token);

    async function checkAuth(accessToken) {
      try {
        const response = await fetch(`${API_BASE}/api/v1/profile`, {
          method: 'GET',
          headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
          credentials: 'include',
        });
        if (response.status === 401) {
          router.push('/login');
        } else if (response.ok) {
          const data = await response.json();
          setProfileData(data);
          setVideos(data.videos || []);
        } else {
          setProfileData({ error: 'Failed to fetch videos' });
          console.error('Failed to fetch videos');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      checkAuth(token);
    } else {
      setLoading(false);
      router.push('/login');
    }
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleLogout = async () => {
    sessionStorage.removeItem('access_token');
    try {
      const response = await fetch(`${API_BASE}/logout`, {
        method: 'GET',
        headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
      });
      if (response.ok) {
        router.push('/login');
      } else {
        alert('Logout failed');
      }
    } catch (error) {
      alert('Logout error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Videos Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div style={{ margin: '1em 0', padding: '1em', background: '#f5f5f5', borderRadius: '6px' }}>
        <strong>Profile API Response:</strong>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{profileData ? JSON.stringify(profileData, null, 2) : 'Loading...'}</pre>
      </div>
      {videos.length === 0 ? (
        <p>No videos found.</p>
      ) : (
        <ul>
          {videos.map((video, index) => (
            <li key={index}>
              <p>Video ID: {video.id}</p>
              <p>Progress: {video.progress}%</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}