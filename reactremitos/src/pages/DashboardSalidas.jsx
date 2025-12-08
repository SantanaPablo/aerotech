import React, { useState, useEffect, useMemo } from 'react';
import { apiGet } from '../utils/api'; 
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const obtenerCategoria = (descripcion = "") => {
  const desc = descripcion.toLowerCase();
  if (desc.includes("monitor") || desc.includes("pantalla")) return "Monitores";
  if (desc.includes("pc") || desc.includes("cpu") || desc.includes("optiplex") || desc.includes("3010")) return "Computadoras";
  if (desc.includes("notebook") || desc.includes("laptop") || desc.includes("thinkpad") || desc.includes("l14")) return "Notebooks";
  if (desc.includes("teclado") || desc.includes("mouse") || desc.includes("raton")) return "Periféricos";
  if (desc.includes("toner") || desc.includes("tinta")) return "Insumos";
  if (desc.includes("cisco") || desc.includes("telefono")) return "Telefonía";
  if (desc.includes("cable") || desc.includes("adaptador")) return "Conectividad";
  return "Otros"; 
};

const extraerNombre = (valor) => {
  if (!valor) return 'Desconocido';
  if (typeof valor === 'object') return valor.nombre || 'Usuario s/n'; 
  return valor; 
};

const COLORES = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#FF4560'];

export default function DashboardSalidas({ token }) {
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [busqueda, setBusqueda] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiGet('/api/NotasSalida', token);
        setNotas(data || []);
      } catch (error) {
        console.error("Error cargando salidas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // --- PROCESAMIENTO DE DATOS ---
  const movimientos = useMemo(() => {
    if (!notas.length) return [];

    return notas.flatMap(nota => {
      if (!nota.items) return [];

      return nota.items.map(item => ({
        id: item.id,
        notaId: nota.id,
        fecha: nota.fecha ? nota.fecha.split('T')[0] : 'S/F',
        
        tecnico: extraerNombre(nota.tecnico),      
        autorizante: extraerNombre(nota.autorizante), 
        destino: nota.dirigidaA || 'General',
        
        codigo: item.serial || 'S/N', 
        descripcion: item.equipo || '', 
        cantidad: parseInt(item.unidad) || 1, 
        
        categoria: obtenerCategoria(item.equipo || '')
      }));
    });
  }, [notas]);

  const datosFiltrados = useMemo(() => {
    let data = movimientos;

    if (busqueda) {
      const termino = busqueda.toLowerCase();
      data = data.filter(m => 
        m.descripcion.toLowerCase().includes(termino) ||
        String(m.tecnico).toLowerCase().includes(termino) || 
        String(m.autorizante).toLowerCase().includes(termino) ||
        m.categoria.toLowerCase().includes(termino) ||
        String(m.destino).toLowerCase().includes(termino)
      );
    }

    if (fechaDesde) data = data.filter(m => m.fecha >= fechaDesde);
    if (fechaHasta) data = data.filter(m => m.fecha <= fechaHasta);

    return data;
  }, [busqueda, fechaDesde, fechaHasta, movimientos]);

  const datosTiempo = useMemo(() => {
    const agrupado = datosFiltrados.reduce((acc, curr) => {
      acc[curr.fecha] = (acc[curr.fecha] || 0) + curr.cantidad;
      return acc;
    }, {});
    return Object.keys(agrupado).sort().map(f => ({ fecha: f, cantidad: agrupado[f] }));
  }, [datosFiltrados]);
  const datosTecnicos = useMemo(() => {
    const conteo = datosFiltrados.reduce((acc, curr) => {
      const key = curr.tecnico; 
      acc[key] = (acc[key] || 0) + curr.cantidad;
      return acc;
    }, {});
    return Object.keys(conteo)
      .map(k => ({ name: k, value: conteo[k] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [datosFiltrados]);

  const datosAutorizantes = useMemo(() => {
    const conteo = datosFiltrados.reduce((acc, curr) => {
      const key = curr.autorizante; 
      // Contamos cantidad de items autorizados (o puedes contar +1 si prefieres contar operaciones)
      acc[key] = (acc[key] || 0) + curr.cantidad;
      return acc;
    }, {});
    return Object.keys(conteo)
      .map(k => ({ name: k, value: conteo[k] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5
  }, [datosFiltrados]);

  const datosCategorias = useMemo(() => {
    const conteo = datosFiltrados.reduce((acc, curr) => {
      acc[curr.categoria] = (acc[curr.categoria] || 0) + curr.cantidad;
      return acc;
    }, {});
    return Object.keys(conteo)
      .map(k => ({ name: k, value: conteo[k] }))
      .sort((a, b) => b.value - a.value);
  }, [datosFiltrados]);

  if (loading) return <div className="p-10 text-center text-gray-500">Cargando datos...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6 animate-fade-in">
      
      {/* HEADER */}
      <div className="bg-white p-4 rounded shadow flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panel de Salidas</h1>
          <p className="text-sm text-gray-500">Control de equipos entregados</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar..."
            className="border p-2 rounded outline-none w-full"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
          <h3 className="text-gray-400 text-xs font-bold uppercase">Total Equipos</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {datosFiltrados.reduce((acc, curr) => acc + curr.cantidad, 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow border-l-4 border-green-500">
          <h3 className="text-gray-400 text-xs font-bold uppercase">Técnico Top</h3>
          <p className="text-lg font-bold text-gray-800 mt-1 truncate">
            {datosTecnicos[0]?.name || "-"}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow border-l-4 border-purple-500">
          <h3 className="text-gray-400 text-xs font-bold uppercase">Autorizante Top</h3>
          <p className="text-lg font-bold text-gray-800 mt-1 truncate">
            {datosAutorizantes[0]?.name || "-"}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow border-l-4 border-orange-500">
          <h3 className="text-gray-400 text-xs font-bold uppercase">Categoría Top</h3>
          <p className="text-lg font-bold text-gray-800 mt-1 truncate">
            {datosCategorias[0]?.name || "-"}
          </p>
        </div>
      </div>

      {/* GRÁFICO TIEMPO */}
      <div className="bg-white p-6 rounded shadow h-80 w-full">
        <h3 className="font-bold text-gray-700 mb-4">Cronología de Entregas</h3>
        {datosTiempo.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datosTiempo}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="fecha" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="cantidad" stroke="#3B82F6" strokeWidth={3} dot={{r:4}} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">Sin datos</div>
        )}
      </div>

      {/* COMPARATIVA DE PERSONAS (Técnicos vs Autorizantes) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* TOP TÉCNICOS */}
        <div className="bg-white p-6 rounded shadow h-80 w-full">
          <h3 className="font-bold text-gray-700 mb-4">Top 5 Técnicos (Retiros)</h3>
          {datosTecnicos.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={datosTecnicos} margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} style={{fontSize: '11px'}} />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (<div className="flex h-full items-center justify-center text-gray-400">Sin datos</div>)}
        </div>

        {/* TOP AUTORIZANTES (NUEVO) */}
        <div className="bg-white p-6 rounded shadow h-80 w-full">
          <h3 className="font-bold text-gray-700 mb-4">Top 5 Autorizantes (Firmas)</h3>
          {datosAutorizantes.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={datosAutorizantes} margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} style={{fontSize: '11px'}} />
                <Tooltip />
                {/* Usamos un color violeta para diferenciar de los técnicos */}
                <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (<div className="flex h-full items-center justify-center text-gray-400">Sin datos</div>)}
        </div>

      </div>

      {/* GRÁFICO CATEGORÍAS + TABLA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CATEGORÍAS (1/3 ancho) */}
        <div className="bg-white p-6 rounded shadow h-96 w-full flex flex-col">
          <h3 className="font-bold text-gray-700 mb-2">Distribución por Tipo</h3>
          <div className="flex-grow">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={datosCategorias} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                   {datosCategorias.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                   ))}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="overflow-y-auto max-h-32 text-xs space-y-1">
             {datosCategorias.map((e, i) => (
               <div key={i} className="flex items-center justify-between px-2">
                 <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{background: COLORES[i % COLORES.length]}}></div>
                    <span className="truncate w-24">{e.name}</span>
                 </div>
                 <b>{e.value}</b>
               </div>
             ))}
          </div>
        </div>

        {/* TABLA DETALLE (2/3 ancho) */}
        <div className="bg-white rounded shadow overflow-hidden h-96 lg:col-span-2 flex flex-col">
            <div className="p-4 bg-gray-100 border-b shrink-0"><h3 className="font-bold">Detalle de Registros</h3></div>
            <div className="overflow-auto flex-grow">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs sticky top-0 shadow-sm">
                <tr>
                    <th className="px-6 py-3 bg-gray-50">Fecha</th>
                    <th className="px-6 py-3 bg-gray-50">Técnico</th>
                    <th className="px-6 py-3 bg-gray-50">Equipo</th>
                    <th className="px-6 py-3 bg-gray-50">Destino</th>
                    <th className="px-6 py-3 bg-gray-50 text-center">Cant.</th>
                    <th className="px-6 py-3 bg-gray-50">Autorizó</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {[...datosFiltrados].reverse().slice(0, 50).map((m, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-3 whitespace-nowrap">{m.fecha}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{m.tecnico}</td>
                    <td className="px-6 py-3">
                        <div className="truncate max-w-[150px]" title={m.descripcion}>{m.descripcion}</div>
                        <div className="text-xs text-gray-400">{m.codigo}</div>
                    </td>
                    <td className="px-6 py-3 truncate max-w-[100px]" title={m.destino}>{m.destino}</td>
                    <td className="px-6 py-3 text-center font-bold">{m.cantidad}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-blue-600">{m.autorizante}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
      </div>

    </div>
  );
}