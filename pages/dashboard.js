import React, { useEffect, useState } from 'react';
import { API_BASE } from '../apiBase';
import { useRouter } from 'next/router';
import VideoCards from '../components/VideoCards';
import Campaigns from '../components/Campaigns';

export default function Dashboard() {
  const [selectedView, setSelectedView] = useState('videos');
  const [expandedCampaign, setExpandedCampaign] = useState(null);
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
    <div className="page">
      <div className="header-row">
        <h1 className="title">Wavy Creator Dashboard</h1>
        <button className="minimal-btn" onClick={handleLogout}>Logout</button>
      </div>
      <div className="container">
        <button
          className="minimal-btn profile-toggle"
          onClick={() => setShowProfile((prev) => !prev)}
        >
          {showProfile ? 'Hide' : 'Show'} Profile API Response
        </button>
        {showProfile && (
          <pre className="profile-pre">
            {profileData ? JSON.stringify(profileData, null, 2) : 'Loading...'}
          </pre>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.2em' }}>
        <div className="toggle-pill">
          <button
            className={`pill-option ${selectedView === 'videos' ? 'active' : ''}`}
            onClick={() => setSelectedView('videos')}
          >
            My Videos
          </button>
          <button
            className={`pill-option ${selectedView === 'campaigns' ? 'active' : ''}`}
            onClick={() => setSelectedView('campaigns')}
          >
            Campaigns
          </button>
        </div>
      </div>

      {selectedView === 'videos' ? (
        Array.isArray(videos) && videos.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', fontSize: '1.2em' }}>No videos found.</p>
        ) : (
          <VideoCards videos={videos} />
        )
      ) : (
        <Campaigns
          campaigns={campaigns}
          loading={campaignsLoading}
          error={campaignsError}
          expandedCampaign={expandedCampaign}
          setExpandedCampaign={setExpandedCampaign}
        />
      )}
    </div>
  );
}