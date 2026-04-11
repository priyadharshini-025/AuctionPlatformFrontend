import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
    baseURL: API_URL,
});

// Session Management
let isHandling401 = false;
let expirationTimer = null;
let expirationWarningTimer = null;
let sessionExpirationCallback = null;

// Get token expiration time in seconds
export const getTokenExpirationType = () => {
    try {
        const token = sessionStorage.getItem('token');
        if (!token) return null;
        
        const decoded = jwtDecode(token);
        const expiresAt = decoded.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        const timeUntilExpiration = expiresAt - now;
        
        return {
            expiresAt,
            timeUntilExpiration,
            isExpired: timeUntilExpiration <= 0,
        };
    } catch (err) {
        console.error('Error decoding token:', err);
        return null;
    }
};

// Setup session expiration timer
export const setupSessionExpirationTimer = (onExpiration) => {
    // Clear existing timers
    clearSessionExpirationTimer();
    
    sessionExpirationCallback = onExpiration;
    
    const tokenInfo = getTokenExpirationType();
    if (!tokenInfo || tokenInfo.isExpired) {
        return;
    }

    const timeUntilExpiration = tokenInfo.timeUntilExpiration;
    
    // Show warning 5 minutes before expiration
    const warningTime = Math.max(0, timeUntilExpiration - 5 * 60 * 1000);
    if (warningTime > 0) {
        expirationWarningTimer = setTimeout(() => {
            if (sessionExpirationCallback) {
                sessionExpirationCallback({
                    type: 'warning',
                    message: 'Your session will expire in 5 minutes',
                });
            }
        }, warningTime);
    }
    
    // Handle actual expiration
    expirationTimer = setTimeout(() => {
        handleSessionExpiration();
    }, timeUntilExpiration);
};

// Clear session expiration timers
export const clearSessionExpirationTimer = () => {
    if (expirationTimer) {
        clearTimeout(expirationTimer);
        expirationTimer = null;
    }
    if (expirationWarningTimer) {
        clearTimeout(expirationWarningTimer);
        expirationWarningTimer = null;
    }
};

// Handle session expiration
const handleSessionExpiration = () => {
    if (!isHandling401) {
        isHandling401 = true;
        clearSessionExpirationTimer();
        sessionStorage.removeItem('token');
        alert('Session expired. Please log in again.');
        window.location.href = '/login';
    }
};

// Add token to request headers
api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => {
        // Reset the flag on successful response
        isHandling401 = false;
        return response;
    },
    (error) => {
        if (error.response?.status === 401 && !isHandling401) {
            handleSessionExpiration();
        }
        return Promise.reject(error);
    }
);

// Auth Services
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
};

// Product Services
export const productAPI = {
    getAll: () => api.get('/products'),
    getById: (id) => api.get(`/products/${id}`),
    create: (productData) => {
        return api.post('/products', productData);
    },
    update: (id, productData) => api.put(`/products/${id}`, productData),
    delete: (id) => api.delete(`/products/${id}`),
    getByUser: () => api.get('/products/seller/products'),
};

// Auction Services
export const auctionAPI = {
    getAll: () => api.get('/auctions'),
    getById: (id) => api.get(`/auctions/${id}`),
    create: (auctionData) => {
        const config = {};
        if (auctionData instanceof FormData) {
            config.headers = { 'Content-Type': 'multipart/form-data' };
        }
        return api.post('/auctions', auctionData, config);
    },
    update: (id, auctionData) => {
        const config = {};
        if (auctionData instanceof FormData) {
            config.headers = { 'Content-Type': 'multipart/form-data' };
        }
        return api.put(`/auctions/${id}`, auctionData, config);
    },
    delete: (id) => api.delete(`/auctions/${id}`),
    getByUser: () => api.get('/auctions/seller/auctions'),
    getActive: () => api.get('/auctions'),
};

// Bid Services
export const bidAPI = {
    placeBid: (bidData) => api.post('/bids', bidData),
    getBidHistory: () => api.get('/bids/history'),
    getAuctionBids: (auctionId) => api.get(`/bids/auction/${auctionId}`),
};

// Category Services
export const categoryAPI = {
    getAll: () => api.get('/categories'),
    getById: (id) => api.get(`/categories/${id}`),
    create: (categoryData) => api.post('/categories', categoryData),
    update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
    delete: (id) => api.delete(`/categories/${id}`),
};

// Review Services
export const reviewAPI = {
    create: (reviewData) => api.post('/reviews', reviewData),
    getSellerReviews: (sellerId) => api.get(`/reviews/seller/${sellerId}`),
};

// User Services
export const userAPI = {
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (userData) => api.put('/auth/profile', userData),
};

export default api;