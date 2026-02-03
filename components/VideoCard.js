import React from 'react';

export default function VideoCard({ video }) {
  const thumbnail = video?.thumbnailUrl || video?.thumbnail;
  const title = video?.title || video?.name || 'Untitled video';

  return (
    <div className="video-card">
      <div
        className="video-card-bg"
        style={{ backgroundImage: thumbnail ? `url(${thumbnail})` : 'none' }}
      />
      <div className="video-card-content">
      <h3 className="video-title">{title}</h3>
        <div style={{ display: 'flex', gap: '0.5em', flexWrap: 'wrap', marginTop: '0.5em' }}>
          {video?.analyzedAt && <span className="status-pill">Analyzed</span>}
          {video?.transcribedAt && <span className="status-pill">Transcribed</span>}
          {Array.isArray(video?.embedding) && video.embedding.length > 0 && (
            <span className="status-pill">Embedded</span>
          )}
        </div>
      </div>
    </div>
  );
}
