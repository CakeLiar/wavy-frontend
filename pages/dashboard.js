import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await fetch('/api/v1/profile', {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setVideos(data.videos || []);
        } else {
          console.error('Failed to fetch videos');
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Videos Dashboard</h1>
      {videos.length === 0 ? (
        <p>No videos found.</p>
      ) : (
        <ul>
          {videos.map((video, index) => (
            <li key={index}>
              <p>Video ID: {video.id}</p>
              <p>Progress: {video.progress}%</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}