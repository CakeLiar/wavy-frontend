import { useRouter } from 'next/router';
import { API_BASE } from '../apiBase';

export default function Login() {
  // API_BASE is now imported from a centralized file
  const router = useRouter();

  const handleTikTokLogin = () => {
    const redirectUri = encodeURIComponent(window.location.origin + '/callback');
    window.location.href = `${API_BASE}/login/tiktok?redirect_uri=${redirectUri}`;
  };

  return (
    <div>
      <h1>Login</h1>
      <button onClick={handleTikTokLogin}>Sign in with TikTok</button>
    </div>
  );
}