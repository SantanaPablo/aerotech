import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { getToken, hasRol } from './utils/api.js';

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
import Perfil from './pages/Perfil.jsx';
import DariOs from './pages/DariOs.jsx';

import './css/NotaSalidaPrint.css';
import './css/VerRemito.css';
import './css/NotaPSA.css';

// Definición centralizada del menú
const menuItems = [
  { title: 'Inicio', path: '/', roles: ['Admin', 'Tecnico', 'Invitado'], icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { title: 'Salidas', path: '/salidas', roles: ['Admin', 'Tecnico'], icon: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' },
  { title: 'Remitos', path: '/remitos', roles: ['Admin', 'Tecnico'], icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { title: 'Entradas', path: '/entradas', roles: ['Admin', 'Tecnico'], icon: 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1' },
  { title: 'Notas PSA', path: '/notaPSA', roles: ['Admin', 'Tecnico'], icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { title: 'Mon. Impresoras', path: '/monitor-impresoras', roles: ['Admin', 'Tecnico'], icon: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z' },
  { title: 'DariOs', path: '/DariOs', roles: ['Admin', 'Tecnico', 'Invitado'], icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { title: 'Perfil', path: '/perfil', roles: ['Admin', 'Tecnico', 'Invitado'], icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];

const MainLayout = ({ children, handleLogout, usuario }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  
  // Filtramos el menú según roles
  const menuFiltrado = menuItems.filter(item => hasRol(...item.roles));

  // Detectamos si la ruta actual necesita pantalla completa (sin max-w-7xl)
  const isFullWidthRoute = ['/monitor-impresoras', '/notaPSA', '/DariOs'].includes(location.pathname);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden print-layout-reset">
      
      {/* SIDEBAR PARA DESKTOP (Se oculta al imprimir) */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-900 text-white border-r border-white transition-all duration-300 z-20 no-print">
        <div className="flex items-center justify-center h-20 border-b border-white-800">
          <img src="../../aerotech.png" alt="Logo" className="max-h-16 object-contain mr-3" />
          <span className="font-bold text-2xl tracking-wide"></span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 ml-2">Aplicaciones</p>
          {menuFiltrado.map((item, idx) => (
            <NavLink 
              key={idx} 
              to={item.path} 
              className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span className="font-medium">{item.title}</span>
            </NavLink>
          ))}
        </div>

        {/* PERFIL Y LOGOUT */}
        <div className="p-4 border-t border-gray-800 bg-gray-900">
          <div className="flex items-center mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
              {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white line-clamp-1">{usuario.nombre}</p>
              <p className="text-xs text-gray-400">Legajo: {usuario.legajo}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Salir
          </button>
        </div>
      </aside>

      {/* SIDEBAR MÓVIL */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden no-print">
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" onClick={() => setMenuOpen(false)}></div>
          <div className="relative flex flex-col w-64 h-full bg-gray-900 text-white shadow-xl transform transition-transform duration-300">
            <div className="flex items-center justify-between h-20 px-4 border-b border-gray-800">
              <div className="flex items-center">
                <img src="../../aerotech.png" alt="Logo" className="max-h-16 object-contain mr-2" />
              </div>
              <button onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
              {menuFiltrado.map((item, idx) => (
                <NavLink 
                  key={idx} 
                  to={item.path} 
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                >
                  <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                  {item.title}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative print-layout-reset">
        <header className="md:hidden flex items-center justify-between bg-gray-900 h-16 px-4 shadow-md z-10 no-print">
          <div className="flex items-center">
            <img src="../../aerotech.png" alt="Logo" className="max-h-16 object-contain mr-2" />
          </div>
          <button onClick={() => setMenuOpen(true)} className="text-gray-300 hover:text-white focus:outline-none">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </header>

       <main className={`flex-1 overflow-y-auto bg-gray-50 ${isFullWidthRoute ? 'p-2 md:p-4' : 'p-4 md:p-8'} print-main-reset`}>
          {/* Al usar w-full y max-w-none garantizamos que no haya topes de ancho */}
          <div className={`mx-auto ${isFullWidthRoute ? 'w-full max-w-none' : 'max-w-8xl'} transition-all duration-300`}>
            {children}
          </div>
        </main>
        
        <footer className="bg-white border-t border-gray-200 text-gray-500 text-sm text-center py-4 no-print shrink-0">
           &copy; 2026 - Aerotech.
        </footer>
      </div>
    </div>
  );
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const isLoggedIn = !!token;
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

      setUsuario({
        id: parseInt(payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']),
        nombre: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || '',
        legajo: payload['Legajo'] || ''
      });
    } catch (e) {
      console.error('Error al decodificar el token:', e);
    }
  }, [token]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <Login handleAuthSuccess={handleAuthSuccess} />} />
        <Route path="/DariOs" element={<DariOs />} />

        {/* TODAS LAS RUTAS ESTÁN DENTRO DEL MAIN LAYOUT */}
        <Route path="*" element={!isLoggedIn ? <Navigate to="/login" replace /> : (
          <MainLayout handleLogout={handleLogout} usuario={usuario}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/notaPSA" element={<NotaPSA token={token} />} />
              <Route path="/monitor-impresoras" element={hasRol('Admin', 'Tecnico') ? <MonitorImpresoras /> : <Navigate to="/" replace />} />

              <Route path="/salidas" element={hasRol('Admin', 'Tecnico') ? <Salidas token={token} /> : <Navigate to="/" replace />} />
              <Route path="/salidas/crearnotasalida" element={hasRol('Admin') ? <CrearNotaSalida token={token} /> : <Navigate to="/" replace />} />
              <Route path="/salidas/vernotasalida/:id" element={hasRol('Admin', 'Tecnico') ? <VerNotaSalida /> : <Navigate to="/" replace />} />

              <Route path="/entradas" element={hasRol('Admin', 'Tecnico') ? <Entradas token={token} /> : <Navigate to="/" replace />} />
              <Route path="/entradas/crearnotaentrada" element={hasRol('Admin') ? <CrearNotaEntrada token={token} /> : <Navigate to="/" replace />} />
              <Route path="/entradas/vernotaentrada/:id" element={hasRol('Admin', 'Tecnico') ? <VerNotaEntrada /> : <Navigate to="/" replace />} />

              <Route path="/remitos" element={hasRol('Admin', 'Tecnico') ? <Remitos token={token} /> : <Navigate to="/" replace />} />
              <Route path="/remitos/verremito/:id" element={hasRol('Admin', 'Tecnico') ? <VerRemito /> : <Navigate to="/" replace />} />
              <Route path="/remitos/crearremito" element={hasRol('Admin') ? <CrearRemito token={token} /> : <Navigate to="/" replace />} />
              <Route path="/remitos/editarremito/:id" element={hasRol('Admin') ? <EditarRemito token={token} /> : <Navigate to="/" replace />} />
              <Route path="/remitos/etiquetas/:id" element={hasRol('Admin') ? <GenerarEtiquetas /> : <Navigate to="/" replace />} />

              <Route path="/dashboard" element={hasRol('Admin') ? <Dashboard token={token} /> : <Navigate to="/" replace />} />
              <Route path="/dashboardSalidas" element={hasRol('Admin') ? <DashboardSalidas token={token} /> : <Navigate to="/" replace />} />
              <Route path="/perfil" element={hasRol('Admin', 'Tecnico') ? <Perfil /> : <Navigate to="/" replace />} />
              
              <Route path="*" element={<h1 className="text-2xl font-bold text-gray-700">404 | Página no encontrada</h1>} />
            </Routes>
          </MainLayout>
        )} />
      </Routes>
    </Router>
  );
}