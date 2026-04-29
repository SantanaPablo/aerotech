import React from 'react';

const MonitorImpresoras = () => {
  return (
    <div className="flex flex-col h-[calc(200vh-200px)]"> 
      {/*<h1 className="text-2xl font-bold mb-4">Monitor de Impresoras en tiempo real</h1>*/}
      <div className="flex-grow bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <iframe
          src="http://10.35.144.252"
          title="Monitor de Impresoras"
          className="w-full h-full border-none"
          // Importante para la seguridad y el correcto renderizado
          sandbox="allow-forms allow-scripts allow-same-origin" 
        />
      </div>
    </div>
  );
};

export default MonitorImpresoras;