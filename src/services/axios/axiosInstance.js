import { supabase } from '@/lib/supabase/client';
import axios from 'axios';

const EXTERNAL_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const axiosInstance = axios.create({
  withCredentials: true,
});

// Use baseURL only for external API calls (not /api/* routes)
axiosInstance.interceptors.request.use(async (config) => {
  // Internal Next.js API routes start with /api/
  if (!config.url?.startsWith('/api/')) {
    config.baseURL = EXTERNAL_API_URL;
  }
  return config;
});

// Adding authorization header to axios instance if session exists
axiosInstance.interceptors.request.use(async (config) => {
  // Only run in browser context (not during SSR/build)
  if (typeof window !== 'undefined') {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  }

  return config;
});

axiosInstance.interceptors.response.use((response) =>
  response.data.data ? response.data.data : response.data,
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject({
      status: error.response?.status,
      data: error.response?.data || error.message,
    });
  },
);

export default axiosInstance;
