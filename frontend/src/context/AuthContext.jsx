import React, { createContext, useContext, useState, useEffect } from 'react';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        token: null,
        username: null,
        userId: null,
        role: null,
        subscriptionPlan: null,
        isAuthenticated: false,
    });
    useEffect(() => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        const userId = localStorage.getItem('userId');
        const role = localStorage.getItem('role') || 'User';
        const subscriptionPlan = localStorage.getItem('subscriptionPlan') || 'Free';
        if (token && username && userId) {
            setAuthState({ token, username, userId: parseInt(userId, 10), role, subscriptionPlan, isAuthenticated: true });
        }
    }, []);
    const login = (token, username, userId, role, subscriptionPlan) => {
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        localStorage.setItem('userId', userId.toString());
        localStorage.setItem('role', role);
        localStorage.setItem('subscriptionPlan', subscriptionPlan);
        setAuthState({ token, username, userId, role, subscriptionPlan, isAuthenticated: true });
    };
    const updateSubscription = (newPlan) => {
        localStorage.setItem('subscriptionPlan', newPlan);
        setAuthState(prev => ({ ...prev, subscriptionPlan: newPlan }));
    };
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        localStorage.removeItem('subscriptionPlan');
        setAuthState({ token: null, username: null, userId: null, role: null, subscriptionPlan: null, isAuthenticated: false });
    };
    return (<AuthContext.Provider value={{ ...authState, login, updateSubscription, logout }}>
      {children}
    </AuthContext.Provider>);
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used within AuthProvider");
    return context;
};
