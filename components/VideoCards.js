import React from 'react';

export default function VideoCards({ videos }) {
  if (!Array.isArray(videos)) return null;
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadges = (video) => {
    const badges = [];
    if (video?.analyzedAt) badges.push('Analyzed');
    if (video?.transcribedAt) badges.push('Transcribed');
    if (Array.isArray(video?.embedding) && video.embedding.length > 0) badges.push('Embedded');
    return badges;
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
