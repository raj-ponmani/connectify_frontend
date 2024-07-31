// src/pages/UserDetails.js
import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../api';
import AuthContext from '../AuthContext';
import './index.css'

function Users() {
    const api = useApi();
    const [users, setUsers] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const { accessToken, user, logout } = useContext(AuthContext);

    useEffect(() => {
        const fetchUsers = async () => {
            if (accessToken && user) {
                try {
                    const response = await api.get('/api/users/');
                    setUsers(response.data.users);
                } catch (error) {
                    console.error('Failed to fetch users', error);
                }
            }
        };

        const fetchSentRequests = async () => {
            if (accessToken && user) {
                try {
                    const response = await api.get('/api/connection-requests/');
                    setSentRequests(response.data.map(request => request.connection_receiver));
                } catch (error) {
                    console.error('Failed to fetch sent connection requests', error);
                }
            }
        };

        fetchUsers();
        fetchSentRequests();
    }, [api, accessToken, user]);

    const sendConnectionRequest = async (userId) => {
        if (!user) {
            console.error('User is not defined');
            return;
        }

        try {
            await api.post('/api/connection-requests/', {
                connection_receiver: userId
            });

            setSentRequests(prevSentRequests => [...prevSentRequests, userId]);
        } catch (error) {
            console.error('Failed to send connection request', error);
        }
    };

    return (
        <div className="user-details-container">
            <h1>User Details</h1>
            {user ? (
                <div className="current-user">
                    <h2>Current User</h2>
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>First Name:</strong> {user.first_name}</p>
                    <p><strong>Last Name:</strong> {user.last_name}</p>
                </div>
            ) : (
                <p>Loading user details...</p>
            )}

            <h2>Users List</h2>
            {users.length > 0 ? (
                <ul className="user-list-container">
                    {users.map(u => (
                        <li className="user-list" key={u.id}>
                            <span className="user-name">{u.username}</span>
                            {!sentRequests.includes(u.id) && (
                                <button className="connection-request-btn" onClick={() => sendConnectionRequest(u.id)}>
                                    Send Connection Request
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No users available at the moment.</p>
            )}

            <div className="links">
                <Link to="/requests" className="link">View Received Requests</Link>
                <Link to="/chat" className="link">View Chats</Link>
            </div>
            <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
    );
}

export default Users;
