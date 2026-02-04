import React, { useEffect, useState } from 'react';
import { API_BASE } from '../../apiBase';
import { useRouter } from 'next/router';
import VideoCards from '../../components/VideoCards';
import { getTokenFromUrl, getStoredToken, saveToken, authHeaders, logout } from '../../utils/auth';

export default function CreatorDashboard() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const router = useRouter();
  const [pollIntervalMs] = useState(15000);

  useEffect(() => {
    // Print query parameters to the console
    const url = new URL(window.location.href);
    const params = Object.fromEntries(url.searchParams.entries());
    console.log('Creator Dashboard query parameters:', params);

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

  // Calculate confidence metrics
  const confidence = profileData?.confidence || 68;
  const videosNeededFor90 = profileData?.videosNeededFor90 || 26;

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
        <h1 className="title">Creator Dashboard</h1>
        <div style={{ display: 'flex', gap: '0.6em', alignItems: 'center' }}>
          <button className="minimal-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="data-dashboard">
        <div className="data-card">
          <div className="data-card-circle-large">
            <svg className="progress-svg-large" viewBox="0 0 36 36" aria-hidden>
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
            <div className="data-card-circle-text">{percent}%</div>
          </div>
          <div className="data-card-label">Analysis progress</div>
        </div>

        <div className="data-card">
          <div className="data-card-number">{profileData?.matchedCampaigns || 0}</div>
          <div className="data-card-label">Campaigns you vibe with.</div>
        </div>

        <div className="data-card">
          <div className="data-card-number">{profileData?.applications || 0}</div>
          <div className="data-card-label">Applications</div>
        </div>

        <div className="data-card">
          <div className="data-card-confidence">
            <div className="confidence-percent">{confidence}%</div>
            <div className="confidence-subtitle">Confidence</div>
          </div>
          <div className="data-card-label">Upload {videosNeededFor90} more videos to achieve 90%+ confidence.</div>
        </div>
      </div>

      <div className="view-subtitle-row">
        <div className="view-subtitle">My videos</div>
      </div>

      {Array.isArray(videos) && videos.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888', fontSize: '1.2em' }}>No videos found.</p>
      ) : (
        <VideoCards videos={videos} />
      )}
    </div>
  );
}
