import { API_BASE } from '../apiBase';

export function getTokenFromUrl() {
  try {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('access_token');
    if (token) {
      // Remove token from URL for cleanliness
      url.searchParams.delete('access_token');
      window.history.replaceState({}, document.title, url.pathname + url.search);
    }
    return token;
  } catch (e) {
    return null;
  }
}

export function getStoredToken() {
  try {
    return sessionStorage.getItem('access_token');
  } catch (e) {
    return null;
  }
}

export function saveToken(token) {
  try {
    if (token) sessionStorage.setItem('access_token', token);
  } catch (e) {
    // ignore
  }
}

export function clearToken() {
  try {
    sessionStorage.removeItem('access_token');
  } catch (e) {
    // ignore
  }
}

export function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function logout(accessToken) {
  clearToken();
  try {
    await fetch(`${API_BASE}/api/v1/logout`, {
      method: 'GET',
      headers: authHeaders(accessToken),
    });
  } catch (e) {
    // ignore network errors during logout
  }
}
