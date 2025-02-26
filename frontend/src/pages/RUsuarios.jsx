import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const RUsuarios = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await authService.register(credentials);
            navigate('/login'); // Redirige al login tras el registro
        } catch (error) {
            console.error("Error al registrar usuario:", error.response?.data || error.message);
            setError(error.message); // Muestra el mensaje de error al usuario
        }
    };

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <p>{error}</p>}
            <input type="text" name="username" placeholder="Usuario" onChange={handleChange} required />
            <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} required />
            <button type="submit">Registrarse</button>
        </form>
    );
};

export default RUsuarios;