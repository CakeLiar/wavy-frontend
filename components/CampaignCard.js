import React from 'react';

export default function CampaignCard({ campaign, onClick }) {
  // choose template image 1 or 2 based on campaign id parity when possible
  let idx = 1;
  if (campaign && campaign.id) {
    const n = parseInt(String(campaign.id).replace(/\D/g, ''), 10);
    if (!Number.isNaN(n)) idx = (n % 2) + 1;
  } else {
    idx = Math.random() > 0.5 ? 1 : 2;
  }
  const imgSrc = `/template_images/template_${idx}.jpeg`;

  // Mock data for badges - in real app would come from campaign object
  const creatorsHighFit = Math.floor(Math.random() * 30) + 10;
  const expectedViews = (Math.floor(Math.random() * 500) + 100) * 1000;
  const formatViews = (views) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(0) + 'K';
    return views.toString();
  };

  return (
    <div className="campaign-card" onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} onKeyDown={(e) => { if (onClick && (e.key === 'Enter' || e.key === ' ')) onClick(); }}>
      <div className="campaign-card-img" style={{ backgroundImage: `url(${imgSrc})` }} />
      <div className="campaign-card-title">{campaign.name || campaign.id || 'Unnamed Campaign'}</div>
      <div className="campaign-card-badges">
        <div className="campaign-metric-badge">{creatorsHighFit} creators selected</div>
        <div className="campaign-metric-badge">{formatViews(expectedViews)} expected views</div>
      </div>
    </div>
  );
}
