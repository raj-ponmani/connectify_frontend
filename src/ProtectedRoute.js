import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from './AuthContext';

const ProtectedRoute = () => {
    const { accessToken } = useContext(AuthContext);

    return accessToken ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
