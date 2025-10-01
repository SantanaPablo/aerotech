import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

// Asume que esta variable está definida en tu entorno (ej: .env file en Vite/Create React App)
const API_BASE_URL = import.meta.env.VITE_API_URL; 

/**
 * Componente principal para listar las Notas de Salida.
 * Replica la lógica de filtrado y paginación de la página Razor.
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.token - JWT Token para autenticación.
 */
export default function Salidas({ token }) {
    const [notas, setNotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalPaginas, setTotalPaginas] = useState(1);
    
    // Maneja los parámetros de URL para filtrar y paginar (equivalent al Model.Filtro y Model.PaginaActual)
    const [searchParams, setSearchParams] = useSearchParams();
    const filtro = searchParams.get('filtro') || '';
    const paginaActual = parseInt(searchParams.get('pagina') || '1', 10);
    
    // Estado para el input de búsqueda, permite edición en tiempo real
    const [inputFiltro, setInputFiltro] = useState(filtro); 

    /**
     * Llama a la API para obtener los datos.
     */
    const fetchNotas = useCallback(async (currentFiltro, currentPage) => {
        setLoading(true);
        setError(null);
        
        // Construye la URL con la ruta del controlador NotasSalida
        let url = `${API_BASE_URL}/api/NotasSalida?pagina=${currentPage}`;
        if (currentFiltro) {
            url += `&filtro=${encodeURIComponent(currentFiltro)}`;
        }

        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errText = response.status === 401 ? "Sesión expirada o no autorizada." : response.statusText;
                throw new Error(errText);
            }

            // Asume que la respuesta JSON es similar a:
            // { notas: [{...}], paginaActual: N, totalPaginas: P }
            const data = await response.json(); 
            setNotas(data.notas || []);
            setTotalPaginas(data.totalPaginas || 1);

        } catch (err) {
            console.error("Error fetching NotasSalida:", err);
            setError(err.message || "Error al cargar las notas de salida.");
            setNotas([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Dispara la carga de datos cuando cambian la página o el filtro
    useEffect(() => {
        fetchNotas(filtro, paginaActual);
    }, [filtro, paginaActual, fetchNotas]);
    
    
    /**
     * Maneja el envío del formulario de búsqueda (equivalente a form method="get").
     */
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // Actualiza los parámetros de búsqueda en la URL y resetea la página a 1
        setSearchParams({ pagina: 1, filtro: inputFiltro });
    };

    /**
     * Maneja el cambio de página.
     */
    const handlePageChange = (newPage) => {
        // Mantiene el filtro actual y actualiza solo la página
        setSearchParams({ pagina: newPage, filtro: filtro });
    };

    // Sub-Componente para la Paginación
    const Pagination = () => {
        if (totalPaginas <= 1) return null;
        
        const pages = [];
        for (let i = 1; i <= totalPaginas; i++) {
            pages.push(
                <li key={i} className={`page-item ${i === paginaActual ? 'active' : ''}`}>
                    {/* El atributo asp-route-pagina se traduce a un onClick que actualiza el URL param */}
                    <button 
                        className="page-link" 
                        onClick={() => handlePageChange(i)}
                        disabled={loading}
                    >
                        {i}
                    </button>
                </li>
            );
        }
        return (
            <nav aria-label="Paginación" className="mt-4">
                <ul className="pagination justify-content-center">
                    {pages}
                </ul>
            </nav>
        );
    };

    return (
        <div className="container mt-4">
            <h2><i className="bi bi-journal-text me-2"></i> Notas de Salida</h2>

            {/* Formulario de Búsqueda (Replica <form method="get">) */}
            <form onSubmit={handleSearchSubmit} className="row g-2 mb-4">
                <div className="col-sm-10">
                    <input
                        type="text"
                        name="Filtro"
                        className="form-control"
                        placeholder="Buscar por técnico, destino, etc..."
                        value={inputFiltro}
                        onChange={(e) => setInputFiltro(e.target.value)}
                        disabled={loading}
                    />
                </div>
                <div className="col-sm-2">
                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                        <i className="bi bi-search me-1"></i> Buscar
                    </button>
                </div>
            </form>

            {/* Enlace para Crear Nueva Nota (Replica <a asp-page="/Salidas/CrearNotaSalida">) */}
            <Link to="/salidas/crear" className="btn btn-success mb-3">
                <i className="bi bi-plus-circle me-1"></i> Nueva Nota de Salida
            </Link>

            {/* Mensajes de Estado */}
            {loading && <div className="alert alert-info">Cargando notas...</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            
            {/* Tabla de Datos */}
            <div className="table-responsive">
                <table className="table table-striped table-hover table-bordered">
                    <thead className="table-light">
                        <tr>
                            <th>Fecha</th>
                            <th>Dirigido A</th>
                            <th>Técnico</th>
                            <th>Autorizante</th>
                            <th colSpan="2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notas.length > 0 ? (
                            notas.map((nota) => (
                                <tr key={nota.id}>
                                    {/* Muestra la fecha en formato dd-MM-yyyy */}
                                    <td>{new Date(nota.fecha).toLocaleDateString('es-AR')}</td> 
                                    <td>{nota.dirigidaA}</td>
                                    <td>{nota.tecnico}</td>
                                    {/* Replica @nota.Autorizante?.Nombre */}
                                    <td>{nota.autorizante?.nombre || 'N/A'}</td> 
                                    
                                    {/* Columna de acciones (solo Ver) */}
                                    <td>
                                        {/* Replica <a asp-page="/Salidas/VerNotaSalida" asp-route-id="@nota.Id"> */}
                                        <Link 
                                            to={`/salidas/ver/${nota.id}`} 
                                            className="btn btn-outline-secondary btn-sm"
                                        >
                                            <i className="bi bi-eye me-1"></i> Ver
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            !loading && <tr><td colSpan="6" className="text-center">No se encontraron notas de salida.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Paginación */}
            {!loading && notas.length > 0 && <Pagination />}
        </div>
    );
}
