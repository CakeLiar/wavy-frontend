import React, { useEffect, useState } from 'react';
import { API_BASE } from '../apiBase';
import { useRouter } from 'next/router';
import VideoCards from '../components/VideoCards';
import Campaigns from '../components/Campaigns';
import { getTokenFromUrl, getStoredToken, saveToken, clearToken, authHeaders, logout } from '../utils/auth';

export default function Dashboard() {
  const [selectedView, setSelectedView] = useState('videos');
  const [expandedCampaign, setExpandedCampaign] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [campaignsError, setCampaignsError] = useState(null);
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [pollIntervalMs] = useState(15000);

  useEffect(() => {
    // Print query parameters to the console
    const url = new URL(window.location.href);
    const params = Object.fromEntries(url.searchParams.entries());
    console.log('Dashboard query parameters:', params);

    // Centralized token retrieval: try URL first, then sessionStorage
    let token = getTokenFromUrl();
    if (!token) {
      token = getStoredToken();
    } else {
      saveToken(token);
    }
    setAccessToken(token);

    async function fetchVideos(accessToken) {
      try {
        const response = await fetch(`${API_BASE}/api/v1/videos`, {
          method: 'GET',
          headers: authHeaders(accessToken),
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
        headers: authHeaders(token),
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
      // start polling profile to keep progress live
      const poll = setInterval(() => {
        fetch(`${API_BASE}/api/v1/profile`, {
          method: 'GET',
          headers: authHeaders(token),
          credentials: 'include',
        })
          .then(res => {
            if (res.status === 401) {
              router.push('/login');
              return null;
            }
            return res.json();
          })
          .then(data => {
            if (!data) return;
            setProfileData(data);
            if (data.videos && Array.isArray(data.videos)) {
              setVideos(data.videos);
            }
            // stop polling when all videos are processed
            const tv = Number(data.totalVideos || 0);
            const vp = Number(data.videosProcessed || 0);
            if (tv > 0 && vp >= tv) {
              clearInterval(poll);
            }
          })
          .catch(() => {});
      }, pollIntervalMs);
      // clear on cleanup
      return () => clearInterval(poll);
    } else {
      setLoading(false);
      router.push('/login');
    }
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // derive progress from profileData
  const videosProcessed = Number(profileData?.videosProcessed || 0);
  const totalVideos = Number(profileData?.totalVideos || (Array.isArray(videos) ? videos.length : 0) || 0);
  const percent = totalVideos > 0 ? Math.min(100, Math.ceil((100 * videosProcessed) / totalVideos)) : 0;

  const handleLogout = async () => {
    try {
      await logout(accessToken);
    } finally {
      router.push('/login');
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/sync`, {
        method: 'POST',
        headers: authHeaders(accessToken),
        credentials: 'include',
      });
      if (res.ok) {
        // refresh data
        router.replace(router.asPath);
      } else {
        const text = await res.text().catch(() => '');
        alert('Sync failed: ' + res.status + ' ' + text);
      }
    } catch (e) {
      alert('Sync error');
    } finally {
      setSyncing(false);
    }
  };

  const handleProcess = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/process_jobs`, {
        method: 'POST',
        headers: authHeaders(accessToken),
        credentials: 'include',
      });
      if (res.ok) {
        router.replace(router.asPath);
      } else {
        const text = await res.text().catch(() => '');
        alert('Process failed: ' + res.status + ' ' + text);
      }
    } catch (e) {
      alert('Process error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="page">
      <div className="header-row">
        <h1 className="title">Wavy Creator Dashboard</h1>
        <div className="progress-wrap" title={`${percent}% videos processed`}>
          <svg className="progress-svg" viewBox="0 0 36 36" aria-hidden>
            <path className="progress-bg" d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path
              className="progress-bar"
              strokeDasharray={`${percent}, 100`}
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="progress-text">{percent}%</div>
        </div>
        <div style={{ display: 'flex', gap: '0.6em', alignItems: 'center' }}>
          <button className="minimal-btn" onClick={handleProcess} disabled={processing}>
            {processing ? 'Processing...' : 'Process Data'}
          </button>
          <button className="minimal-btn" onClick={handleSync} disabled={syncing}>
            {syncing ? 'Syncing...' : 'Sync Videos'}
          </button>
          <button className="minimal-btn" onClick={handleLogout}>Logout</button>
        </div>
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