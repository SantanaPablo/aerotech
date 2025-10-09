
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Salidas = () => {
  const [notasTotales, setNotasTotales] = useState([]);
  const [notas, setNotas] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const tamañoPagina = 10;

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchNotas = async () => {
      try {

        const resp = await fetch(`${API_URL}/api/NotasSalida`);
        if (!resp.ok) throw new Error("Error al cargar notas");
        const data = await resp.json();
        setNotasTotales(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotas();
  }, [API_URL]);

  useEffect(() => {
    let filtradas = [...notasTotales];

    if (filtro.trim() !== "") {
      const f = filtro.toLowerCase();
      filtradas = filtradas.filter(
        (n) =>
          n.dirigidaA?.toLowerCase().includes(f) ||
          n.tecnico?.toLowerCase().includes(f) ||
          n.autorizante?.nombre?.toLowerCase().includes(f) ||
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

    filtradas.sort((a, b) => b.id - a.id);

    setNotas(filtradas);
    setPaginaActual(1); // resetear página al buscar
  }, [filtro, notasTotales]);

  const totalPaginas = Math.ceil(notas.length / tamañoPagina);
  const inicio = (paginaActual - 1) * tamañoPagina;
  const notasPagina = notas.slice(inicio, inicio + tamañoPagina);

  return (
    <div className="p-6 bg-gray-50 min-h-screen"> {/* Added bg and min-h for better page context */}
      <h2 className="text-3xl font-extrabold mb-6 text-gray-800 flex items-center gap-3"> {/* Slightly larger/bolder title */}
        <i className="bi bi-journal-text"></i> Notas de Salida
      </h2>

      {/* 🔍 Filtro */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex gap-2 mb-4" // Simplified grid layout
      >
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Buscar por técnico, destino, ítem..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
        </div>
        <div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-150 ease-in-out shadow-md"
          >
            <i className="bi bi-search"></i> Buscar
          </button>
        </div>
      </form>

      {/* ➕ Nueva nota */}
      <Link
        to="/salidas/crearnotasalida"
        className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mb-6 transition duration-150 ease-in-out shadow-md"
      >
        <i className="bi bi-plus-circle"></i> Nueva Nota de Salida
      </Link>

      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="min-w-full divide-y divide-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border-r text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Fecha</th>
              <th className="p-3 border-r text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Dirigido A</th>
              <th className="p-3 border-r text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Técnico</th>
              <th className="p-3 border-r text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Autorizante</th>
              <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {notasPagina.map((nota) => (
              <tr key={nota.id} className="hover:bg-blue-50/50 transition duration-100">
                <td className="p-3 border-r whitespace-nowrap">
                  {new Date(nota.fecha).toLocaleDateString()}
                </td>
                <td className="p-3 border-r">{nota.dirigidaA}</td>
                <td className="p-3 border-r">{nota.tecnico}</td>
                <td className="p-3 border-r">{nota.autorizante?.nombre}</td>
                <td className="p-3">
                  <Link
                    to={`/salidas/vernotasalida/${nota.id}`}
                    // Enhanced button style
                    className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-blue-100 transition duration-150"
                  >
                    <i className="bi bi-eye"></i> Ver
                  </Link>
                </td>
              </tr>
            ))}

            {notasPagina.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500 bg-white">
                  No se encontraron notas
                </td>
              </tr>
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

// Paginacion component (no changes needed, as it was already well-styled)
function Paginacion({ totalPaginas, paginaActual, setPaginaActual }) {
  if (totalPaginas <= 1) return null;

  const rango = 2;
  let paginas = [];

  for (
    let i = Math.max(1, paginaActual - rango);
    i <= Math.min(totalPaginas, paginaActual + rango);
    i++
  ) {
    paginas.push(i);
  }

  const mostrarPrimero = paginas[0] > 1;
  const mostrarUltimo = paginas[paginas.length - 1] < totalPaginas;

  return (
    <nav className="mt-6 flex justify-center"> {/* Adjusted margin for spacing */}
      <ul className="flex items-center space-x-2 text-sm"> {/* Adjusted spacing */}
        <li>
          <button
            disabled={paginaActual === 1}
            onClick={() => setPaginaActual(paginaActual - 1)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition duration-150"
          >
            «
          </button>
        </li>

        {mostrarPrimero && (
          <>
            <li>
              <button
                onClick={() => setPaginaActual(1)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                1
              </button>
            </li>
            <li>
              <span className="px-2 text-gray-500">…</span>
            </li>
          </>
        )}

        {paginas.map((num) => (
          <li key={num}>
            <button
              onClick={() => setPaginaActual(num)}
              className={`px-3 py-1 border rounded-lg transition duration-150 ${num === paginaActual
                ? "bg-blue-600 text-white border-blue-600 shadow-md" // Highlight active page
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
            >
              {num}
            </button>
          </li>
        ))}

        {mostrarUltimo && (
          <>
            <li>
              <span className="px-2 text-gray-500">…</span>
            </li>
            <li>
              <button
                onClick={() => setPaginaActual(totalPaginas)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                {totalPaginas}
              </button>
            </li>
          </>
        )}

        <li>
          <button
            disabled={paginaActual === totalPaginas}
            onClick={() => setPaginaActual(paginaActual + 1)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-1F00 disabled:opacity-50 transition duration-150"
          >
            »
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Salidas;