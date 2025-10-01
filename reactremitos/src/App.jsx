import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

// Importa tus componentes de página
import Login from './pages/Login';
import Salidas from './pages/Salidas/Salidas'; // Ruta actualizada según tu estructura
// Puedes agregar otros componentes aquí (e.g., CrearNotaSalida, VerNotaSalida, Home)
const Home = () => <h1>Página Principal (Dashboard)</h1>;
const CrearNotaSalida = () => <h2>Crear Nueva Nota de Salida</h2>;
const VerNotaSalida = () => <h2>Ver Detalle de Nota de Salida</h2>;


export default function App() {
    // 1. Manejo de estado de autenticación
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const isLoggedIn = !!token;
    
    // (Opcional, se mantiene la lógica de la barra lateral si la usas)
    const [isOpen, setIsOpen] = useState(false); 

    // Función para manejar el éxito del login (guarda el token)
    const handleAuthSuccess = (newToken) => {
        setToken(newToken);
        localStorage.setItem('authToken', newToken);
    };

    // Función para cerrar sesión (elimina el token)
    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem('authToken');
    };
    
    // Función para cerrar la barra lateral (si aplica)
    const handleLinkClick = () => {
        setIsOpen(false);
    };

    // Componente de Layout simple (ejemplo de navegación)
    const MainLayout = ({ children }) => (
        <div className="main-layout">
            <header className="navbar navbar-dark bg-dark p-3 mb-4">
                <div className="container-fluid">
                    <span className="navbar-brand">Sistema de Remitos</span>
                    {isLoggedIn && (
                        <div>
                            <span className="text-white me-3">Bienvenido</span>
                            <button className="btn btn-outline-danger" onClick={handleLogout}>
                                Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
            </header>
            <main className="container">{children}</main>
        </div>
    );

    // --- Ruteo Condicional con React Router DOM ---
    
    return (
        <Router>
            <Routes>
                {/* RUTAS PÚBLICAS / LOGIN
                Si está logeado, redirige a Home. Si no, muestra el formulario de Login.
                */}
                <Route 
                    path="/login" 
                    element={isLoggedIn ? <Navigate to="/" replace /> : <Login handleAuthSuccess={handleAuthSuccess} />} 
                />

                {/* RUTAS PROTEGIDAS / APLICACIÓN PRINCIPAL
                Si NO está logeado, redirige a Login. Si SÍ, muestra el layout principal y las rutas anidadas.
                */}
                <Route 
                    path="*" 
                    element={!isLoggedIn ? <Navigate to="/login" replace /> : (
                        <MainLayout>
                            <Routes>
                                {/* Ruta por defecto cuando está logeado */}
                                <Route path="/" element={<Home />} />
                                
                                {/* Ruta para la lista de Notas de Salida */}
                                <Route path="/salidas" element={<Salidas token={token} />} /> 
                                
                                {/* Ruta para crear una nueva nota */}
                                <Route path="/salidas/crear" element={<CrearNotaSalida />} /> 
                                
                                {/* Ruta para ver el detalle de una nota (usa :id como parámetro) */}
                                <Route path="/salidas/ver/:id" element={<VerNotaSalida />} /> 
                                
                                {/* Ruta 404 para URLs no encontradas (dentro de la app) */}
                                <Route path="*" element={<h1>404 | Página no encontrada</h1>} />
                            </Routes>
                        </MainLayout>
                    )} 
                />
            </Routes>
        </Router>
    );
}