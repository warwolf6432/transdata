import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

const Login = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await authService.login(credentials);
            navigate('/home'); // Redirige a /home tras el login
        } catch (error) {
            console.error("Error al iniciar sesión:", error.response?.data || error.message);
            setError(error.message);
        }
    };

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                {error && <p>{error}</p>}
                <input type="text" name="username" placeholder="Usuario" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} required />
                <button type="submit">Iniciar sesión</button>
            </form>
            <p>¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link></p>
        </div>
    );
};

export default Login;