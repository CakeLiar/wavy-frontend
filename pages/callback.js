// This page is used as a callback after TikTok login to create a session with the backend using the access_token
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { API_BASE } from '../apiBase';

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const url = new URL(window.location.href);
    const accessToken = url.searchParams.get('access_token');
    const redirectUri = url.searchParams.get('redirect_uri') || '/dashboard';

    if (accessToken) {
      // Call backend to create session using access_token
      fetch(`${API_BASE}/api/v1/login-with-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ access_token: accessToken }),
        credentials: 'include',
      })
        .then(res => {
          if (res.ok) {
            // Redirect to dashboard or provided redirect_uri
            router.replace(redirectUri);
          } else {
            alert('Failed to create session with backend: ' + res.statusText);
          }
        })
        .catch((e) => {
          alert('Failed to create session with backend: ' + e.message);
        });
    } else {
      alert('No access token found in callback URL');
    }
  }, [router]);

  return <div>Processing login...</div>;
}
