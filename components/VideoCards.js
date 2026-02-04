import React from 'react';

export default function VideoCards({ videos }) {
  if (!Array.isArray(videos)) return null;
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadges = (video) => {
    const isComplete = video?.analyzedAt && video?.transcribedAt && Array.isArray(video?.embedding);
    return isComplete ? ['Analyzed'] : ['Analyzing'];
  };

  const isVideoComplete = (video) => {
    return video?.analyzedAt && video?.transcribedAt && Array.isArray(video?.embedding);
  };

  return (
    <div className="videos-table-container">
      <table className="videos-table">
        <thead>
          <tr>
            <th>Video</th>
            <th>Title</th>
            <th>Status</th>
            <th>Analyzed</th>
            <th>Transcribed</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {videos.map((video, index) => {
            const thumbnail = video?.thumbnailUrl || video?.thumbnail;
            const title = video?.title || video?.name || 'Untitled video';
            const badges = getStatusBadges(video);
            
            return (
              <tr key={index}>
                <td>
                  <div className="video-thumbnail-cell">
                    {thumbnail ? (
                      <img src={thumbnail} alt={title} className="video-thumbnail" />
                    ) : (
                      <div className="video-thumbnail-placeholder" />
                    )}
                  </div>
                </td>
                <td className="video-title-cell">{title}</td>
                <td>
                  <div className="status-badges">
                    {badges.map((badge, i) => (
                      <span key={i} className="status-badge">{badge}</span>
                    ))}
                  </div>
                </td>
                <td className="video-date-cell">{formatDate(video?.analyzedAt)}</td>
                <td className="video-date-cell">{formatDate(video?.transcribedAt)}</td>
                <td className="video-status-indicator">
                  {isVideoComplete(video) ? (
                    <div className="status-complete" title="Complete">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  ) : (
                    <div className="status-loading" title="Processing">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="spinner">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="60" strokeDashoffset="15" fill="none"/>
                      </svg>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
