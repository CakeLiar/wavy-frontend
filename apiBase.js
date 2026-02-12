// Centralized API base URL for the frontend
// Use local API if LOCAL_DEPLOYMNT is true, otherwise use remote
export const API_BASE = process.env.NEXT_PUBLIC_LOCAL_DEPLOYMNT === 'true'
	? 'http://127.0.0.1:3000'
	: 'https://wavy.dev.wavelink.co';