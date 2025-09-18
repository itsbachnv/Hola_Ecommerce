import axios from 'axios'
const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`,
  headers: {
    "ngrok-skip-browser-warning": "true",
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

export default axiosInstance