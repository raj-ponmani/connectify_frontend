import axios from 'axios';
import { useContext } from 'react';
import AuthContext from './AuthContext';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
    baseURL: API_URL,
});

const useApi = () => {
    const { accessToken, refreshToken, setAccessToken, logout } = useContext(AuthContext);

    api.interceptors.request.use(
        config => {
            if (accessToken) {
                config.headers['Authorization'] = `Bearer ${accessToken}`;
            }
            return config;
        },
        error => Promise.reject(error)
    );

    api.interceptors.response.use(
        response => response,
        async error => {
            const originalRequest = error.config;
            if (error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    const response = await axios.post(`${API_URL}/api/token/refresh/`, { refresh: refreshToken });
                    const newAccessToken = response.data.access;
                    setAccessToken(newAccessToken);
                    api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    console.error('Token refresh failed', refreshError);
                    logout();
                    window.location.href = '/login';
                }
            }
            return Promise.reject(error);
        }
    );

    return api;
};

export default useApi;
