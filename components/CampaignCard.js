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

  return (
    <div className="campaign-card" onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} onKeyDown={(e) => { if (onClick && (e.key === 'Enter' || e.key === ' ')) onClick(); }}>
      <div className="campaign-card-img" style={{ backgroundImage: `url(${imgSrc})` }} />
      <div className="campaign-card-title">{campaign.name || campaign.id || 'Unnamed Campaign'}</div>
    </div>
  );
}
