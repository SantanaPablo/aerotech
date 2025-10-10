import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, AlertCircle } from 'lucide-react';

// NOTE: We assume 'useNavigate' is correctly defined in the surrounding application environment.

const STORAGE_KEY = 'notaEntradaDraft';

const CrearNotaEntrada = ({ token }) => {
  // Replace useNavigate with a mock function if the environment doesn't support react-router-dom
  const navigate = typeof useNavigate === 'function' ? useNavigate() : (path) => console.log('NAVIGATE TO:', path);
  
 const apiUrl = import.meta.env.VITE_API_URL;
  
  const serialInputRefs = useRef([]);

  const initialItem = { unidad: '1', equipo: '', serial: '', usuario: '', sd: '' };

  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        // Ensure all required fields exist in loaded items for safety
        const sanitizedItems = Array.isArray(draft.items) && draft.items.length > 0
          ? draft.items.map(item => ({ ...initialItem, ...item }))
          : [initialItem];
        return sanitizedItems;
      }
    } catch (e) {
      console.error('Error al cargar items desde localStorage:', e);
    }
    return [initialItem];
  });

  const [nota, setNota] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.nota) return draft.nota;
      }
    } catch (e) {
      console.error('Error al cargar nota desde localStorage:', e);
    }
    return {
      fecha: new Date().toISOString().split('T')[0],
      dirigidaA: 'Seguridad T4',
      recibido: false,
      tecnico: '',
      autorizanteId: null
    };
  });

  const [tecnicos, setTecnicos] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Guardar en localStorage cuando cambian items o nota
  useEffect(() => {
    const draft = { nota, items };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [items, nota]);

  // 2. Extraer autorizanteId del token (JWT)
  useEffect(() => {
    if (!token) return;
    try {
      // Decode the JWT payload (the middle part of the token)
      const payloadBase64 = token.split('.')[1];
      // Use 'atob' to decode the base64 payload
      const payload = JSON.parse(atob(payloadBase64));
          
      // Adjust claim name based on your token structure
      const usuarioId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      
      if (usuarioId) {
        const parsedId = parseInt(usuarioId);
        if (!isNaN(parsedId)) setNota(prev => ({ ...prev, autorizanteId: parsedId }));
        else setErrors(prev => ({ ...prev, autorizante: 'El ID de usuario no es válido' }));
      } else setErrors(prev => ({ ...prev, autorizante: 'No se pudo identificar al usuario logueado' }));
    } catch (e) {
      console.error('Error al procesar la autenticación:', e);
      setErrors(prev => ({ ...prev, autorizante: 'Error al procesar la autenticación' }));
    }
  }, [token]);

  // 3. Cargar técnicos desde API (Autocomplete data)
  useEffect(() => {
    if (!token || !apiUrl) return;
    const cargarTecnicos = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/Usuarios`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const usuarios = await res.json();
          // Extract unique, non-empty names
          const nombresTecnicos = [...new Set(usuarios.map(u => u.nombre))].filter(Boolean);
          setTecnicos(nombresTecnicos);
        } else {
          console.error('Error fetching usuarios:', res.statusText);
        }
      } catch (e) {
        console.error('Error al cargar técnicos:', e);
      }
    };
    cargarTecnicos();
  }, [apiUrl, token]);

  const handleNotaChange = (field, value) => {
    setNota(prev => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    
    // Convert unidad value to string to keep consistent type in state
    newItems[index][field] = (field === 'unidad' ? String(value) : value);
    
    setItems(newItems);
    
    // Clear item-specific error on change
    const errorKey = `items[${index}].${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const agregarItem = () => {
    if (items.length >= 30) return;
    setItems([...items, { unidad: '1', equipo: '', serial: '', usuario: '', sd: '' }]);
    // Focus on the newly added serial input
    setTimeout(() => serialInputRefs.current[items.length]?.focus(), 100);
  };

  const eliminarItem = (index) => {
    if (items.length === 1) {
      setItems([initialItem]); // Reset the single item
    } else {
      setItems(items.filter((_, i) => i !== index));
      // Remove potential errors for the deleted row
      setErrors(prev => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach(key => {
          if (key.startsWith(`items[${index}].`)) delete newErrors[key];
        });
        return newErrors;
      });
    }
  };

  const handleSerialKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Only add a new item if the current one is not the last one
      if (index === items.length - 1) {
        agregarItem();
      }
    }
  };

  const validarFormulario = () => {
    const newErrors = {};
    // --- Nota Validation ---
    if (!nota.fecha) newErrors.fecha = 'La fecha es obligatoria';
    if (!nota.dirigidaA?.trim()) newErrors.dirigidaA = 'El campo "Dirigido A" es obligatorio';
    if (!nota.tecnico?.trim()) newErrors.tecnico = 'El campo Técnico es obligatorio';
    if (!nota.autorizanteId) newErrors.autorizante = 'No se pudo identificar al usuario logueado';

    // --- Items Validation (ALL fields are now required for a valid item) ---
    let itemsValidos = false;
    items.forEach((item, i) => {
      const unidad = item.unidad?.toString().trim();
      const equipo = item.equipo?.trim();
      const serial = item.serial?.trim();
      const usuario = item.usuario?.trim();
      const sd = item.sd?.trim();

      // Check all required fields
      if (!unidad || unidad === '0') newErrors[`items[${i}].unidad`] = 'Requerido';
      if (!equipo) newErrors[`items[${i}].equipo`] = 'Requerido';
      if (!serial) newErrors[`items[${i}].serial`] = 'Requerido';
      if (!usuario) newErrors[`items[${i}].usuario`] = 'Requerido';
      if (!sd) newErrors[`items[${i}].sd`] = 'Requerido';
      
      // A row is considered "valid" if all required fields for that row are filled
      if (unidad && unidad !== '0' && equipo && serial && usuario && sd) {
        itemsValidos = true;
      }
    });
    
    // Overall validation: Must have at least one valid item
    if (!itemsValidos) newErrors.items = 'Debe completar todos los campos (Unidad, Equipo, Serial, Usuario, SD) de al menos un ítem.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const guardarNota = async () => {
    if (!validarFormulario()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setLoading(true);
    setErrors({});
    setSuccessMessage('');
    try {
      // Since validation passed, we can filter for fully completed rows 
      // (which means all fields are filled, as per the new validation logic).
      const itemsValidos = items
        .filter(i => i.equipo?.trim() && i.serial?.trim() && i.usuario?.trim() && i.sd?.trim() && i.unidad?.toString().trim() && i.unidad?.toString().trim() !== '0')
        .map(i => ({ 
          ...i, 
          unidad: i.unidad.toString().trim(), 
          equipo: i.equipo.trim(), 
          serial: i.serial.trim(), 
          usuario: i.usuario.trim(), 
          sd: i.sd.trim() 
        }));

      const notaCompleta = { 
        ...nota, 
        autorizanteId: nota.autorizanteId, // Ensure ID is passed as number if API expects it
        items: itemsValidos 
      };

      const res = await fetch(`${apiUrl}/api/NotasEntrada`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(notaCompleta)
      });

      if (!res.ok) throw new Error(await res.text() || `Error al crear la nota de Entrada: HTTP ${res.status}`);

      const notaCreada = await res.json();
      localStorage.removeItem(STORAGE_KEY);
      setSuccessMessage(`Nota de entrada creada con ${itemsValidos.length} ítem(s) (#${notaCreada.id})`);
      // Use 'navigate' only if it's a real function
      if (typeof navigate === 'function') {
        setTimeout(() => navigate(`/entradas/vernotaentrada/${notaCreada.id}`), 1500);
      }

    } catch (e) {
      console.error('Error al guardar:', e);
      setErrors({ general: e.message || 'Error al guardar la nota. Intente nuevamente.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 font-inter">
      <style>{`
        .font-inter { font-family: 'Inter', sans-serif; }
        input[type="number"]::-webkit-inner-spin-button, 
        input[type="number"]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
      `}</style>

      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Crear Nota de Entrada</h2>

      <div className="bg-white rounded-xl shadow-lg p-4 md:p-8 mb-6">
        {/* Error/Success Messages */}
        {errors.general && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4 flex items-start"><AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />{errors.general}</div>}
        {successMessage && <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded mb-4">{successMessage}</div>}
        {errors.autorizante && <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 px-4 py-3 rounded mb-4 flex items-start"><AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />{errors.autorizante}</div>}

        {/* Sección de Nota */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha <span className="text-red-500">*</span></label>
            <input type="date" value={nota.fecha} onChange={e => handleNotaChange('fecha', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.fecha ? 'border-red-500 ring-red-500' : 'border-gray-300 ring-blue-500'}`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirigido A <span className="text-red-500">*</span></label>
            <input type="text" value={nota.dirigidaA} onChange={e => handleNotaChange('dirigidaA', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.dirigidaA ? 'border-red-500 ring-red-500' : 'border-gray-300 ring-blue-500'}`} />
          </div>
          <div className="flex items-center pt-6">
            <label className="flex items-center space-x-2 cursor-pointer p-2 bg-gray-50 rounded-lg shadow-inner">
              <input type="checkbox" checked={nota.recibido} onChange={e => handleNotaChange('recibido', e.target.checked)} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <span className="text-sm font-medium text-gray-700">Recibido</span>
            </label>
          </div>
        </div>

        {/* Sección de Técnico */}
        <div className="mb-8 border-t pt-6">
          <label className="block text-lg font-semibold text-gray-800 mb-2">Técnico <span className="text-red-500">*</span></label>
          <input type="text" list="tecnicosList" value={nota.tecnico} onChange={e => handleNotaChange('tecnico', e.target.value)} className={`w-full md:w-1/2 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${errors.tecnico ? 'border-red-500 ring-red-500' : 'border-gray-300 ring-blue-500'}`} placeholder="Ingrese o seleccione un técnico" />
          <datalist id="tecnicosList">{tecnicos.map((n,i) => <option key={i} value={n} />)}</datalist>
          {errors.tecnico && <span className="text-red-600 text-sm mt-1 block font-medium">{errors.tecnico}</span>}
        </div>

        {/* Sección de Items */}
        <div className="border-t pt-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2 text-2xl">📦</span> Ítems de entrada
          </h3>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <button type="button" onClick={agregarItem} disabled={items.length >= 30} className="flex items-center space-x-2 px-5 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 disabled:bg-gray-400 transition-colors transform hover:scale-[1.01]">
              <Plus className="w-5 h-5" />
              <span className="font-semibold">Agregar Ítem ({items.length}/30)</span>
            </button>

            <button type="button" onClick={guardarNota} disabled={loading} className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg shadow-xl hover:bg-green-700 disabled:bg-gray-400 transition-colors transform hover:scale-[1.01]">
              <Save className="w-5 h-5" />
              <span className="font-semibold">{loading ? 'Guardando...' : 'Guardar Nota'}</span>
            </button>
          </div>

          {errors.items && <div className="text-red-600 text-sm mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded">{errors.items}</div>}

          <div className="space-y-6">
            {items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4 md:p-6 bg-gray-50 relative group shadow-sm">
                

                {/* Cuadrícula de Inputs y Botón de Eliminar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 items-end">
                  
                  {/* 1. Unidad (REQUIRED) */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Unidad <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      value={item.unidad} 
                      onChange={e => handleItemChange(index, 'unidad', e.target.value)} 
                      min="1" 
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors[`items[${index}].unidad`] ? 'border-red-500 ring-red-500' : 'border-gray-300 ring-blue-500'}`} 
                    />
                    {errors[`items[${index}].unidad`] && <span className="text-red-600 text-xs block mt-1">{errors[`items[${index}].unidad`]}</span>}
                  </div>

                  {/* 2. Equipo (REQUIRED) */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Equipo <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={item.equipo} 
                      onChange={e => handleItemChange(index, 'equipo', e.target.value)} 
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors[`items[${index}].equipo`] ? 'border-red-500 ring-red-500' : 'border-gray-300 ring-blue-500'}`} 
                      placeholder="Ej: Laptop" 
                    />
                    {errors[`items[${index}].equipo`] && <span className="text-red-600 text-xs block mt-1">{errors[`items[${index}].equipo`]}</span>}
                  </div>

                  {/* 3. Serial (REQUIRED) */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Serial <span className="text-red-500">*</span></label>
                    <input 
                      ref={el => serialInputRefs.current[index] = el} 
                      type="text" 
                      value={item.serial} 
                      onChange={e => handleItemChange(index, 'serial', e.target.value)} 
                      onKeyDown={e => handleSerialKeyDown(e, index)} 
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors[`items[${index}].serial`] ? 'border-red-500 ring-red-500' : 'border-gray-300 ring-blue-500'}`} 
                      placeholder="Serial" 
                    />
                    {errors[`items[${index}].serial`] && <span className="text-red-600 text-xs block mt-1">{errors[`items[${index}].serial`]}</span>}
                  </div>

                  {/* 4. Usuario (REQUIRED) */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Usuario <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={item.usuario} 
                      onChange={e => handleItemChange(index, 'usuario', e.target.value)} 
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors[`items[${index}].usuario`] ? 'border-red-500 ring-red-500' : 'border-gray-300 ring-blue-500'}`}
                    />
                    {errors[`items[${index}].usuario`] && <span className="text-red-600 text-xs block mt-1">{errors[`items[${index}].usuario`]}</span>}
                  </div>

                  {/* 5. SD (REQUIRED) */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">SD <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={item.sd} 
                      onChange={e => handleItemChange(index, 'sd', e.target.value)} 
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors[`items[${index}].sd`] ? 'border-red-500 ring-red-500' : 'border-gray-300 ring-blue-500'}`}
                    />
                    {errors[`items[${index}].sd`] && <span className="text-red-600 text-xs block mt-1">{errors[`items[${index}].sd`]}</span>}
                  </div>
					
                  {/* 6. Botón Eliminar (Integrado en la fila) */}
                  <div className="col-span-2 sm:col-span-3 md:col-span-1">
                    <button 
                      type="button" 
                      onClick={() => eliminarItem(index)} 
                      title={`Eliminar Ítem #${index + 1}`}
                      className="w-full p-3 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-colors flex justify-center items-center h-[42px] mt-4 md:mt-0"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span className="md:hidden ml-2 font-semibold">Eliminar Ítem</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearNotaEntrada;
