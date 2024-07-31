import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ReceivedRequests from './components/ReceivedRequests';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Chat from './components/Chat';
import ClearToken from './components/ClearToken';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from './AuthContext'; // Import AuthProvider

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/clear-token" element={<ClearToken />} />

                {/* Protected routes */}
                <Route 
                    element={
                        <AuthProvider>
                            <ProtectedRoute />
                        </AuthProvider>
                    }
                >
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/requests" element={<ReceivedRequests />} />
                    <Route path="/chat" element={<Chat />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
