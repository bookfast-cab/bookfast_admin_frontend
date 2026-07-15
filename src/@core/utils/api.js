import axios from 'axios';
import getFingerprint from 'src/utils/Fingerprint';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Interceptor setup takki headers baar-baar na likhne padein
api.interceptors.request.use(async(config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const device_id = await getFingerprint()

    config.headers.Authorization = `${token}`;
    config.headers['x-device-id'] = device_id;
    
    return config;
});




export default api;