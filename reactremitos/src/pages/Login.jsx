import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Plane, Loader2 } from 'lucide-react';
const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * @typedef {Object} LoginProps
 * @property {(token: string) => void} handleAuthSuccess - Función para manejar el éxito de la autenticación y el almacenamiento del token.
 */

/**
 * @param {LoginProps} props
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

        // Simple validación de campos obligatorios
        if (!legajo || !contrasena) {
            setError('Por favor, ingresa tu usuario y contraseña.');
            setIsLoading(false);
            return;
        }

        // Endpoint de login
        const loginUrl = `${API_BASE_URL}/api/Auth/login`;

        try {
            // Implementando un simple mecanismo de reintento con retroceso exponencial
            let response = null;
            const maxRetries = 3;
            let delay = 1000;

            for (let i = 0; i < maxRetries; i++) {
                try {
                    response = await fetch(loginUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        // Asegúrate de que las keys coincidan con el DTO esperado en C# (Legajo, Contrasena)
                        body: JSON.stringify({ Legajo: legajo, Contrasena: contrasena }),
                    });
                    
                    if (response.status !== 429) { // 429 Too Many Requests
                        break; // Salir del bucle si no es un error de rate limiting
                    }
                } catch (fetchError) {
                    if (i === maxRetries - 1) throw fetchError; // Lanzar el error en el último intento
                }

                // Esperar con retroceso exponencial
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
            }

            if (!response || !response.ok) {
                // Intenta obtener el mensaje de error del cuerpo de la respuesta
                let errorMessage = 'Error de inicio de sesión';
                
                if (response) {
                    try {
                        const errorJson = await response.json();
                        errorMessage = errorJson.message || errorMessage;
                    } catch {
                        // Si no es JSON, usa el status text o un mensaje genérico
                        errorMessage = response.statusText || 'Error de conexión o credenciales.';
                    }
                    
                    // Si el status es 401, generalmente es un error de credenciales
                    if (response.status === 401) {
                        errorMessage = 'Usuario o contraseña incorrectos.';
                    }
                }

                throw new Error(errorMessage);
            }

            const data = await response.json();
            
            // Llama a la función de éxito para guardar el token en localStorage y redirigir
            if (data.token) {
                handleAuthSuccess(data.token); 
            } else {
                // Manejar el caso si el login fue OK (200) pero falta el token en la respuesta
                throw new Error('Inicio de sesión exitoso, pero el token de autenticación está ausente.');
            }

        } catch (err) {
            console.error('Login error:', err);
            // Mostrar el mensaje de error capturado
            setError(err.message);
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


    // Estilos Tailwind CSS
    const darkBg = 'bg-[#2c3e50] text-[#ecf0f1] font-sans';
    const cardBg = 'bg-[#2c3e50]/90 border border-[#34495e] rounded-xl shadow-2xl';
    const inputStyle = 'w-full px-4 py-2 bg-[#34495e] border border-[#4a647d] text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out';
    const inputGroupStyle = 'inline-flex items-center px-3 bg-[#34495e] border border-[#4a647d] text-[#95a5a6] transition duration-150 ease-in-out';
    const primaryBtn = 'w-full py-3 bg-[#3498db] hover:bg-[#2980b9] border-[#3498db] hover:border-[#2980b9] text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg';


    return (
        // Contenedor principal: Centrado en la pantalla con fondo oscuro
        <div className={`min-h-screen flex items-center justify-center ${darkBg}`}>
            {/* Tarjeta de Login */}
            <div className={`max-w-md w-full p-8 text-center mx-4 sm:mx-auto ${cardBg}`}>
                
                {/* Ícono y Título */}
                <Plane className="mx-auto h-12 w-12 text-[#3498db]" />
                <h5 className="mt-2 text-xl font-medium text-white">Sistema de Remitos</h5>
                <p className="text-gray-400 mb-6">Gestión de entradas y salidas</p>

                <form onSubmit={handleSubmit} noValidate>
                    {/* Mensaje de Error */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-900/50 text-red-300 border border-red-700 rounded-lg text-left text-sm" role="alert">
                            {error}
                        </div>
                    )}
                    
                    {/* Campo Usuario (Legajo) */}
                    <div className="mb-4">
                        <label htmlFor="legajo" className="sr-only">Usuario</label>
                        <div className="flex shadow-sm rounded-lg">
                            <span className={`${inputGroupStyle} rounded-l-lg`}>
                                <User className="w-5 h-5" />
                            </span>
                            <input
                                type="text"
                                id="legajo"
                                placeholder="Ingresa tu usuario"
                                value={legajo}
                                onChange={(e) => setLegajo(e.target.value)}
                                className={`${inputStyle} rounded-r-lg`}
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    
                    {/* Campo Contraseña */}
                    <div className="mb-4">
                        <label htmlFor="contrasena" className="sr-only">Contraseña</label>
                        <div className="flex shadow-sm rounded-lg">
                            <span className={inputGroupStyle}>
                                <Lock className="w-5 h-5" />
                            </span>
                            <input
                                type={isPasswordVisible ? 'text' : 'password'}
                                id="contrasena"
                                placeholder="Ingresa tu contraseña"
                                value={contrasena}
                                onChange={(e) => setContrasena(e.target.value)}
                                className={inputStyle}
                                required
                                disabled={isLoading}
                            />
                            <button 
                                className={`${inputGroupStyle} border-l-0 rounded-r-lg hover:text-white`} 
                                type="button" 
                                onClick={togglePasswordVisibility}
                                disabled={isLoading}
                                aria-label={isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {isPasswordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    
                    {/* Botón de Ingresar */}
                    <div className="mt-6">
                        <button 
                            type="submit" 
                            className={primaryBtn}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    INGRESANDO...
                                </span>
                            ) : 'INGRESAR'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
