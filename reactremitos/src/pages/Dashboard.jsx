import React, { useState, useEffect, useMemo } from 'react';
import { getToken, apiGet, apiPut } from '../utils/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

export default function Dashboard({ token }) {
  const [remitos, setRemitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiGet('/api/Remitos', token);
        setRemitos(data || []);
      } catch (error) {
        console.error("Error al cargar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const movimientos = useMemo(() => {
    if (!remitos.length) return [];

    return remitos.flatMap(remito => {
      if (!remito.items) return [];

      return remito.items.map(item => ({
        id: item.id,
        remitoId: remito.id,
        fecha: remito.fecha ? remito.fecha.split('T')[0] : 'S/F',
        cliente: remito.destino || 'Desconocido',
        codigo: item.codigo,
        descripcion: item.descripcion || '',
        cantidad: item.cantidad || 0
      }));
    });
  }, [remitos]);

  const datosFiltrados = useMemo(() => {
    if (!busqueda) return movimientos;
    
    const termino = busqueda.toLowerCase();
    return movimientos.filter(m => 
      m.descripcion.toLowerCase().includes(termino) ||
      (m.codigo && m.codigo.toLowerCase().includes(termino)) || 
      m.cliente.toLowerCase().includes(termino)
    );
  }, [busqueda, movimientos]);

  // 3. AGRUPAR PARA GRÁFICO: Sumar cantidades por fecha
  const datosGrafico = useMemo(() => {
    const agrupado = datosFiltrados.reduce((acc, curr) => {
      const fecha = curr.fecha;
      if (!acc[fecha]) acc[fecha] = 0;
      acc[fecha] += curr.cantidad;
      return acc;
    }, {});

    return Object.keys(agrupado)
      .sort()
      .map(fecha => ({
        fecha,
        cantidad: agrupado[fecha]
      }));
  }, [datosFiltrados]);

  const totalSalidas = datosFiltrados.reduce((acc, curr) => acc + curr.cantidad, 0);
  const totalOperaciones = new Set(datosFiltrados.map(d => d.remitoId)).size;

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando métricas...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard de Stock</h1>
          <p className="text-sm text-gray-500">Vista general de movimientos y salidas</p>
        </div>
        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder="Buscar (ej: Dell, Monitor, Cliente...)"
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* TARJETAS KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase">Items Movidos</h3>
          <p className="text-3xl font-bold text-gray-800">{totalSalidas}</p>
          <span className="text-xs text-blue-600">
            {busqueda ? `Coincidencias con "${busqueda}"` : "Total histórico"}
          </span>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase">Remitos Involucrados</h3>
          <p className="text-3xl font-bold text-gray-800">{totalOperaciones}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase">Último Movimiento</h3>
          <p className="text-lg font-bold text-gray-800">
            {datosGrafico.length > 0 ? datosGrafico[datosGrafico.length - 1].fecha : "N/A"}
          </p>
        </div>
      </div>

      {/* GRÁFICO PRINCIPAL */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold text-gray-700 mb-4">
          Tendencia de Salidas: {busqueda || "General"}
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datosGrafico}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="fecha" 
                tick={{fontSize: 12}} 
                tickMargin={10}
              />
              <YAxis allowDecimals={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="cantidad" 
                name="Unidades" 
                stroke="#3B82F6" 
                strokeWidth={3} 
                dot={{r: 4, strokeWidth: 2}} 
                activeDot={{ r: 8 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABLA RESUMEN (TOP 5 RECIENTES DE LA BÚSQUEDA) */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-700">Detalle de movimientos (Recientes)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Descripción</th>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3 text-center">Cant.</th>
                <th className="px-6 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {/* Mostramos los últimos 5 movimientos que coincidan con la búsqueda, invirtiendo el array */}
              {[...datosFiltrados].reverse().slice(0, 10).map((mov, index) => (
                <tr key={`${mov.remitoId}-${mov.id}-${index}`} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{mov.fecha}</td>
                  <td className="px-6 py-4 text-gray-800 font-medium">
                    {mov.descripcion}
                    <span className="block text-xs text-gray-400">{mov.codigo}</span>
                  </td>
                  <td className="px-6 py-4">{mov.cliente}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded">
                      {mov.cantidad}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a href={`/remitos/verremito/${mov.remitoId}`} className="text-blue-600 hover:underline">
                      Ver Remito
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {datosFiltrados.length === 0 && (
            <div className="p-6 text-center text-gray-400">
              No se encontraron movimientos con ese criterio.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}