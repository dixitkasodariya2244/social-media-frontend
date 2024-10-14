import React, { createContext, useContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';

// Create AuthContext
const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (authToken) {
            const decodedUser = jwtDecode(authToken);
            setUser(decodedUser);
        }
    }, [authToken]);

    const login = (token) => {
        localStorage.setItem('authToken', token);
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
        setAuthToken(token);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setAuthToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ authToken, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
