import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Printer } from "lucide-react";
import { apiGet } from "../../utils/api";

const GenerarEtiquetas = () => {
  const { id } = useParams();
  const [remito, setRemito] = useState(null);
  const [items, setItems] = useState([]);
  const [modoA4, setModoA4] = useState(false);

  useEffect(() => {
    const fetchRemito = async () => {
      try {
        const data = await apiGet(`/api/Remitos/${id}`);
        setRemito(data);
        setItems(data.items || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRemito();
  }, [id]);

  if (!remito) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500 font-sans">
        Cargando etiquetas...
      </div>
    );
  }

  // ESTILOS CSS PARA IMPRESIÓN
  const printStyles = `
    @media print {
      @page {
        size: ${modoA4 ? "A4" : "48mm auto"};
        margin: ${modoA4 ? "15mm 10mm" : "0mm"}; 
      }

      body { margin: 0; padding: 0; }
      body * { visibility: hidden; }

      .print-labels-area, 
      .print-labels-area * {
        visibility: visible !important;
      }

      .print-labels-area {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        
        /* Margen SUPERIOR de 40mm (como pediste antes) */
        padding-top: ${modoA4 ? "0mm" : "40mm"} !important;

        /* Margen INFERIOR de 50mm (NUEVO) */
        padding-bottom: ${modoA4 ? "0mm" : "50mm"} !important;
      }

      .no-print { display: none !important; }

      .lbl-card {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      .cut-line-container {
        display: ${modoA4 ? "none" : "block"};
        text-align: center;
        margin-top: 5mm;
        margin-bottom: 5mm;
        position: relative;
      }
      
      .cut-line-visual {
        border-bottom: 3px dashed black; /* Línea gruesa */
        width: 100%;
        position: relative;
        top: -10px;
      }

      .scissors-icon {
        background: white;
        padding: 0 5px;
        font-size: 14px;
        position: relative;
        z-index: 10;
      }
    }
  `;

  return (
    <>
      <style>{printStyles}</style>

      {/* FONDO DE PANTALLA */}
      <div className="bg-gray-100 min-h-screen p-6 font-sans">
        
        {/* BARRA DE HERRAMIENTAS (NO SALE IMPRESA) */}
        <div className="no-print max-w-5xl mx-auto mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Link
              to={`/remitos/verremito/${id}`}
              className="text-gray-500 hover:text-gray-800 font-medium transition-colors"
            >
              &larr; Volver
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Generar Etiquetas</h1>
              <p className="text-xs text-gray-500">Remito #{remito.numero}</p>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
              <button
                onClick={() => setModoA4(false)}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                  !modoA4 ? "bg-white shadow-sm text-blue-600 ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Rollo (48mm)
              </button>
              <button
                onClick={() => setModoA4(true)}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                  modoA4 ? "bg-white shadow-sm text-blue-600 ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Hoja A4
              </button>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2 rounded-lg shadow-md transition font-bold text-sm tracking-wide"
            >
              <Printer size={16} /> IMPRIMIR
            </button>
          </div>
        </div>

        {/* ÁREA DE IMPRESIÓN */}
        <div 
          className={`print-labels-area mx-auto ${
            modoA4 
              ? "w-[210mm] min-h-[297mm] bg-white p-8 grid grid-cols-3 gap-6 content-start" 
              : "w-[48mm] flex flex-col items-center gap-0" // Gap 0 porque controlamos el margen con el div de corte
          }`}
        >
          {items.map((item, idx) => (
            <React.Fragment key={idx}>
              {/* --- TARJETA DE ETIQUETA --- */}
              <div
                className={`lbl-card bg-white rounded-lg shadow-sm overflow-hidden box-border border-t-[5px] border-blue-600 ${
                  modoA4 
                    ? "h-auto p-4 border-x border-b border-gray-200" 
                    : "w-[48mm] p-2 border-b border-gray-200" 
                }`}
              >
                
                {/* HEADER */}
                <div className="flex justify-between items-end border-b border-gray-200 pb-2 mb-2">
                   <span className="text-xl font-black text-blue-900 leading-none">
                      ITEM {item.numero_item}
                   </span>
                   <span className="text-[10px] font-medium text-gray-500 mb-0.5">
                      {new Date(remito.fecha).toLocaleDateString()}
                   </span>
                </div>

                {/* CUERPO */}
                <div className="text-sm text-gray-800 flex flex-col gap-2">
                  <div className="grid grid-cols-[60px_1fr] gap-2 items-baseline">
                      <span className="text-xs font-bold text-gray-500 uppercase">Remito</span>
                      <span className="font-bold text-base">{remito.numero}</span>
                  </div>
                  <div className="grid grid-cols-[60px_1fr] gap-2 items-baseline">
                      <span className="text-xs font-bold text-gray-500 uppercase">Desc</span>
                      <span className="leading-tight text-sm font-medium">{item.descripcion}</span>
                  </div>
                  <div className="grid grid-cols-[60px_1fr] gap-2 items-baseline">
                      <span className="text-xs font-bold text-gray-500 uppercase">Serial</span>
                      <span className="font-mono font-bold text-xs break-all">{item.serial || "-"}</span>
                  </div>
                  <div className="grid grid-cols-[60px_1fr] gap-2 items-baseline">
                      <span className="text-xs font-bold text-gray-500 uppercase">Usuario</span>
                      <span className="text-xs truncate font-medium">{item.usuario || "-"}</span>
                  </div>
                  <div className="grid grid-cols-[60px_1fr] gap-2 items-baseline mt-1">
                      <span className="text-xs font-bold text-gray-500 uppercase">Destino</span>
                      <span className="font-black text-sm text-blue-800 uppercase leading-tight">
                          {remito.destinatario || remito.destino || "Sin Destino"}
                      </span>
                  </div>
                </div>
              </div>

              {/* --- LÍNEA DE CORTE (Solo visible en modo Rollo) --- */}
              {!modoA4 && (
                <div className="cut-line-container w-full">
                  {/* Icono Tijera y Línea */}
                  <span className="scissors-icon">✂</span>
                  <div className="cut-line-visual"></div>
                </div>
              )}
            </React.Fragment>
          ))}

          {items.length === 0 && (
            <div className="col-span-3 text-center text-gray-400 py-10 no-print">
              No hay ítems cargados.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GenerarEtiquetas;