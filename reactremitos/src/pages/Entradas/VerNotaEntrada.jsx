import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Printer, FileText, Loader2, User, AlertTriangle, Calendar, Send, Settings } from 'lucide-react';
import { apiGet } from '../../utils/api';

const fetchNotaById = async (id) => {
  try {
    // Obtener nota principal
    const nota = await apiGet(`/api/NotasEntrada/${id}`);

    // Obtener ítems asociados
    const items = await apiGet(`/api/ItemEntradas/por-notaentrada/${id}`);

    return {
      ...nota,
      Items: items,
      Usuario: nota.autorizante || nota.Autorizante,
      NotaIdDisplay: nota.id || nota.Id || id,
    };
  } catch (error) {
    console.error('Error al obtener detalles de la nota:', error);
    throw new Error(error.message || 'No se pudo obtener los datos de la nota.');
  }
};

const VerNotaEntrada = () => {
    const { id } = useParams();
    const notaId = id;

    const [notaData, setNotaData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            if (!notaId) {
                setError("ID de nota no proporcionado en la URL.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const data = await fetchNotaById(notaId);
                setNotaData(data);
            } catch (err) {
                console.error("Error al cargar datos:", err);
                setError(err.message);
                setNotaData(null);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [notaId]);

    const handlePrint = () => {
        window.print();
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
                <p className="text-xl font-medium text-gray-700">Cargando detalle de nota (ID: {notaId})...</p>
            </div>
        );
    }

    if (error || !notaData) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen">
                <div className="p-6 bg-white rounded-xl shadow-xl border border-red-300">
                    <h2 className="text-2xl font-bold text-red-600 flex items-center">
                        <AlertTriangle className="w-6 h-6 mr-2" /> {error ? 'Error de Carga' : 'Nota No Encontrada'}
                    </h2>
                    <p className="mt-2 text-gray-700">
                        {error ? `No se pudo cargar la nota (ID: ${notaId}).` : `La nota de entrada con ID **${notaId}** no existe.`}
                    </p>
                    {error && <p className="mt-2 text-sm text-red-500">Detalle: {error}</p>}
                </div>
            </div>
        );
    }

    const rawDate = notaData.Fecha || notaData.fecha;
    const formattedDate = rawDate ? new Date(rawDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';

    const autorizanteName = `${notaData.Usuario.Nombre || notaData.Usuario.nombre || 'N/A'}`;
    const items = notaData.Items?.map(item => ({
        Unidad: item.unidad || item.Unidad,
        Equipo: item.equipo || item.Equipo,
        Serial: item.serial || item.Serial,
        Usuario: item.usuario || item.Usuario,
        SD: item.sd || item.SD,
    })) || [];


    return (
        <>

            {/* Contenido a Imprimir */}
            <div className="print-content2 p-6 sm:p-10 bg-white rounded-xl shadow-2xl border border-gray-100 relative">
                <div className=" no-print">
                    {/* Botón de Imprimir (Solo en pantalla) */}
                    <button
                        className="no-print flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-xl mb-8 transition duration-300 transform hover:scale-[1.02] active:scale-100"
                        onClick={handlePrint}
                    >
                        <Printer className="w-5 h-5 mr-3" /> Imprimir Nota de Entrada
                    </button>
                </div>
                <div className="flex justify-between mb-10 border-b-4 border-blue-600">
                    <h2 className="text-4xl font-extrabold text-gray-900 flex items-center">
                        <FileText className="w-10 h-10 mr-4 text-blue-600" />
                        <span className='tracking-wide'>NOTA DE ENTRADA</span>
                    </h2>

                    {/* Placeholder de Logo - Asegúrate de que la ruta sea correcta */}
                    <div className="h-20 w-54 flex items-center justify-center text-xs text-gray-600 font-semibold">
                        <img
                            src="/assets/LOGO.png"
                            alt="Logo de la Compañía"
                            className='max-h-full max-w-full object-contain'
                            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentElement.innerHTML = 'LOGO AQUÍ'; }}
                        />
                    </div>
                </div>

                {/* DETALLES GENERALES */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-base mb-10 p-5 border border-blue-200 rounded-xl bg-blue-50/70">
                    <div className="flex">
                        <Calendar className="w-5 h-5 mr-3 text-blue-600" />
                        <div>
                            <strong className="block text-gray-700 font-bold text-sm">Fecha:</strong>
                            <span className="text-gray-900 text-lg">{formattedDate}</span>
                        </div>
                    </div>
                    <div className="flex">
                        <Send className="w-5 h-5 mr-3 text-blue-600" />
                        <div>
                            <strong className="block text-gray-700 font-bold text-sm">Dirigido A:</strong>
                            <span className="text-gray-900 text-lg">{notaData.dirigidaA || notaData.DirigidaA}</span>
                        </div>
                    </div>
                    <div className="flex">
                        <Settings className="w-5 h-5 mr-3 text-blue-600" />
                        <div>
                            <strong className="block text-gray-700 font-bold text-sm">Técnico/Responsable:</strong>
                            <span className="text-gray-900 text-lg">{notaData.tecnico || notaData.Tecnico}</span>
                        </div>
                    </div>
                    <div className="flex">
                        <User className="w-5 h-5 mr-3 text-blue-600" />
                        <div>
                            <strong className="block text-gray-700 font-bold text-sm">Autorizante:</strong>
                            <span className="text-gray-900 text-lg">{autorizanteName}</span>
                        </div>
                    </div>
                </div>

                {/* TABLA DE ÍTEMS */}
                <h4 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-gray-300 pb-2">📦 Equipos Entregados</h4>

                <div className="ovposition: absolute;
        width: 100%;0">
                    <table className="min-w-full divide-y divide-gray-20low-x-auto shadow-xl rounded-lg border border-gray-0 table-print text-base">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider w-[8%] rounded-tl-lg">Unidad</th>
                                <th className="px-4 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider w-[32%]">Equipo / Ítem</th>
                                <th className="px-4 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider w-[25%]">Serial</th>
                                <th className="px-4 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider w-[25%]">Usuario Destino</th>
                                <th className="px-4 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider w-[10%] rounded-tr-lg">SD</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {items.map((item, index) => (
                                <tr key={index} className="hover:bg-blue-50 transition duration-100">
                                    <td className="px-4 py-3 text-sm font-medium text-center text-gray-900">{item.Unidad}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{item.Equipo}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700 font-mono">{item.Serial}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{item.Usuario}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{item.SD}</td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-4 py-4 text-center text-gray-500 italic">No hay ítems registrados en esta nota.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* FIRMAS */}
                <div className="firma-finalnota text-sm pt-8 grid grid-cols-2 gap-12">
                    <div className="text-center">
                        <p className="text-lg font-semibold mb-1 text-gray-800">{autorizanteName}</p>
                        <p className="border-t-2 border-gray-500 font-bold pt-1 uppercase text-lg w-full inline-block">Firma del Autorizante</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-semibold mb-1 text-gray-500">.</p>
                        <p className="border-t-2 border-gray-500 font-bold pt-1 uppercase text-lg w-full inline-block">Recibí Conforme / Firma y Aclaración</p>
                    </div>
                </div>

                {/* Pie de Página (Solo en Pantalla) */}
                <div className="mt-12 text-center text-xs text-gray-400 no-print">
                    Documento generado el {new Date().toLocaleDateString('es-ES')}.
                </div>

            </div></>
    );
};
export default VerNotaEntrada;