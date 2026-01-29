import React, { useEffect, useState } from 'react';

export default function VideoCard({ video }) {
  const [thumbnail, setThumbnail] = useState(null);
  const [title, setTitle] = useState(video?.title || video?.name || 'Untitled video');

  useEffect(() => {
    let isMounted = true;

    async function fetchThumbnail() {
      if (video && video.tiktokId && video.userId) {
        const videoUrl = `https://www.tiktok.com/@${video.userId}/video/${video.tiktokId}`;
        const oembedEndpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`;
        try {
          const res = await fetch(oembedEndpoint);
          if (res.ok) {
            const data = await res.json();
            if (isMounted) {
              if (data.thumbnail_url) setThumbnail(data.thumbnail_url);
              if (data.title) setTitle(data.title);
            }
          }
        } catch (e) {
            
        }
      }
    }

    fetchThumbnail();
    return () => {
      isMounted = false;
    };
  }, [video?.tiktokId, video?.username]);

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
