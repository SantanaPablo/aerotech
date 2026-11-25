import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

const NetworkStatus = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[9999] animate-bounce">
      <div className="bg-red-600 text-white px-5 py-2.5 rounded-full shadow-lg flex items-center space-x-2">
        <WifiOff className="w-5 h-5" />
        <span className="font-semibold text-sm">Sin conexión a internet</span>
      </div>
    </div>
  );
};

export default NetworkStatus;