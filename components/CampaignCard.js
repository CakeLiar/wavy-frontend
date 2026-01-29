import React from 'react';

export default function CampaignCard({ campaign, expanded, onToggle }) {
  return (
    <div
      className={`campaign-card${expanded ? ' expanded' : ''}`}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => { if (e.key === 'Enter') onToggle(); }}
    >
      <div className="campaign-title">{campaign.name || campaign.id || 'Unnamed Campaign'}</div>
      {expanded && (
        <div className="campaign-details">
          {campaign.description ? campaign.description : 'No description.'}
        </div>
      )}
    </div>
  );
}
