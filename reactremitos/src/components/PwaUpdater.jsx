import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const PwaUpdater = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-blue-600 text-white px-6 py-4 rounded-xl shadow-2xl flex flex-col items-center">
      <span className="font-semibold mb-3">Nueva versión disponible</span>
      <div className="flex space-x-3">
        <button 
          onClick={() => updateServiceWorker(true)} 
          className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition"
        >
          Actualizar
        </button>
        <button 
          onClick={() => setNeedRefresh(false)} 
          className="bg-blue-800 px-4 py-2 rounded-lg font-medium hover:bg-blue-900 transition"
        >
          Ignorar
        </button>
      </div>
    </div>
  );
};

export default PwaUpdater;