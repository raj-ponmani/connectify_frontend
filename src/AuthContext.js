import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios'; // Import axios

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(localStorage.getItem('access_token') || null);
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refresh_token') || null);

    useEffect(() => {
        localStorage.setItem('access_token', accessToken);
    }, [accessToken]);

    useEffect(() => {
        localStorage.setItem('refresh_token', refreshToken);
    }, [refreshToken]);

    useEffect(() => {
        const fetchUser = async () => {
            if (accessToken) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/`, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });
                    setUser(response.data.current_user);
                } catch (error) {
                    console.error('Failed to fetch user data', error);
                }
            }
        };
        fetchUser();
    }, [accessToken]); // Fetch user data when accessToken changes

    const login = async (userCredentials) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/token/`, userCredentials);
            setAccessToken(response.data.access);
            setRefreshToken(response.data.refresh);

            const userResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/`, {
                headers: { Authorization: `Bearer ${response.data.access}` }
            });
            setUser(userResponse.data.current_user);
        } catch (error) {
            if (error.response && error.response.status === 401 && refreshToken) {
                try {
                    const refreshResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/token/refresh/`, {
                        refresh: refreshToken
                    });
                    setAccessToken(refreshResponse.data.access);

                    const retryUserResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/`, {
                        headers: { Authorization: `Bearer ${refreshResponse.data.access}` }
                    });
                    setUser(retryUserResponse.data.current_user);
                } catch (refreshError) {
                    console.error('Failed to refresh access token', refreshError);
                    logout(); // Log out the user if refresh token fails
                    throw refreshError;
                }
            } else {
                throw error; // Raise other errors
            }
        }
    };

    const logout = () => {
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ accessToken, refreshToken, user, setAccessToken, setRefreshToken, setUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider };
export default AuthContext;
