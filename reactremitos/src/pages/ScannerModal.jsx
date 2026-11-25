import React, { useEffect } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";

const ScannerModal = ({ onScan, onClose }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 20,
        qrbox: { width: 300, height: 100 }, 
        rememberLastUsedCamera: true,
        formatsToSupport: [Html5QrcodeSupportedFormats.CODE_128],
        videoConstraints: {
          facingMode: "environment",
          focusMode: "continuous",
          width: { ideal: 1920, min: 1280 }, 
          height: { ideal: 1080, min: 720 }
        }
      },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScan(decodedText);
      },
      () => {}
    );

    return () => {
      try {
        scanner.clear();
      } catch (error) {}
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black bg-opacity-90 backdrop-blur-sm">
      <div className="flex justify-end p-4">
        <button onClick={onClose} className="text-white hover:text-red-400 text-4xl font-bold p-2 transition-colors">
          &times;
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div id="reader" className="w-full max-w-md bg-white rounded-xl overflow-hidden shadow-2xl pb-4"></div>
      </div>
    </div>
  );
};

export default ScannerModal;