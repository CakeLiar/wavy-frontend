// Centralized API base URL for the frontend
// Use remote API by default, fallback to local if needed
export const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost'
	? 'https://abdullah-camailed-superacutely.ngrok-free.dev' //'http://127.0.0.1:3000'
	: 'https://abdullah-camailed-superacutely.ngrok-free.dev';



	