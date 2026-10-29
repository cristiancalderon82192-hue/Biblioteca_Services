import axios from 'axios';

// Si está configurada VITE_API_URL (en Vercel/producción), usa esa URL completa.
// En local o compartido por túnel (ngrok/localtunnel/pinggy), usa ruta relativa ''
// para que el proxy de Vite en vite.config.js reenvíe todo al backend (puerto 3001) sin problemas de CORS ni de IP.
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;
