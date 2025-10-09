import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Printer, Pencil } from "lucide-react";


const VerRemito = ({ token }) => {
  const { id } = useParams();
  const [remito, setRemito] = useState(null);
  const [items, setItems] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchRemito = async () => {
      try {
        const resp = await fetch(`${API_URL}/api/Remitos/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resp.ok) throw new Error("Error al cargar remito");
        const data = await resp.json();
        setRemito(data);
        setItems(data.items || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRemito();
  }, [API_URL, id, token]);

  if (!remito) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Cargando remito...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen font-sans">
      {/* Botones de acción */}
      <div className="no-print flex gap-3 mb-4">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow-md transition"
        >
          <Printer size={18} /> Imprimir
        </button>

        <Link
          to={`/remitos/editar/${remito.id}`}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition"
        >
          <Pencil size={18} /> Editar
        </Link>
      </div>

      {/* Contenido imprimible */}
      <div className="print-content p-6 sm:p-8 bg-white rounded-xl shadow-2xl border border-gray-100">
        {/* Encabezado */}
        <div className="flex flex-wrap justify-between items-center mb-4 encabezado">
          <div className="w-1/4">
            <img
              src="/pdf/logo.png"
              alt="Logo"
              className="max-h-16 object-contain"
            />
          </div>

          <div className="w-1/2 text-center">
            <div className="text-2xl font-bold mb-1">R</div>
            <div className="text-sm">
              Código identificatorio del Tipo de Comprobante: <strong>91</strong>
            </div>
            <div className="uppercase text-gray-500 text-xs">
              Documento no válido como factura
            </div>
          </div>

          <div className="w-1/4 text-right text-sm">
            <div>
              <strong>Remito Interno N°:</strong> {remito.numero}
            </div>
            <div>
              <strong>Fecha:</strong>{" "}
              {new Date(remito.fecha).toLocaleDateString()}
            </div>
          </div>
        </div>

        <hr className="my-2 border-gray-300" />

        {/* Datos del remitente */}
        <div className="flex justify-between text-sm mb-2 datos-remitente">
          <div>
            <strong>Aerolíneas Argentinas S.A.</strong>
            <br />
            Aeroparque Jorge Newbery - Av. Costanera Rafael Obrigado S/N
            <br />
            CP 1425 - Ciudad Autónoma de Buenos Aires
          </div>
          <div className="text-right">
            <div>C.U.I.T N° 30-64140555-4</div>
            <div>ING. BRUTOS C.M. N° 901 - 179709-8</div>
            <div>INICIO DE ACTIVIDADES 01/11/1990</div>
            <div>IVA Responsable Inscripto</div>
          </div>
        </div>

        {/* Destinatario / Transportista */}
        <div className="flex justify-between text-sm mb-4 datos-destinatario">
          <div>
            <strong>DESTINATARIO:</strong> Aerolíneas Argentinas S.A.
            <br />
            Dirección: Aeropuerto Internacional Ministro Pistarini - Planta
            Industrial Ezeiza
            <br />
            C.U.I.T: 30-64140555-4
          </div>
          <div>
            <strong>TRANSPORTISTA:</strong> NA Nuevos Aires Logística
            <br />
            Domicilio: Gral Molina 296 Sarandí (1872) Bs. As.
            <br />
            C.U.I.T: 33-71243495-9
          </div>
        </div>

        {/* Tabla de ítems */}
        <table className="w-full text-xs border border-gray-300 table-auto">
          <thead className="bg-gray-100">
            <tr className="border-b border-gray-300">
              <th className="p-2 border">#</th>
              <th className="p-2 border text-left">Descripción</th>
              <th className="p-2 border text-left">Serial</th>
              <th className="p-2 border text-left">Usuario</th>
              <th className="p-2 border text-center">Cant.</th>
              <th className="p-2 border text-left">Detalle</th>
              <th className="p-2 border text-left">Recibido Por</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((i, idx) => (
                <tr key={idx} className="border-t hover:bg-blue-50">
                  <td className="p-2 border text-center">{i.numero_item}</td>
                  <td className="p-2 border">{i.descripcion}</td>
                  <td className="p-2 border">{i.serial}</td>
                  <td className="p-2 border">{i.usuario}</td>
                  <td className="p-2 border text-center">{i.cantidad}</td>
                  <td className="p-2 border">{i.detalle}</td>
                  <td className="p-2 border">{i.recibido_por}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">
                  No hay ítems cargados
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Firmas */}
        <div className="firma-final mt-6 flex justify-between text-sm">
          <div>
            <strong>N° Precinto:</strong> ______________________
          </div>
          <div>
            <strong>Recibí Conforme:</strong> ______________________
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerRemito;
