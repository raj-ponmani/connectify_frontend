import React from 'react';

function ClearTokens() {
    const handleClearTokens = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login'; 
    };

    return (
        <button onClick={handleClearTokens}>Clear Tokens and Logout</button>
    );
}

export default ClearTokens;
