import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth'; // Ajusta la URL si es necesario

const register = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/register`, credentials);
        return response.data;
    } catch (error) {
        throw error.response.data; // Re-lanza el error del backend
    }
};

const login = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/login`, credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        throw error.response.data; // Re-lanza el error del backend
    }
};

const logout = () => {
    localStorage.removeItem('token');
};

const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

export default {
    register,
    login,
    logout,
    isAuthenticated,
};