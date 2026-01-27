import { useEffect, useState } from 'react';
import { API_BASE } from '../apiBase';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [campaignsError, setCampaignsError] = useState(null);
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

    async function fetchVideos(accessToken) {
      try {
        const response = await fetch(`${API_BASE}/api/v1/videos`, {
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
        console.error('Error fetching videos:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchVideos(token);
      // Fetch campaigns
      fetch(`${API_BASE}/api/v1/campaigns`, {
        method: 'GET',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include',
      })
        .then(res => {
          if (res.status === 401) {
            router.push('/login');
            return;
          }
          return res.json();
        })
        .then(data => {
          if (data && Array.isArray(data.campaigns)) {
            setCampaigns(data.campaigns);
          } else if (data && data.campaigns) {
            setCampaigns([data.campaigns]);
          } else {
            setCampaigns([]);
          }
          setCampaignsLoading(false);
        })
        .catch(err => {
          setCampaignsError('Failed to fetch campaigns');
          setCampaignsLoading(false);
        });
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
        <button
          style={{ marginBottom: '0.5em', cursor: 'pointer', background: '#eee', border: '1px solid #ccc', borderRadius: '4px', padding: '0.3em 0.7em' }}
          onClick={() => setShowProfile((prev) => !prev)}
        >
          {showProfile ? 'Hide' : 'Show'} Profile API Response
        </button>
        {showProfile && (
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', marginTop: 0 }}>
            {profileData ? JSON.stringify(profileData, null, 2) : 'Loading...'}
          </pre>
        )}
      </div>
      {Array.isArray(videos) && videos.length === 0 ? (
        <p>No videos found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1em' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '0.5em' }}>Video ID</th>
              <th style={{ border: '1px solid #ccc', padding: '0.5em' }}>Analyzed</th>
              <th style={{ border: '1px solid #ccc', padding: '0.5em' }}>Transcribed</th>
              <th style={{ border: '1px solid #ccc', padding: '0.5em' }}>Embedded</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(videos) && videos.map((video, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #ccc', padding: '0.5em' }}>{video.tiktokId}</td>
                <td style={{ border: '1px solid #ccc', padding: '0.5em' }}>{video.analyzedAt ? 'Yes' : 'No'}</td>
                <td style={{ border: '1px solid #ccc', padding: '0.5em' }}>{video.transcribedAt ? 'Yes' : 'No'}</td>
                <td style={{ border: '1px solid #ccc', padding: '0.5em' }}>{video.embeddedAt ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Campaigns Section */}
      <div style={{ marginTop: '2em', padding: '1em', background: '#e8f4ff', borderRadius: '6px' }}>
        <h2>Campaigns</h2>
        {campaignsLoading ? (
          <p>Loading campaigns...</p>
        ) : campaignsError ? (
          <p style={{ color: 'red' }}>{campaignsError}</p>
        ) : campaigns.length === 0 ? (
          <p>No campaigns found.</p>
        ) : (
          <ul>
            {campaigns.map((campaign, idx) => (
              <li key={campaign.id || idx}>
                <strong>{campaign.name || campaign.id || 'Unnamed Campaign'}</strong>
                {campaign.description && <div>{campaign.description}</div>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}