import axios from 'axios';

// En desarrollo local apunta a http://localhost:3001
// En producción (Vercel) utiliza la URL del backend en Render configurada en VITE_API_URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;
