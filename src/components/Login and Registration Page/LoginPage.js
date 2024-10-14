import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import './AuthForm.css';  // Correct path


const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
    try {
        const response = await axios.post('http://localhost:8080/login', { email, password });
        const { jwt, userId } = response.data;
        localStorage.setItem('token', jwt);
        localStorage.setItem('userId', userId);
        toast.success('Login successful!');
        navigate(`/${userId}/home`);
    } catch (error) {
        toast.error('Login failed! Please check your credentials and try again.');
    }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Login</button>
                </form>
                <p>Don't have an account? <Link to="/register">Register here</Link>.</p>
            </div>
        </div>
    );
};

export default LoginPage;
