import axios from 'axios';
import { env } from 'process';

const apiClientHttp = axios.create({
    baseURL: env.API_BASE_URL,
    timeout: 1000 * 60 * 5, // 5 minutes//
    headers: {
        'Content-Type': 'application/json',
        'Acesss-Control-Allow-Origin': '*',
    },
});

export default apiClientHttp;
