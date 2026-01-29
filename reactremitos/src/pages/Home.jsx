import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const menuItems = [
    {
      title: 'Salidas',
      path: '/salidas',
      description: 'Gestionar notas de salida y despachos.',
      image: "/assets/images/salidas.png",
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
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      title: 'Perfil',
      path: '/perfil',
      description: 'Ver información del usuario actual.',
      image: "/assets/images/perfil.png",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      title: 'Monitor de Impresoras',
      path: 'http://10.35.144.252', // Link externo
      description: 'Estado y cola de impresión.',
      image: "/assets/images/impresoras.jpg",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
      )
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 pb-4 border-b border-gray-200">
        Menú Principal
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item, index) => (
          <Link 
            to={item.path} 
            key={index}
            className="block group relative rounded-xl shadow-lg overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl h-64"
          >
            <img 
                src={item.image} 
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-black bg-opacity-60 transition-opacity group-hover:bg-opacity-50"></div>

            <div className="relative z-10 p-6 text-white h-full flex flex-col justify-between">
              <div>
                <div className="mb-4 opacity-90 group-hover:opacity-100 transition-opacity">
                  {item.icon}
                </div>
                <h2 className="text-2xl font-bold mb-2 drop-shadow-md">{item.title}</h2>
                <p className="text-gray-100 text-sm md:text-base drop-shadow-sm">{item.description}</p>
              </div>
              
              <div className="mt-6 flex justify-end">
                <span className="text-sm font-medium bg-white bg-opacity-20 px-4 py-2 rounded-full group-hover:bg-opacity-30 transition-all flex items-center backdrop-blur-sm">
                  Acceder
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;