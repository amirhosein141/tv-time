// axiosConfig.js

import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://amirghost14.pythonanywhere.com/api/',
    timeout: 5000,
    headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`,
    }
});

export default axiosInstance;
