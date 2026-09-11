import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiPatch, hasRol } from "../utils/api";

const AprobacionesPendientes = ({ usuario }) => {
  const [pendientesTotales, setPendientesTotales] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [cargando, setCargando] = useState(true);
  const tamañoPagina = 10;

  const esAdmin = hasRol("Admin") || usuario?.rol === "Admin";

  const fetchPendientes = async () => {
    setCargando(true);
    try {
      const [salidasData, entradasData] = await Promise.all([
        apiGet(`/api/NotasSalida`),
        apiGet(`/api/NotasEntrada`)
      ]);

      const salidasPendientes = (salidasData || [])
        .filter((n) => !n.recibido && !n.Recibido)
        .map((n) => ({ ...n, tipo: "Salida" }));

      const entradasPendientes = (entradasData || [])
        .filter((n) => !n.recibido && !n.Recibido)
        .map((n) => ({ ...n, tipo: "Entrada" }));

      const combinadas = [...salidasPendientes, ...entradasPendientes];

      combinadas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      setPendientesTotales(combinadas);
    } catch (err) {
      console.error("Error al cargar pendientes:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchPendientes();
  }, []);

  useEffect(() => {
    let filtradas = [...pendientesTotales];

    if (filtro.trim() !== "") {
      const f = filtro.toLowerCase();
      filtradas = filtradas.filter(
        (n) =>
          n.dirigidaA?.toLowerCase().includes(f) ||
          n.tecnico?.toLowerCase().includes(f) ||
          n.autorizante?.nombre?.toLowerCase().includes(f) ||
          n.tipo.toLowerCase().includes(f) ||
          (n.items &&
            n.items.some(
              (i) =>
                i.equipo?.toLowerCase().includes(f) ||
                i.usuario?.toLowerCase().includes(f) ||
                i.serial?.toLowerCase().includes(f) ||
                i.sd?.toLowerCase().includes(f)
            ))
      );
    }

    setPendientes(filtradas);
    setPaginaActual(1);
  }, [filtro, pendientesTotales]);

  const handleAprobar = async (id, tipo, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const endpoint = tipo === "Salida" ? `/api/NotasSalida/${id}/aprobar` : `/api/NotasEntrada/${id}/aprobar`;
      await apiPatch(endpoint);
      await fetchPendientes();
    } catch (err) {
      console.error(`Error al aprobar la ${tipo}:`, err);
    }
  };

  const totalPaginas = Math.ceil(pendientes.length / tamañoPagina) || 1;
  const inicio = (paginaActual - 1) * tamañoPagina;
  const notasPagina = pendientes.slice(inicio, inicio + tamañoPagina);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-800 flex items-center gap-3">
        <i className="bi bi-clock-history"></i> Pendientes de Aprobación
      </h2>

      <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 mb-6">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Buscar por tipo, técnico, destino, ítem..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
        </div>
      </form>

      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="min-w-full divide-y divide-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border-r text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Tipo</th>
              <th className="p-3 border-r text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Fecha</th>
              <th className="p-3 border-r text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Dirigido A</th>
              <th className="p-3 border-r text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Técnico</th>
              <th className="p-3 border-r text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Autorizante</th>
              <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cargando ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500 bg-white">
                  Cargando notas pendientes...
                </td>
              </tr>
            ) : notasPagina.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500 bg-white">
                  No hay notas pendientes de aprobación
                </td>
              </tr>
            ) : (
              notasPagina.map((nota) => (
                <tr key={`${nota.tipo}-${nota.id}`} className="hover:bg-blue-50/50 transition duration-100">
                  <td className="p-3 border-r whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${nota.tipo === "Salida" ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"}`}>
                      {nota.tipo === "Salida" ? <i className="bi bi-arrow-up-right"></i> : <i className="bi bi-arrow-down-left"></i>}
                      {nota.tipo}
                    </span>
                  </td>
                  <td className="p-3 border-r whitespace-nowrap">
                    {new Date(nota.fecha).toLocaleDateString()}
                  </td>
                  <td className="p-3 border-r">{nota.dirigidaA}</td>
                  <td className="p-3 border-r">{nota.tecnico}</td>
                  <td className="p-3 border-r">{nota.autorizante?.nombre || nota.autorizante}</td>

                  <td className="p-3 flex items-center gap-2">
                    <Link
                      to={nota.tipo === "Salida" ? `/salidas/vernotasalida/${nota.id}` : `/entradas/vernotaentrada/${nota.id}`}
                      className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-blue-100 transition duration-150"
                    >
                      <i className="bi bi-eye"></i> Ver
                    </Link>

                    {esAdmin && (
                      <button
                        onClick={(e) => handleAprobar(nota.id, nota.tipo, e)}
                        className="px-3 py-1 text-xs border border-green-500 rounded text-green-700 hover:bg-green-100 transition duration-150"
                      >
                        <i className="bi bi-check2-circle"></i> Aprobar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Paginacion
        totalPaginas={totalPaginas}
        paginaActual={paginaActual}
        setPaginaActual={setPaginaActual}
      />
    </div>
  );
};

function Paginacion({ totalPaginas, paginaActual, setPaginaActual }) {
  if (totalPaginas <= 1) return null;

  const rango = 2;
  let paginas = [];

  for (let i = Math.max(1, paginaActual - rango); i <= Math.min(totalPaginas, paginaActual + rango); i++) {
    paginas.push(i);
  }

  const mostrarPrimero = paginas[0] > 1;
  const mostrarUltimo = paginas[paginas.length - 1] < totalPaginas;

  return (
    <nav className="mt-6 flex justify-center">
      <ul className="flex items-center space-x-2 text-sm">
        <li>
          <button disabled={paginaActual === 1} onClick={() => setPaginaActual(paginaActual - 1)} className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition duration-150">«</button>
        </li>
        {mostrarPrimero && (
          <>
            <li><button onClick={() => setPaginaActual(1)} className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">1</button></li>
            <li><span className="px-2 text-gray-500">…</span></li>
          </>
        )}
        {paginas.map((num) => (
          <li key={num}>
            <button onClick={() => setPaginaActual(num)} className={`px-3 py-1 border rounded-lg transition duration-150 ${num === paginaActual ? "bg-blue-600 text-white border-blue-600 shadow-md" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}>
              {num}
            </button>
          </li>
        ))}
        {mostrarUltimo && (
          <>
            <li><span className="px-2 text-gray-500">…</span></li>
            <li><button onClick={() => setPaginaActual(totalPaginas)} className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">{totalPaginas}</button></li>
          </>
        )}
        <li>
          <button disabled={paginaActual === totalPaginas} onClick={() => setPaginaActual(paginaActual + 1)} className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition duration-150">»</button>
        </li>
      </ul>
    </nav>
  );
}

export default AprobacionesPendientes;