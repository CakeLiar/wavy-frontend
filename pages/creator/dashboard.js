import React, { useEffect, useState } from 'react';
import Head from 'next/head';
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
          console.log('Videos data fetched:', data);
          console.log('Videos array:', data.videos);
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

  // Calculate progress from local videos data
  const analyzedVideos = Array.isArray(videos) ? videos.filter(v => v?.analyzedAt && v?.transcribedAt && v?.embedding).length : 0;
  const totalVideos = Array.isArray(videos) ? videos.length : 0;
  const percent = totalVideos > 0 ? Math.round((analyzedVideos / totalVideos) * 100) : 0;

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
      <Head>
        <title>Creator Dashboard - Wavy</title>
        <link rel="icon" href="/template_images/favicon.ico" />
      </Head>
      <div className="header-row">
        <h1 className="title">
          <img src="/template_images/logo_large.svg" alt="Wavy Logo" className="dashboard-logo" />
          Creator Dashboard
        </h1>
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

        <div className="data-card" onClick={() => router.push('/creator/dashboard/campaigns')} style={{ cursor: 'pointer' }}>
          <div className="data-card-number">{profileData?.matchedCampaigns || 6}</div>
          <div className="data-card-label-clickable">
            <span className="underlined-text">Campaigns you vibe with.</span>
            <svg className="arrow-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 8l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div className="data-card">
          <div className="data-card-number">{profileData?.applications || 0}</div>
          <div className="data-card-label">Applications</div>
        </div>

        <div className="data-card">
          <div className="data-card-number">{confidence}%</div>
          <div className="data-card-label-with-icon">
            <span>Confidence</span>
            <div className="info-icon-wrapper">
              <svg className="info-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 7v4M8 5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div className="info-tooltip">Upload {videosNeededFor90} more videos to achieve at least 90% confidence.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="view-subtitle-row">
        <div className="view-subtitle">My videos</div>
      </div>

      {Array.isArray(videos) && videos.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888', fontSize: '0.8em' }}>No videos found.</p>
      ) : (
        <VideoCards videos={videos} />
      )}
    </div>
  );
}
