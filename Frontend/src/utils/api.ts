import axios from 'axios';
import https from 'https';

const agent = new https.Agent({ rejectUnauthorized: false });

// Create a shared axios instance
const api = axios.create({
  httpsAgent: agent,
});

// Interceptor: add ngrok header if request URL is ngrok
api.interceptors.request.use(config => {
  if (typeof config.url === 'string' && config.url.includes('.ngrok-free.app')) {
    config.headers = config.headers || {};
    config.headers['ngrok-skip-browser-warning'] = 'true';
  }
  return config;
});

export default api;
