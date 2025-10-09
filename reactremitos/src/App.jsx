import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
// Importa tus páginas
import Login from './pages/Login';
import Salidas from './pages/Salidas/Salidas';
import CrearNotaSalida from './pages/Salidas/CrearNotaSalida';
import VerNotaSalida from './pages/Salidas/VerNotaSalida';

import Entradas from './pages/Entradas/Entradas';
import CrearNotaEntrada from './pages/Entradas/CrearNotaEntrada';
import VerNotaEntrada from './pages/Entradas/VerNotaEntrada';
import Remitos from './pages/Remitos/Remitos';
import VerRemito from './pages/Remitos/VerRemito';
import './css/NotaSalidaPrint.css';
import './css/VerRemito.css';

const Home = () => <h1 className="text-2xl font-bold">Página Principal (Dashboard)</h1>;

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const isLoggedIn = !!token;
  const [menuOpen, setMenuOpen] = useState(false); // Para menú móvil

  const handleAuthSuccess = (newToken) => {
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('authToken');
  };

  const MainLayout = ({ children }) => {
    const activeClass = "bg-gray-700 text-white rounded px-3 py-2 block";
    const inactiveClass = "text-gray-300 hover:text-white px-3 py-2 block";

    return (
      <div className="min-h-screen flex flex-col">
        {/* HEADER */}
        <header className="bg-gray-900 text-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <NavLink to="/" className="font-bold text-xl">Sistema de Remitos</NavLink>

            {isLoggedIn && (
              <div className="flex items-center space-x-4">
                {/* Menú Desktop */}
                <nav className="hidden md:flex space-x-2">
                  <NavLink to="/salidas" className={({ isActive }) => isActive ? activeClass : inactiveClass}>Salidas</NavLink>
                  <NavLink to="/remitos" className={({ isActive }) => isActive ? activeClass : inactiveClass}>Remitos</NavLink>
                  <NavLink to="/entradas" className={({ isActive }) => isActive ? activeClass : inactiveClass}>Entradas</NavLink>
                  <NavLink to="/enviosEzeiza" className={({ isActive }) => isActive ? activeClass : inactiveClass}>Envíos Ezeiza</NavLink>
                  <NavLink to="/perfil" className={({ isActive }) => isActive ? activeClass : inactiveClass}>Perfil</NavLink>
                  <button onClick={handleLogout} className="border border-red-500 text-red-500 px-3 py-1 rounded hover:bg-red-500 hover:text-white">Salir</button>
                </nav>

                {/* Botón hamburguesa móvil */}
                <button
                  className="md:hidden px-3 py-2 border rounded text-gray-300 border-gray-300"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  ☰
                </button>
              </div>
            )}
          </div>

          {/* Menú Mobile */}
          {menuOpen && (
            <nav className="md:hidden bg-gray-800 px-4 py-2 space-y-1">
              <NavLink to="/salidas" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? activeClass : inactiveClass}>Salidas</NavLink>
              <NavLink to="/remitos" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? activeClass : inactiveClass}>Remitos</NavLink>
              <NavLink to="/entradas" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? activeClass : inactiveClass}>Entradas</NavLink>
              <NavLink to="/enviosEzeiza" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? activeClass : inactiveClass}>Envíos Ezeiza</NavLink>
              <NavLink to="/perfil" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? activeClass : inactiveClass}>Perfil</NavLink>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="border border-red-500 text-red-500 px-3 py-1 rounded hover:bg-red-500 hover:text-white w-full text-left">Salir</button>
            </nav>
          )}
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-grow container mx-auto p-6">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="bg-gray-900 text-gray-300 text-center p-3 mt-auto no-print">
          &copy; 2025 - Sistema de Remitos
        </footer>
      </div>
    );
  };

  return (
    <Router>
      <link rel="stylesheet" href="/css/NotaSalidaPrint.css" media="print" />
      <Routes>
        
        {/* LOGIN */}
        <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <Login handleAuthSuccess={handleAuthSuccess} />} />

        {/* PRIVADAS */}
        <Route path="*" element={!isLoggedIn ? <Navigate to="/login" replace /> : (
          <MainLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/salidas" element={<Salidas token={token} />} />
              <Route path="/salidas/crearnotasalida" element={<CrearNotaSalida token={token} />} />
              <Route path="/salidas/vernotasalida/:id" element={<VerNotaSalida />} />

              <Route path="/entradas" element={<Entradas token={token} />} />
              <Route path="/entradas/crearnotaentrada" element={<CrearNotaEntrada token={token} />} />
              <Route path="/entradas/vernotaentrada/:id" element={<VerNotaEntrada />} />

              <Route path="/remitos" element={<Remitos token={token} />} />
               <Route path="/remitos/verremito/:id" element={<VerRemito />} />

              <Route path="/enviosEzeiza" element={<h1>Envíos Ezeiza</h1>} />
              <Route path="/perfil" element={<h1>Perfil de Usuario</h1>} />
              <Route path="*" element={<h1>404 | Página no encontrada</h1>} />
            </Routes>
          </MainLayout>
        )} />
      </Routes>
    </Router>
  );
}
