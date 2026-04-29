import React from 'react';
import { Link } from 'react-router-dom';
import { hasRol } from '../utils/api'; // Ajustá la ruta según la ubicación de tu archivo

const Home = () => {
  // Agregamos la propiedad 'roles' a cada item
  const menuItems = [
    {
      title: 'Salidas',
      path: '/salidas',
      description: 'Gestionar notas de salida y despachos.',
      image: "/assets/images/salidas.png",
      roles: ['Admin'],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      )
    },
    {
      title: 'Remitos',
      path: '/remitos',
      description: 'Administrar y crear nuevos remitos.',
      image: "/assets/images/remitos.png",
      roles: ['Admin'],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: 'Entradas',
      path: '/entradas',
      description: 'Registrar y visualizar notas de entrada.',
      image: "/assets/images/entradas.png",
      roles: ['Admin'],
      icon: (
         <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
      )
    },
    {
      title: 'Notas PSA',
      path: '/notaPSA',
      description: 'Acceso directo a notas PSA.',
      image: "/assets/images/notasPSA.png",
      roles: ['Admin','Tecnico'], // Ejemplo de varios roles
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      title: 'Monitor de Impresoras',
      path: '/monitor-impresoras', // Link externo
      description: 'Estado y cola de impresión.',
      image: "/assets/images/impresoras.png",
      roles: ['Admin', 'Tecnico'], // Solo sistemas/soporte
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
      )
    },
    {
      title: 'Monitor Infraestructura',
      path: '/monitor-switches', // Link externo
      description: 'Monitor de Switches',
      image: "/assets/images/infraestructura.png",
      roles: ['Admin', 'Tecnico'], // Solo sistemas/soporte
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
      )
    },
     {
      title: 'DariOs',
      path: '/DariOs',
      description: 'Diagnóstico de Red',
      image: "/assets/images/DariOsCard.png",
      roles: ['Admin', 'Tecnico','Invitado'],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
     {
      title: 'Perfil',
      path: '/perfil',
      description: 'Ver información del usuario actual.',
      image: "/assets/images/perfil.png",
      roles: ['Admin', 'Tecnico','Invitado'],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
  ];

  const menuFiltrado = menuItems.filter(item => hasRol(...item.roles));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Menú Principal
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Bienvenido al sistema de gestión integral de Aerotech.
        </p>
        <div className="h-1 w-20 bg-blue-600 mt-4 rounded-full"></div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {menuFiltrado.map((item, index) => {
          const isExternal = item.path.startsWith('http');
          const Tag = isExternal ? 'a' : Link;
          
          return (
            <Tag
              key={index}
              to={!isExternal ? item.path : undefined}
              href={isExternal ? item.path : undefined}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="group relative h-80 rounded-2xl shadow-md overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border border-gray-100"
            >
              {/* Imagen con zoom suave */}
              <img 
                src={item.image} 
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />

              {/* Degradado sofisticado en lugar de fondo negro sólido */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

              {/* Contenido */}
              <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                <div className="mb-auto">
                  {/* Contenedor de Icono Estilizado */}
                  <div className="inline-flex items-center justify-center p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center text-blue-400 font-semibold text-sm">
                  <span className="mr-2 uppercase tracking-wider">Explorar</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Tag>
          );
        })}
      </div>
    </div>
  );
};

export default Home;