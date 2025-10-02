import React, { useState, useEffect } from 'react';
// Se asume que react-router-dom está disponible en el entorno.
import { useParams } from 'react-router-dom'; 
import { Printer, FileText, Loader2, User, AlertTriangle } from 'lucide-react';
const API_BASE_URL = 'http://localhost:5003/api'; 

const fetchNotaById = async (id) => {
    // Implementar lógica de reintento con backoff si fuera necesario
    const noteResponse = await fetch(`${API_BASE_URL}/NotasSalida/${id}`);
    
    if (!noteResponse.ok) {
        if (noteResponse.status === 404) {
            return null; // Nota no encontrada
        }
        throw new Error(`Error fetching note details (Status: ${noteResponse.status})`);
    }
    const nota = await noteResponse.json();

    const itemsResponse = await fetch(`${API_BASE_URL}/ItemSalidas/por-notasalida/${id}`);
    
    if (!itemsResponse.ok) {
        throw new Error(`Error fetching note items (Status: ${itemsResponse.status})`);
    }
    const items = await itemsResponse.json();

    // Devolver datos combinados
    return {
        ...nota,
        Items: items,
        // Adaptación para Autorizante (Usuario)
        Usuario: nota.autorizante || nota.Autorizante,
    };
};

// --- COMPONENTE PRINCIPAL ---

const VerNotaSalida = () => {
    // 1. Obtener el ID de la URL usando el hook real
    const { id } = useParams();
    const notaId = id; // El ID de la nota a cargar
    
    const [notaData, setNotaData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            if (!notaId) {
                // Esto ocurrirá si la URL no incluye un parámetro ID
                setError("ID de nota no proporcionado en la URL.");
                setLoading(false);
                return;
            }
            
            setLoading(true);
            setError(null);
            
            try {
                // El ID de la URL viene como string, lo parseamos si la API lo requiere numérico, aunque fetch lo acepta como parte del string URL
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

    if (error) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen">
                <div className="p-6 bg-white rounded-xl shadow-xl border border-red-300">
                    <h2 className="text-2xl font-bold text-red-600 flex items-center">
                        <AlertTriangle className="w-6 h-6 mr-2" /> Error de Carga
                    </h2>
                    <p className="mt-2 text-gray-700">No se pudo cargar la nota (ID: {notaId}).</p>
                    <p className="mt-2 text-sm text-red-500">Detalle: {error}</p>
                    <p className="mt-4 text-sm text-gray-500">Asegúrate de que el backend esté corriendo en `{API_BASE_URL}`.</p>
                </div>
            </div>
        );
    }

    if (!notaData || !notaData.Usuario) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen">
                <div className="p-6 bg-white rounded-xl shadow-xl border border-yellow-300">
                    <h2 className="text-2xl font-bold text-yellow-600 flex items-center">
                        <AlertTriangle className="w-6 h-6 mr-2" /> Nota No Encontrada
                    </h2>
                    <p className="mt-2 text-gray-700">La nota de salida con ID **{notaId}** no existe o faltan datos esenciales (Autorizante).</p>
                </div>
            </div>
        );
    }

    // Mapeo seguro de propiedades
    const rawDate = notaData.Fecha || notaData.fecha; 
    const formattedDate = rawDate ? new Date(rawDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';
    
    // Aseguramos mayúsculas/minúsculas de Autorizante
    const autorizanteName = `${notaData.Usuario.Nombre || notaData.Usuario.nombre}`;
    const notaIdDisplay = notaData.id || notaData.Id || notaId;
    
    const items = notaData.Items?.map(item => ({
        Unidad: item.unidad || item.Unidad,
        Equipo: item.equipo || item.Equipo,
        Serial: item.serial || item.Serial,
        Usuario: item.usuario || item.Usuario,
        SD: item.sd || item.SD,
    })) || [];

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen font-sans">
            {/* 2. Estilos para Impresión (Mantenidos en <style> dentro del JSX para el Single File Mandate) */}
            

            <button 
                className="no-print flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg mb-6 transition duration-300 transform hover:scale-105"
                onClick={handlePrint}
            >
                <Printer className="w-5 h-5 mr-3" /> Imprimir Documento
            </button>

            <div className="print-content p-6 sm:p-8 bg-white rounded-xl shadow-2xl border border-gray-100">
                

                <div className="flex justify-between items-start mb-8 border-b-4 border-blue-500 pb-4">
                    <h2 className="text-4xl font-extrabold text-gray-900 flex items-center">
                        <FileText className="w-8 h-8 mr-3 text-blue-600" /> NOTA DE SALIDA
                    </h2>
                    <div className="h-20 w-32 flex items-center justify-center border-2 border-gray-300 rounded-xl text-xs text-gray-600 bg-gray-50 font-semibold p-2 shadow-inner">
                        <img 
                        src="/assets/LOGO.png"
                        alt="Logo" 
                        style={{ maxHeight: '120px' }} 
                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} 
                    />
                    </div>
                </div>

                {/* Detalles Generales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-base mb-10 p-4 border border-gray-200 rounded-lg bg-blue-50/50">
                    <div className="border-l-4 border-blue-400 pl-3">
                        <strong className="block text-gray-700 font-semibold">Fecha:</strong> 
                        <span className="text-gray-900">{formattedDate}</span>
                    </div>
                    <div className="border-l-4 border-blue-400 pl-3">
                        <strong className="block text-gray-700 font-semibold">Dirigido A:</strong> 
                        <span className="text-gray-900">{notaData.dirigidaA || notaData.DirigidaA}</span>
                    </div>
                    <div className="border-l-4 border-blue-400 pl-3">
                        <strong className="block text-gray-700 font-semibold">Técnico/Responsable:</strong> 
                        <span className="text-gray-900">{notaData.tecnico || notaData.Tecnico}</span>
                    </div>
                    <div className="border-l-4 border-blue-400 pl-3">
                        <strong className="block text-gray-700 font-semibold flex items-center">
                            <User className="w-4 h-4 mr-1 text-blue-600"/> Autorizante:
                        </strong> 
                        <span className="text-gray-900">{autorizanteName}</span>
                    </div>
                </div>

                {/* Tabla de Ítems */}
                <h4 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">Material / Equipos Entregados</h4>
                
                <div className="overflow-x-auto shadow-xl rounded-lg border border-gray-100">
                    <table className="min-w-full divide-y divide-gray-200 table-print text-base">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider w-1/12 rounded-tl-lg">Unidad</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider w-3/12">Equipo / Ítem</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider w-3/12">Serial</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider w-3/12">Usuario Destino</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider w-2/12 rounded-tr-lg">SD</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {items.map((item, index) => (
                                <tr key={index} className="hover:bg-blue-50 transition duration-100">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.Unidad}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{item.Equipo}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-mono">{item.Serial}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{item.Usuario}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{item.SD}</td>
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

                {/* Firmas */}
                <div className="firma-finalnota text-sm mt-16 pt-8 grid grid-cols-2 gap-12">
                    <div className="text-center">
                        <p className="text-lg font-semibold mb-1 text-gray-800">{autorizanteName}</p>
                        <p className="border-t border-black font-bold pt-1 uppercase">Firma del Autorizante</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-semibold mb-1 text-gray-500"></p>
                        <p className="border-t border-black font-bold pt-1 uppercase">Firma / Recibí Conforme</p>
                    </div>
                </div>
                
                <div className="mt-12 text-center text-xs text-gray-400 no-print">
                    Documento generado el {new Date().toLocaleDateString()}
                </div>
            </div>
        </div>
    );
};

export default VerNotaSalida;
