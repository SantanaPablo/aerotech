import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { getToken, apiGet, apiPut, hasRol } from './utils/api.js';

import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard.jsx'; 
import DashboardSalidas from './pages/DashboardSalidas.jsx'; 

import Salidas from './pages/Salidas/Salidas';
import CrearNotaSalida from './pages/Salidas/CrearNotaSalida';
import VerNotaSalida from './pages/Salidas/VerNotaSalida';

import Entradas from './pages/Entradas/Entradas';
import CrearNotaEntrada from './pages/Entradas/CrearNotaEntrada';
import VerNotaEntrada from './pages/Entradas/VerNotaEntrada';

import Remitos from './pages/Remitos/Remitos';
import VerRemito from './pages/Remitos/VerRemito';
import CrearRemito from './pages/Remitos/CrearRemito';
import EditarRemito from './pages/Remitos/EditarRemito';
import GenerarEtiquetas from './pages/Remitos/GenerarEtiquetas';

import NotaPSA from './pages/NotaPSA';

import MonitorImpresoras from './pages/MonitorImpresoras.jsx';

import './css/NotaSalidaPrint.css';
import './css/VerRemito.css';
import './css/NotaPSA.css'


import Perfil from './pages/Perfil.jsx';
import DariOs from './pages/DariOs.jsx';



export default function App() {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const isLoggedIn = !!token;
  const [menuOpen, setMenuOpen] = useState(false); // Para menú móvil
  const [usuario, setUsuario] = useState({ id: 0, nombre: '', legajo: '' });
  

  const handleAuthSuccess = (newToken) => {
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('authToken');
  };

  useEffect(() => {
  const token = getToken();
  if (!token) return;

  try {
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(atob(payloadBase64));

    const usuarioId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    const nombre = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
    const legajo = payload['Legajo'];

    setUsuario({
      id: parseInt(usuarioId),
      nombre: nombre || '',
      legajo: legajo || ''
    });
  } catch (e) {
    console.error('Error al decodificar el token:', e);
  }
}, [token]);

  const MainLayout = ({ children }) => {
    const activeClass = "bg-gray-700 text-white rounded px-3 py-2 block";
    const inactiveClass = "text-gray-300 hover:text-white px-3 py-2 block";
    

    return (
      <div className="min-h-screen flex flex-col">
        {/* HEADER */}
        <header className="bg-gray-900 text-white shadow-sm">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <img
                src="../../aerotech.png"
                alt="Logo"
                className="max-h-16 object-contain"
              />
              <NavLink to="/" className="font-bold text-xl">Aerotech</NavLink>
            </div>



            {isLoggedIn && (
              <div className="flex items-center space-x-4">
                {/* Menú Desktop */}
                <nav className="hidden md:flex space-x-2">
                  {hasRol('Admin') && <NavLink to="/salidas" className={({ isActive }) => isActive ? activeClass : inactiveClass}>Salidas</NavLink>}
                  {hasRol('Admin') && <NavLink to="/remitos" className={({ isActive }) => isActive ? activeClass : inactiveClass}>Remitos</NavLink>}
                  {hasRol('Admin') && <NavLink to="/entradas" className={({ isActive }) => isActive ? activeClass : inactiveClass}>Entradas</NavLink>}
                  {hasRol('Admin', 'Tecnico') && <NavLink to="/perfil" className={({ isActive }) => isActive ? activeClass : inactiveClass}>Perfil</NavLink>}
                  {/* <NavLink to="/enviosEzeiza" className={({ isActive }) => isActive ? activeClass : inactiveClass}>Envíos Ezeiza</NavLink>*/}
                  <span className="text-gray-200 px-3 py-2 block">{usuario.nombre}</span>
                  


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
              {hasRol('Admin') && <NavLink to="/salidas" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? activeClass : inactiveClass}>Salidas</NavLink>}
              {hasRol('Admin') && <NavLink to="/remitos" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? activeClass : inactiveClass}>Remitos</NavLink>}
              {hasRol('Admin') && <NavLink to="/entradas" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? activeClass : inactiveClass}>Entradas</NavLink>}
              {hasRol('Admin', 'Tecnico') && <NavLink to="/perfil" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? activeClass : inactiveClass}>Perfil</NavLink>}
              {/* <NavLink to="/enviosEzeiza" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? activeClass : inactiveClass}>Envíos Ezeiza</NavLink>*/}
              <span className="text-gray-200 px-3 py-2 block">Hola, {usuario.nombre}</span>
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
          &copy; 2026 - Aerotech
        </footer>
      </div>
    );
  };

  return (
    <Router>
      <Routes>
        <Route path="/notaPSA" element={<NotaPSA token={token} />} />
        <Route path="/DariOs" element={<DariOs />} />
        <Route path="/monitor-impresoras" element={hasRol('Admin', 'Tecnico') ? <MonitorImpresoras /> : <Navigate to="/" replace />} />

        {/* LOGIN */}
        <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <Login handleAuthSuccess={handleAuthSuccess} />} />

        {/* PRIVADAS */}
        <Route path="*" element={!isLoggedIn ? <Navigate to="/login" replace /> : (
          <MainLayout>
            <Routes>
              <Route path="/" element={<Home />} />

              <Route path="/salidas" element={hasRol('Admin') ? <Salidas token={token} /> : <Navigate to="/" replace />} />
              <Route path="/salidas/crearnotasalida" element={hasRol('Admin') ? <CrearNotaSalida token={token} /> : <Navigate to="/" replace />} />
              <Route path="/salidas/vernotasalida/:id" element={hasRol('Admin') ? <VerNotaSalida /> : <Navigate to="/" replace />} />

              <Route path="/entradas" element={hasRol('Admin') ? <Entradas token={token} /> : <Navigate to="/" replace />} />
              <Route path="/entradas/crearnotaentrada" element={hasRol('Admin') ? <CrearNotaEntrada token={token} /> : <Navigate to="/" replace />} />
              <Route path="/entradas/vernotaentrada/:id" element={hasRol('Admin') ? <VerNotaEntrada /> : <Navigate to="/" replace />} />

              <Route path="/remitos" element={hasRol('Admin') ? <Remitos token={token} /> : <Navigate to="/" replace />} />
              <Route path="/remitos/verremito/:id" element={hasRol('Admin') ? <VerRemito /> : <Navigate to="/" replace />} />
              <Route path="/remitos/crearremito" element={hasRol('Admin') ? <CrearRemito token={token} /> : <Navigate to="/" replace />} />
              <Route path="/remitos/editarremito/:id" element={hasRol('Admin') ? <EditarRemito token={token} /> : <Navigate to="/" replace />} />
              <Route path="/remitos/etiquetas/:id" element={hasRol('Admin') ? <GenerarEtiquetas /> : <Navigate to="/" replace />} />

              <Route path="/dashboard" element={hasRol('Admin') ? <Dashboard token={token} /> : <Navigate to="/" replace />} />
              <Route path="/dashboardSalidas" element={hasRol('Admin') ? <DashboardSalidas token={token} /> : <Navigate to="/" replace />} />

              <Route path="/perfil" element={hasRol('Admin', 'Tecnico') ? <Perfil /> : <Navigate to="/" replace />} />
              <Route path="*" element={<h1>404 | Página no encontrada</h1>} />


            </Routes>
          </MainLayout>
        )} />
      </Routes>
    </Router>
  );
}
