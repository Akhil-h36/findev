// src/api/auth.js
import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({ baseURL: BASE })

// Attach JWT from localStorage on every request
    api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token')
    const isAuthRoute = config.url?.includes('/auth/login') || 
                        config.url?.includes('/auth/register') ||
                        config.url?.includes('/auth/verify-otp') ||
                        config.url?.includes('/auth/request-otp')
    
    if (token && !isAuthRoute) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
    })

/**
 * POST /auth/register/
 * { username, password, phone_number, tech_stack_data, github_url, years_experience }
 */
export const register = (data) => api.post('/auth/register/', data)


export const requestOTP = (data) => api.post('/auth/request-otp/', data)

/**
 * POST /auth/verify-otp/
 * { phone_number, code }
 */
export const verifyOTP = (data) => api.post('/auth/verify-otp/', data)

/**
 * POST /auth/resend-otp/
 * { phone_number }
 */
export const resendOTP = (data) => api.post('/auth/resend-otp/', data)

/**
 * POST /auth/login/
 * { username, password }
 */
export const login = (data) => api.post('/auth/login/', data)


export const updateTechStack = (data) => api.patch('/auth/update-tech-stack/', data)


export const uploadPhotos = (formData) => api.post('/auth/upload-photos/', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});



export default api