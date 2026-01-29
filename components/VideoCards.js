import React from 'react';
import VideoCard from './VideoCard';

export default function VideoCards({ videos }) {
  if (!Array.isArray(videos)) return null;
  return (
    <div className="video-cards">
      {videos.map((video, index) => (
        <VideoCard key={index} video={video} />
      ))}
    </div>
  );
}
