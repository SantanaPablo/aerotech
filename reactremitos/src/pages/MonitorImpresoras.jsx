import React from 'react';

const MonitorImpresoras = () => {
  return (
    <div className="flex flex-col h-[calc(200vh-200px)]"> 
      <div className="flex-grow bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <iframe
    src="/printer-ui/" 
    title="Monitor de Impresoras"
    className="w-full h-full border-none"
    sandbox="allow-forms allow-scripts allow-same-origin" 
/>
      </div>
    </div>
  );
};

export default MonitorImpresoras;