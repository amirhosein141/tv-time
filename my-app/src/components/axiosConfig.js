// axiosConfig.js

import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://amirghost14.pythonanywhere.com/api/',
    timeout: 5000,
    headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`,
    }
});

export default axiosInstance;
