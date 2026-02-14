import React from 'react';

export default function VideoCards({ videos }) {
  if (!Array.isArray(videos)) return null;
  
  const isVideoComplete = (video) => {
    return video?.analyzedAt && video?.transcribedAt && video?.embedding;
  };

  const displayVideos = videos.slice(0, 10);
  const remainingCount = videos.length - 10;

  return (
    <div className="videos-table-container">
      <table className="videos-table">
        <thead>
          <tr>
            <th>Video</th>
            <th>Title</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {displayVideos.map((video, index) => {
            const thumbnail = video?.thumbnailUrl || video?.thumbnail;
            const title = video?.title || video?.name || 'Untitled video';
            const isComplete = isVideoComplete(video);
            
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
                  <div className="status-cell">
                    {isComplete ? (
                      <>
                        <span className="status-badge">Analyzed</span>
                        <svg className="status-tick" width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </>
                    ) : (
                      <span className="status-badge status-badge-analyzing">Analyzing</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {remainingCount > 0 && (
        <div className="videos-more-text">
          and {remainingCount} videos more.
        </div>
      )}
    </div>
  );
}
