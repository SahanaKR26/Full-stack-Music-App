export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5292';

export const fetchWithAuth = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });
    return response;
};

// Online song fetch/search disabled for now
