import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../api';
import AuthContext from '../AuthContext';

function ReceivedRequests() {
    const api = useApi();
    const [receivedRequests, setReceivedRequests] = useState([]);
    const { accessToken, user } = useContext(AuthContext);

    useEffect(() => {
        const fetchReceivedRequests = async () => {
            if (accessToken && user) {
                try {
                    const response = await api.get('/api/connection-requests/');
                    setReceivedRequests(response.data.filter(request => request.receiver.id === user.id && request.status === 'pending'));
                } catch (error) {
                    console.error('Failed to fetch received connection requests', error);
                }
            }
        };

        fetchReceivedRequests();
    }, [api, accessToken, user]);

    const handleRequestResponse = async (requestId, status) => {
        try {
            await api.patch(`/api/connection-requests/${requestId}/`, { status });
            setReceivedRequests(prevReceivedRequests => prevReceivedRequests.filter(request => request.id !== requestId));
        } catch (error) {
            console.error('Failed to update connection request', error);
        }
    };

    return (
        <div className="requests-container">
            <h1>Received Connection Requests</h1>
            {receivedRequests.length > 0 ? (
                <ul className="request-list">
                    {receivedRequests.map(request => (
                        <li className="request-item" key={request.id}>
                            <span className="request-sender">{request.sender.username}</span>
                            <div className="request-buttons">
                                <button className="accept-btn" onClick={() => handleRequestResponse(request.id, 'accepted')}>
                                    Accept
                                </button>
                                <button className="reject-btn" onClick={() => handleRequestResponse(request.id, 'rejected')}>
                                    Reject
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="no-requests">You don't have any connection requests right now.</p>
            )}

            <div className="links">
                <Link to="/" className="link">Back to User Details</Link>
                <Link to="/chat" className="link">View Chats</Link>
            </div>
        </div>
    );
}

export default ReceivedRequests;
