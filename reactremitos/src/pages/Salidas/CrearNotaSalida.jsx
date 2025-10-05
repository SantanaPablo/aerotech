import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save } from 'lucide-react';

const CrearNotaSalida = ({ authToken }) => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [nota, setNota] = useState({
    fecha: new Date().toISOString().split('T')[0],
    dirigidaA: 'Seguridad T4',
    recibido: false,
    tecnico: '',
    autorizanteId: null
  });

  const [items, setItems] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Cargar items desde localStorage al montar
  useEffect(() => {
    const savedItems = localStorage.getItem('itemsNotaSalida');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    } else {
      setItems([{ unidad: '1', equipo: '', serial: '', usuario: '', sd: '' }]);
    }
  }, []);

  // Cargar técnicos desde la API
  useEffect(() => {
    const cargarTecnicos = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/Usuarios`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        if (response.ok) {
          const usuarios = await response.json();
          const nombresTecnicos = [...new Set(usuarios.map(u => u.nombre))];
          setTecnicos(nombresTecnicos);
        }
      } catch (error) {
        console.error('Error al cargar técnicos:', error);
      }
    };

    cargarTecnicos();
  }, [apiUrl, authToken]);

  // Extraer autorizanteId del token
  useEffect(() => {
    if (authToken) {
      try {
        const payload = JSON.parse(atob(authToken.split('.')[1]));
        const usuarioId = payload.UsuarioId || payload.sub || payload.nameid;
        setNota(prev => ({ ...prev, autorizanteId: parseInt(usuarioId) }));
      } catch (error) {
        console.error('Error al decodificar token:', error);
      }
    }
  }, [authToken]);

  // Guardar items en localStorage cuando cambien
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('itemsNotaSalida', JSON.stringify(items));
    }
  }, [items]);

  const handleNotaChange = (field, value) => {
    setNota(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const agregarItem = () => {
    if (items.length < 30) {
      setItems([...items, { unidad: '1', equipo: '', serial: '', usuario: '', sd: '' }]);
    }
  };

  const eliminarItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems.length > 0 ? newItems : [{ unidad: '1', equipo: '', serial: '', usuario: '', sd: '' }]);
  };

  const validarFormulario = () => {
    const newErrors = {};

    if (!nota.tecnico?.trim()) {
      newErrors.tecnico = 'El campo Técnico es obligatorio';
    }

    if (items.length === 0) {
      newErrors.items = 'Debe agregar al menos un ítem de salida';
    }

    items.forEach((item, i) => {
      if (!item.equipo?.trim()) {
        newErrors[`items[${i}].equipo`] = 'El campo Equipo es obligatorio';
      }
      if (!item.serial?.trim()) {
        newErrors[`items[${i}].serial`] = 'El campo Serial es obligatorio';
      }
    });

    if (!nota.autorizanteId) {
      newErrors.autorizante = 'No se pudo identificar al usuario logueado';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const guardarNota = async () => {
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      // Crear la nota de salida
      const notaResponse = await fetch(`${apiUrl}/api/NotasSalida`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          fecha: nota.fecha,
          dirigidaA: nota.dirigidaA,
          recibido: nota.recibido,
          tecnico: nota.tecnico,
          autorizanteId: nota.autorizanteId
        })
      });

      if (!notaResponse.ok) {
        throw new Error('Error al crear la nota de salida');
      }

      const notaCreada = await notaResponse.json();

      // Crear los items
      for (const item of items) {
        await fetch(`${apiUrl}/api/ItemSalidas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            notaSalidaId: notaCreada.id,
            unidad: item.unidad,
            equipo: item.equipo,
            serial: item.serial,
            usuario: item.usuario,
            sd: item.sd
          })
        });
      }

      // Limpiar localStorage
      localStorage.removeItem('itemsNotaSalida');

      // Redirigir a ver la nota
      navigate(`/salidas/vernotasalida/${notaCreada.id}`);
    } catch (error) {
      console.error('Error al guardar:', error);
      setErrors({ general: 'Error al guardar la nota. Por favor, intente nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Crear Nota de Salida</h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {errors.general && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errors.general}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={nota.fecha}
              onChange={(e) => handleNotaChange('fecha', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirigido A
            </label>
            <input
              type="text"
              value={nota.dirigidaA}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={nota.recibido}
                onChange={(e) => handleNotaChange('recibido', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Recibido</span>
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Técnico
          </label>
          <input
            type="text"
            list="tecnicosList"
            value={nota.tecnico}
            onChange={(e) => handleNotaChange('tecnico', e.target.value)}
            className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <datalist id="tecnicosList">
            {tecnicos.map((nombre, i) => (
              <option key={i} value={nombre} />
            ))}
          </datalist>
          {errors.tecnico && (
            <span className="text-red-600 text-sm mt-1 block">{errors.tecnico}</span>
          )}
        </div>

        <h5 className="text-xl font-semibold mt-6 mb-4 flex items-center">
          <span className="mr-2">📦</span> Ítems de salida
        </h5>

        <div className="flex justify-between items-center mb-4">
          <button
            type="button"
            onClick={agregarItem}
            disabled={items.length >= 30}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            <span>Agregar Ítem</span>
          </button>

          <button
            type="button"
            onClick={guardarNota}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Guardando...' : 'Guardar Nota'}</span>
          </button>
        </div>

        {errors.items && (
          <div className="text-red-600 text-sm mb-4">{errors.items}</div>
        )}

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-start border-b pb-3">
              <div>
                <input
                  type="number"
                  value={item.unidad}
                  onChange={(e) => handleItemChange(index, 'unidad', e.target.value)}
                  placeholder="Unidad"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={item.equipo}
                  onChange={(e) => handleItemChange(index, 'equipo', e.target.value)}
                  placeholder="Equipo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors[`items[${index}].equipo`] && (
                  <span className="text-red-600 text-xs">{errors[`items[${index}].equipo`]}</span>
                )}
              </div>

              <div>
                <input
                  type="text"
                  value={item.serial}
                  onChange={(e) => handleItemChange(index, 'serial', e.target.value)}
                  placeholder="Serial"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors[`items[${index}].serial`] && (
                  <span className="text-red-600 text-xs">{errors[`items[${index}].serial`]}</span>
                )}
              </div>

              <div>
                <input
                  type="text"
                  value={item.usuario}
                  onChange={(e) => handleItemChange(index, 'usuario', e.target.value)}
                  placeholder="Usuario"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={item.sd}
                  onChange={(e) => handleItemChange(index, 'sd', e.target.value)}
                  placeholder="SD"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => eliminarItem(index)}
                  className="flex items-center space-x-1 px-3 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CrearNotaSalida;