import React from 'react';
import CampaignCard from './CampaignCard';

export default function Campaigns({ campaigns, loading, error, expandedCampaign, setExpandedCampaign }) {
  if (loading) return <p className="center-muted">Loading campaigns...</p>;
  if (error) return <p className="center-muted" style={{ color: '#fff' }}>{error}</p>;
  if (!Array.isArray(campaigns) || campaigns.length === 0) return <p className="center-muted">No campaigns found.</p>;

  return (
    <div className="campaigns-list">
      {campaigns.map((campaign, idx) => (
        <CampaignCard
          key={campaign.id || idx}
          campaign={campaign}
          expanded={expandedCampaign === idx}
          onToggle={() => setExpandedCampaign(expandedCampaign === idx ? null : idx)}
        />
      ))}
    </div>
  );
}
