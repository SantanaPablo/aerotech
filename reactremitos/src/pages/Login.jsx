import React, { useState } from 'react';
// Asumimos que esta función viene de la API del backend
// La URL base de la API se toma del archivo .env a través de Vite
const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * @typedef {Object} LoginProps
 * @property {(token: string) => void} handleAuthSuccess - Función para manejar el éxito de la autenticación.
 */

/**
 * Componente de formulario de inicio de sesión.
 * Recrea la UI y la lógica de la página Login de Razor Pages, 
 * pero interactuando con el controlador AuthController de la API.
 * * @param {LoginProps} props
 * @returns {JSX.Element}
 */
export default function Login({ handleAuthSuccess }) {
    const [legajo, setLegajo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Maneja el envío del formulario.
     * @param {React.FormEvent} e - Evento del formulario.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const loginUrl = `${API_BASE_URL}/api/Auth/login`;

        try {
            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ Legajo: legajo, Contrasena: contrasena }),
            });

            if (!response.ok) {
                // El backend devuelve 401 Unauthorized con un mensaje de error
                const errorText = await response.text();
                throw new Error(errorText || 'Error de inicio de sesión');
            }

            const data = await response.json();
            
            // Llama a la función de éxito para guardar el token
            handleAuthSuccess(data.token); 

        } catch (err) {
            console.error('Login error:', err);
            // Mostrar el mensaje de error del backend o uno genérico
            setError(err.message.includes('Usuario o contraseña') ? err.message : 'Error de conexión o credenciales.');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Alterna la visibilidad de la contraseña.
     */
    const togglePasswordVisibility = () => {
        setIsPasswordVisible(prev => !prev);
    };

    // Estilos CSS integrados del Razor Page (simplificados y adaptados a React)
    const loginStyles = {
        body: {
            backgroundColor: '#2c3e50',
            color: '#ecf0f1',
            fontFamily: 'sans-serif',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        loginCard: {
            backgroundColor: 'rgba(44, 62, 80, 0.9)',
            border: '1px solid #34495e',
            borderRadius: '1rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            maxWidth: '420px',
            width: '100%',
            padding: '2.5rem',
        },
        formControl: {
            backgroundColor: '#34495e',
            border: '1px solid #4a647d',
            color: '#ecf0f1',
        },
        inputGroupText: {
            backgroundColor: '#34495e',
            border: '1px solid #4a647d',
            color: '#95a5a6',
        },
        btnPrimary: {
            backgroundColor: '#3498db',
            borderColor: '#3498db',
        },
    };

    return (
        <div style={loginStyles.body}>
            {/* Contenedor principal para centrar la tarjeta, usando clases de Bootstrap */}
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-10 col-md-8 col-lg-6">
                        <div style={loginStyles.loginCard} className="text-center mx-auto">
                            <span className="h1" style={{ color: '#3498db' }}>✈️</span>
                            <h5 className="card-title mt-2 text-white">Sistema de Remitos</h5>
                            <p className="text-muted mb-4">Gestión de entradas y salidas</p>
                            
                            <form onSubmit={handleSubmit} method="post">
                                {error && (
                                    <div className="alert alert-danger mb-3" role="alert">
                                        {error}
                                    </div>
                                )}
                                
                                {/* Campo Usuario (Legajo) */}
                                <div className="mb-3">
                                    <div className="input-group">
                                        <span className="input-group-text" style={loginStyles.inputGroupText}>👤</span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ingresa tu usuario"
                                            value={legajo}
                                            onChange={(e) => setLegajo(e.target.value)}
                                            style={loginStyles.formControl}
                                            required
                                        />
                                    </div>
                                </div>
                                
                                {/* Campo Contraseña */}
                                <div className="mb-3">
                                    <div className="input-group">
                                        <span className="input-group-text" style={loginStyles.inputGroupText}>🔒</span>
                                        <input
                                            type={isPasswordVisible ? 'text' : 'password'}
                                            className="form-control"
                                            placeholder="Ingresa tu contraseña"
                                            value={contrasena}
                                            onChange={(e) => setContrasena(e.target.value)}
                                            style={loginStyles.formControl}
                                            required
                                        />
                                        <button 
                                            className="btn btn-outline-secondary" 
                                            type="button" 
                                            onClick={togglePasswordVisibility}
                                            style={loginStyles.inputGroupText} // Reutilizando el estilo para el botón
                                            disabled={isLoading}
                                        >
                                            {isPasswordVisible ? '🙈' : '👁️'}
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Botón de Ingresar */}
                                <div className="d-grid gap-2 mt-4">
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary btn-lg" 
                                        style={loginStyles.btnPrimary}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'INGRESANDO...' : 'INGRESAR'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}