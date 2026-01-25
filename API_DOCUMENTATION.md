# Wavy Backend API Documentation

This document provides an overview of the available API endpoints for interacting with the Wavy Backend. These endpoints are designed to support frontend applications.

---

## Base URL
The base URL for all API requests is:
```
https://abdullah-camailed-superacutely.ngrok-free.dev
```

Fallback is
```
http://127.0.0.1:5000
```

---

## Authentication Endpoints

### 1. Login with TikTok
**Endpoint:**
```
GET /login/tiktok
```
**Description:**
Redirects the user to TikTok's OAuth page for authentication.

### 2. TikTok Callback
**Endpoint:**
```
GET /tiktok/callback
```
**Description:**
Handles the callback from TikTok after user authentication.

**Request Parameters:**
- `code` (query parameter): The authorization code returned by TikTok.

**Response:**
- Redirects to the dashboard or returns an error message.

### 3. Logout
**Endpoint:**
```
GET /logout
```
**Description:**
Clears the user session and logs the user out.

---

## Dashboard Endpoints

### 1. Get User Profile
**Endpoint:**
```
GET /api/v1/profile
```
**Description:**
Fetches the user's dashboard status from Firestore.

**Response:**
- `200 OK`: Returns the user data.
- `401 Unauthorized`: User is not authenticated.
- `404 Not Found`: User dashboard not found.

---

## Jobs Endpoints

### 1. Start Sync Job
**Endpoint:**
```
POST /api/v1/sync
```
**Description:**
Starts a job to fetch TikTok videos and update the dashboard.

**Response:**
- `202 Accepted`: Job started successfully.
- `401 Unauthorized`: User is not authenticated.

### 2. Process Jobs
**Endpoint:**
```
POST /api/v1/process_jobs
```
**Description:**
Manually triggers the processing of pending jobs.

**Response:**
- `200 OK`: Jobs processed successfully.
- `500 Internal Server Error`: Error occurred while processing jobs.

---

## Example Usage

### Fetch User Profile
**Request:**
```javascript
fetch('/api/v1/profile', {
  method: 'GET',
  credentials: 'include',
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### Start Sync Job
**Request:**
```javascript
fetch('/api/v1/sync', {
  method: 'POST',
  credentials: 'include',
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

---

## Notes
- All endpoints require the user to be authenticated unless otherwise specified.
- Use `credentials: 'include'` in fetch requests to include cookies for session management.
- Ensure the backend is running locally or deployed to a server accessible by the frontend.

---

For further assistance, contact the backend team.