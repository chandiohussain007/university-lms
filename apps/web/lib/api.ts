import axios from 'axios';

// Create an Axios instance
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', // NestJS API (PORT in apps/api/.env)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add Headers
api.interceptors.request.use((config) => {
    // 1. Inject Tenant ID (Faculty) — must be the faculty UUID from login
    // so it matches the JWT claim validated by the backend TenantGuard.
    const facultyId = typeof window !== 'undefined' ? localStorage.getItem('facultyId') : null;
    if (facultyId) {
        config.headers['x-faculty-id'] = facultyId;
    }

    // 2. Inject Auth Token
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
});

export default api;
