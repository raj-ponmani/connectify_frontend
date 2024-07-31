import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

function Register() {
    const [username, setUsername] = useState('');
    const [first_name, setFirstname] = useState('');
    const [last_name, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!username) newErrors.username = "Username is required";
        if (!first_name) newErrors.first_name = "First name is required";
        if (!last_name) newErrors.last_name = "Last name is required";
        if (!email) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";
        if (!password) newErrors.password = "Password is required";
        else if (password.length < 6) newErrors.password = "Password must be at least 6 characters long";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const user = { username, first_name, last_name, email, password };
        console.log('userrrr', user);
        try {
            await axios.post(`${API_URL}/api/create-user/`, user); // Use the configured api instance
            // Optionally, handle successful registration (e.g., redirect or show a message)
            console.log("success", user);
        } catch (error) {
            if (error.response && error.response.data) {
                setErrors(error.response.data);
            } else {
                setErrors({ non_field_errors: 'Something went wrong. Please try again later.' });
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className={errors.username ? 'input-error' : ''}
                />
                {errors.username && <span className="error-message">{errors.username}</span>}
            </div>
            <div className="form-group">
                <input
                    type="text"
                    value={first_name}
                    onChange={(e) => setFirstname(e.target.value)}
                    placeholder="First Name"
                    className={errors.first_name ? 'input-error' : ''}
                />
                {errors.first_name && <span className="error-message">{errors.first_name}</span>}
            </div>
            <div className="form-group">
                <input
                    type="text"
                    value={last_name}
                    onChange={(e) => setLastname(e.target.value)}
                    placeholder="Last Name"
                    className={errors.last_name ? 'input-error' : ''}
                />
                {errors.last_name && <span className="error-message">{errors.last_name}</span>}
            </div>
            <div className="form-group">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className={errors.email ? 'input-error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            <div className="form-group">
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className={errors.password ? 'input-error' : ''}
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            {errors.non_field_errors && <span className="error-message">{errors.non_field_errors}</span>}
            <button type="submit" className="submit-button">Register</button>
        </form>
    );    
}

export default Register;
