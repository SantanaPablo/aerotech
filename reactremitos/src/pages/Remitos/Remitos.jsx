import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, PlusCircle, Eye, Pencil } from "lucide-react";
import { apiGet } from "../../utils/api";

const Remitos = () => {
  const [remitosTotales, setRemitosTotales] = useState([]);
  const [remitos, setRemitos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const tamañoPagina = 10;

  useEffect(() => {
    const fetchRemitos = async () => {
      try {
        const data = await apiGet('/api/Remitos');
        setRemitosTotales(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRemitos();
  }, []);

  useEffect(() => {
    let filtrados = [...remitosTotales];

    if (filtro.trim() !== "") {
      const f = filtro.toLowerCase();
      filtrados = filtrados.filter(
        (r) =>
          r.numero?.toLowerCase().includes(f) ||
          r.destino?.toLowerCase().includes(f) ||
          (r.items &&
            r.items.some(
              (i) =>
                i.descripcion?.toLowerCase().includes(f) ||
                i.serial?.toLowerCase().includes(f) ||
                i.usuario?.toLowerCase().includes(f)
            ))
      );
    }

    filtrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    setRemitos(filtrados);
    setPaginaActual(1);
  }, [filtro, remitosTotales]);

  const totalPaginas = Math.ceil(remitos.length / tamañoPagina);
  const inicio = (paginaActual - 1) * tamañoPagina;
  const remitosPagina = remitos.slice(inicio, inicio + tamañoPagina);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-800 flex items-center gap-3">
        <PlusCircle className="text-blue-600 w-7 h-7" />
        Remitos
      </h2>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex gap-2 mb-4 items-center"
      >
        <input
          type="text"
          placeholder="Buscar por número, destino, serial, usuario..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2"
        >
          <Search size={18} /> Buscar
        </button>
      </form>

      <Link
        to="/remitos/crearremito"
        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg mb-6 shadow-md transition duration-150"
      >
        <PlusCircle size={18} /> Nuevo Remito
      </Link>

      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-semibold uppercase tracking-wide text-gray-600">
                Número
              </th>
              <th className="p-3 text-left font-semibold uppercase tracking-wide text-gray-600">
                Fecha
              </th>
              <th className="p-3 text-left font-semibold uppercase tracking-wide text-gray-600">
                Destino
              </th>
              <th className="p-3 text-left font-semibold uppercase tracking-wide text-gray-600">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {remitosPagina.map((r) => (
              <tr
                key={r.id}
                className="hover:bg-blue-50 transition duration-100"
              >
                <td className="p-3">{r.numero}</td>
                <td className="p-3">
                  {new Date(r.fecha).toLocaleDateString()}
                </td>
                <td className="p-3">{r.destino}</td>
                <td className="p-3 flex gap-2">
                  <Link
                    to={`/remitos/verremito/${r.id}`}
                    className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-blue-100 flex items-center gap-1"
                  >
                    <Eye size={16} /> Ver
                  </Link>
                  <Link
                    to={`/remitos/editarremito/${r.id}`}
                    className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-blue-100 flex items-center gap-1"
                  >
                    <Pencil size={16} /> Editar
                  </Link>
                </td>
              </tr>
            ))}
            {remitosPagina.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="p-6 text-center text-gray-500 bg-white"
                >
                  No se encontraron remitos
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

function Paginacion({ totalPaginas, paginaActual, setPaginaActual }) {
  if (totalPaginas <= 1) return null;
  const rango = 2;
  const paginas = [];

  for (
    let i = Math.max(1, paginaActual - rango);
    i <= Math.min(totalPaginas, paginaActual + rango);
    i++
  ) {
    paginas.push(i);
  }

  return (
    <nav className="mt-6 flex justify-center">
      <ul className="flex items-center space-x-2 text-sm">
        <li>
          <button
            disabled={paginaActual === 1}
            onClick={() => setPaginaActual(paginaActual - 1)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            «
          </button>
        </li>

        {paginas.map((num) => (
          <li key={num}>
            <button
              onClick={() => setPaginaActual(num)}
              className={`px-3 py-1 border rounded-lg transition ${
                num === paginaActual
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {num}
            </button>
          </li>
        ))}

        <li>
          <button
            disabled={paginaActual === totalPaginas}
            onClick={() => setPaginaActual(paginaActual + 1)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            »
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Remitos;