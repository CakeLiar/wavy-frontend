import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getTokenFromUrl, getStoredToken, saveToken, logout } from '../../../utils/auth';

export default function CreatorCampaigns() {
  const [accessToken, setAccessToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
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

  // Mock campaign data with vibe rankings and special badges
  const campaigns = [
    {
      id: 1,
      name: 'Summer Wellness Challenge',
      description: 'Promote healthy living with engaging content',
      vibeScore: 95,
      badges: ['Vibe fit', 'Likely to go viral']
    },
    {
      id: 2,
      name: 'Tech Gadget Launch',
      description: 'Showcase the latest innovation in tech',
      vibeScore: 88,
      badges: ['Audience favorite']
    },
    {
      id: 3,
      name: 'Fashion Forward Fall',
      description: 'Trendsetting autumn fashion collection',
      vibeScore: 82,
      badges: ['Vibe fit']
    },
    {
      id: 4,
      name: 'Fitness Transformation',
      description: '30-day journey to a healthier you',
      vibeScore: 78,
      badges: ['Likely to go viral', 'Audience favorite']
    },
    {
      id: 5,
      name: 'Sustainable Living',
      description: 'Eco-friendly products for conscious consumers',
      vibeScore: 72,
      badges: []
    },
    {
      id: 6,
      name: 'Gaming Community Build',
      description: 'Connect with gamers worldwide',
      vibeScore: 68,
      badges: ['Audience favorite']
    }
  ];

  const getBadgeClass = (badge) => {
    if (badge === 'Likely to go viral') return 'campaign-badge-viral';
    if (badge === 'Vibe fit') return 'campaign-badge-vibe';
    if (badge === 'Audience favorite') return 'campaign-badge-audience';
    return 'campaign-badge';
  };

  return (
    <div className="page">
      <Head>
        <title>Campaigns - Wavy</title>
        <link rel="icon" href="/template_images/favicon.ico" />
      </Head>
      <div className="header-row">
        <h1 className="title">
          <img src="/template_images/logo_large.svg" alt="Wavy Logo" className="dashboard-logo" />
          <span style={{ cursor: 'pointer' }} onClick={() => router.push('/creator/dashboard')}>Creator Dashboard</span>
          <span style={{ color: '#666', margin: '0 0.3em' }}>/</span>
          <span>Campaigns</span>
        </h1>
        <div style={{ display: 'flex', gap: '0.6em', alignItems: 'center' }}>
          <button className="minimal-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="view-subtitle-row">
        <div className="view-subtitle">Campaigns you vibe with</div>
      </div>

      <div className="creator-campaigns-list">
        {campaigns.map((campaign) => {
          const idx = (campaign.id % 2) + 1;
          const imgSrc = `/template_images/template_${idx}.jpeg`;
          
          return (
            <div key={campaign.id} className="creator-campaign-card">
              <div className="creator-campaign-left">
                <div className="creator-campaign-img" style={{ backgroundImage: `url(${imgSrc})` }} />
                <div className="creator-campaign-info">
                  <div className="creator-campaign-header">
                    <h3 className="creator-campaign-title">{campaign.name}</h3>
                    <div className="creator-campaign-vibe">
                      <span className="vibe-score">{campaign.vibeScore}%</span>
                    </div>
                  </div>
                  <p className="creator-campaign-description">{campaign.description}</p>
                  {campaign.badges.length > 0 && (
                    <div className="campaign-badges-container">
                      {campaign.badges.map((badge, idx) => (
                        <span key={idx} className={getBadgeClass(badge)}>{badge}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button className="campaign-apply-btn">Apply</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
