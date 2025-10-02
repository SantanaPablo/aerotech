import React, { useState, useEffect } from 'react';
import { FileText, PlusCircle, Trash2, Save, Send, Shield } from 'lucide-react';


// Lista de técnicos para la datalist
const MOCK_TECNICOS = ["Juan Pérez", "Ana López", "Carlos Ruiz", "Sofía Mendoza", "Elena Vidal"];

// Estructura inicial de un Ítem de Salida
const INITIAL_ITEM_STATE = {
    Unidad: 1,
    Equipo: '',
    Serial: '',
    Usuario: '',
    SD: ''
};

// Estado inicial de la Nota de Salida
const getInitialNotaState = () => ({
    Fecha: new Date().toISOString().substring(0, 10),
    DirigidaA: 'Seguridad T4',
    Tecnico: '',
    Recibido: false
});

const CrearNotaSalida = () => {
    const [nota, setNota] = useState(getInitialNotaState);
    const [items, setItems] = useState([INITIAL_ITEM_STATE]);
    const [validationErrors, setValidationErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const MAX_ITEMS = 25;

    // --- MANEJADORES DE CAMBIO DE ESTADO ---

    // Maneja cambios en los campos principales de la Nota
    const handleNotaChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNota(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Maneja cambios en los campos de los Ítems
    const handleItemChange = (index, e) => {
        const { name, value, type } = e.target;
        const newItems = items.map((item, i) => {
            if (i === index) {
                return {
                    ...item,
                    [name]: type === 'number' ? parseInt(value) || 0 : value
                };
            }
            return item;
        });
        setItems(newItems);
        // Limpia el error del campo si el usuario empieza a escribir
        if (validationErrors.items) {
            setValidationErrors(prev => ({ 
                ...prev, 
                items: {
                    ...prev.items,
                    [`${name}-${index}`]: null
                }
            }));
        }
    };

    // --- MANEJADORES DE ARRAY (SIMULANDO HANDLERS) ---

    // Simula OnPostAddItem
    const handleAddItem = (e) => {
        e.preventDefault();
        if (items.length < MAX_ITEMS) {
            setItems(prev => [...prev, { ...INITIAL_ITEM_STATE }]);
        }
    };

    // Simula OnPostRemoveItem
    const handleRemoveItem = (index) => (e) => {
        e.preventDefault();
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    // --- VALIDACIÓN Y GUARDADO (SIMULANDO OnPostGuardarAsync) ---

    const validateForm = () => {
        let errors = {};
        let itemErrors = {};
        let isValid = true;

        if (!nota.Tecnico.trim()) {
            errors.Tecnico = "El campo Técnico es obligatorio.";
            isValid = false;
        }
        
        // Validación de ítems
        if (items.length < 1) {
            errors.global = "Debe agregar al menos un ítem de salida.";
            isValid = false;
        } else {
            items.forEach((item, i) => {
                if (!item.Equipo.trim()) {
                    itemErrors[`Equipo-${i}`] = "El campo Equipo es obligatorio.";
                    isValid = false;
                }
                if (!item.Serial.trim()) {
                    itemErrors[`Serial-${i}`] = "El campo Serial es obligatorio.";
                    isValid = false;
                }
            });
        }
        
        if (Object.keys(itemErrors).length > 0) {
            errors.items = itemErrors;
        }

        setValidationErrors(errors);
        return isValid;
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            // La validación falló
            console.error("Errores de validación, no se puede guardar.");
            return;
        }

        setIsSaving(true);
        console.log("Datos válidos. Simulación de guardado...");
        
        // Simulación de llamada a API (2 segundos de latencia)
        setTimeout(() => {
            setIsSaving(false);
            
            // Simulación de éxito (limpiar el formulario)
            // Aquí iría un RedirectToPage("VerNotaSalida", ...)
            console.log("Nota guardada con éxito:", { nota, items });
            alert("Nota de Salida guardada con éxito (Simulación).");

            // Resetear estado después de guardar
            setNota(getInitialNotaState());
            setItems([INITIAL_ITEM_STATE]);
            setValidationErrors({});
        }, 2000); 
    };

    // Componente Modal de Confirmación simple (reemplaza alert/confirm)
    const ConfirmModal = ({ onConfirm, onClose }) => (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all">
                <h3 className="text-xl font-bold text-gray-900 flex items-center mb-4">
                    <Send className="w-5 h-5 mr-2 text-blue-600" /> Confirmar Guardado
                </h3>
                <p className="text-gray-700 mb-6">¿Estás seguro de que deseas guardar y enviar la Nota de Salida?</p>
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                        disabled={isSaving}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        disabled={isSaving}
                    >
                        {isSaving ? 'Guardando...' : 'Confirmar Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );

    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Función para abrir la modal de confirmación
    const handleConfirmSave = () => {
        if (validateForm()) {
            setIsModalOpen(true);
        }
    };


    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen font-sans">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
                <FileText className="w-8 h-8 mr-3 text-blue-600" /> Crear Nota de Salida
            </h1>

            <div className="card p-4 sm:p-6 mb-8 shadow-xl bg-white rounded-xl border border-gray-200">
                <form id="formCrearNota" onSubmit={handleSave}>
                    {/* Resumen de Validación Global */}
                    {(validationErrors.global || validationErrors.Tecnico) && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            <p className="font-semibold mb-1">Hay errores en el formulario:</p>
                            {validationErrors.global && <p>- {validationErrors.global}</p>}
                            {validationErrors.Tecnico && <p>- {validationErrors.Tecnico}</p>}
                        </div>
                    )}

                    {/* --- SECCIÓN PRINCIPAL DE LA NOTA --- */}
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Detalles Generales</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Fecha */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                            <input
                                name="Fecha"
                                type="date"
                                value={nota.Fecha}
                                onChange={handleNotaChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        </div>

                        {/* Dirigido A (Readonly) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dirigido A</label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    name="DirigidaA"
                                    value={nota.DirigidaA}
                                    readOnly
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Recibido Checkbox */}
                        <div className="flex items-end">
                            <div className="flex items-center h-full pt-4 md:pt-0">
                                <input
                                    name="Recibido"
                                    id="Nota_Recibido"
                                    type="checkbox"
                                    checked={nota.Recibido}
                                    onChange={handleNotaChange}
                                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="Nota_Recibido" className="ml-2 text-sm font-medium text-gray-700">Recibido</label>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Técnico */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Técnico <span className="text-red-500">*</span></label>
                            <input
                                name="Tecnico"
                                value={nota.Tecnico}
                                onChange={handleNotaChange}
                                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition ${validationErrors.Tecnico ? 'border-red-500' : 'border-gray-300'}`}
                                list="tecnicosList"
                                placeholder="Escribe o selecciona un técnico"
                            />
                            <datalist id="tecnicosList">
                                {MOCK_TECNICOS.map((nombre, index) => (
                                    <option key={index} value={nombre} />
                                ))}
                            </datalist>
                            {validationErrors.Tecnico && <p className="text-red-500 text-xs mt-1">{validationErrors.Tecnico}</p>}
                        </div>
                    </div>

                    {/* --- SECCIÓN DE ÍTEMS --- */}
                    
                        <i className="bi bi-box-seam mr-2"></i> Ítems de salida

                         <div className="mt-6 flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleAddItem}
                            className={`flex items-center justify-center px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition shadow-md ${items.length >= MAX_ITEMS ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={items.length >= MAX_ITEMS || isSaving}
                        >
                            <PlusCircle className="w-4 h-4 mr-2" /> 
                            {items.length >= MAX_ITEMS ? `Máximo ${MAX_ITEMS} Ítems` : 'Agregar Ítem'}
                        </button>
                        
                        <button 
                            id="btnConfirmarGuardarSalida" 
                            type="button"
                            onClick={handleConfirmSave}
                            className="flex items-center justify-center px-6 py-2 text-lg font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 transition shadow-xl disabled:opacity-50"
                            disabled={isSaving}
                        >
                            <Save className="w-5 h-5 mr-2" /> 
                            {isSaving ? 'Guardando...' : 'Guardar Nota'}
                        </button>
                    </div>
                    


                    {/* Encabezados de la tabla de ítems */}
                    <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 uppercase pb-2 border-b border-gray-200 mb-2">
                        <div className="col-span-1">Unidad</div>
                        <div className="col-span-3">Equipo <span className="text-red-500">*</span></div>
                        <div className="col-span-3">Serial <span className="text-red-500">*</span></div>
                        <div className="col-span-3">Usuario</div>
                        <div className="col-span-1">SD</div>
                        <div className="col-span-1 text-right">Acción</div>
                    </div>

                    
                    
                    {/* Lista Dinámica de Ítems */}
                    {items.map((item, i) => (
                        <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-2 mb-4 border-b pb-4 sm:pb-2 sm:items-start items-center relative">
                            <div className="col-span-12 sm:col-span-1 w-full">
                                <label className="block sm:hidden text-xs font-medium text-gray-500">Unidad</label>
                                <input
                                    name="Unidad"
                                    type="number"
                                    value={item.Unidad}
                                    onChange={(e) => handleItemChange(i, e)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded-lg shadow-sm text-sm"
                                />
                            </div>

                            <div className="col-span-12 sm:col-span-3 w-full">
                                <label className="block sm:hidden text-xs font-medium text-gray-500">Equipo</label>
                                <input
                                    name="Equipo"
                                    value={item.Equipo}
                                    onChange={(e) => handleItemChange(i, e)}
                                    className={`w-full px-2 py-1 border rounded-lg shadow-sm text-sm ${validationErrors.items?.[`Equipo-${i}`] ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Equipo"
                                />
                                {validationErrors.items?.[`Equipo-${i}`] && <p className="text-red-500 text-xs mt-1 sm:min-h-[1em]">{validationErrors.items[`Equipo-${i}`]}</p>}
                            </div>

                            <div className="col-span-12 sm:col-span-3 w-full">
                                <label className="block sm:hidden text-xs font-medium text-gray-500">Serial</label>
                                <input
                                    name="Serial"
                                    value={item.Serial}
                                    onChange={(e) => handleItemChange(i, e)}
                                    className={`w-full px-2 py-1 border rounded-lg shadow-sm text-sm ${validationErrors.items?.[`Serial-${i}`] ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Serial"
                                />
                                {validationErrors.items?.[`Serial-${i}`] && <p className="text-red-500 text-xs mt-1 sm:min-h-[1em]">{validationErrors.items[`Serial-${i}`]}</p>}
                            </div>

                            <div className="col-span-12 sm:col-span-3 w-full">
                                <label className="block sm:hidden text-xs font-medium text-gray-500">Usuario</label>
                                <input
                                    name="Usuario"
                                    value={item.Usuario}
                                    onChange={(e) => handleItemChange(i, e)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded-lg shadow-sm text-sm"
                                    placeholder="Usuario"
                                />
                            </div>

                            <div className="col-span-12 sm:col-span-1 w-full">
                                <label className="block sm:hidden text-xs font-medium text-gray-500">SD</label>
                                <input
                                    name="SD"
                                    value={item.SD}
                                    onChange={(e) => handleItemChange(i, e)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded-lg shadow-sm text-sm"
                                    placeholder="SD"
                                />
                            </div>

                            {/* Botón Eliminar */}
                            <div className="col-span-12 sm:col-span-1 flex justify-end sm:justify-center w-full">
                                <button
                                    type="button"
                                    onClick={handleRemoveItem(i)}
                                    className="flex items-center justify-center p-2 text-sm font-semibold text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="sm:hidden ml-2">Eliminar Ítem</span>
                                </button>
                            </div>
                        </div>
                    ))}

                
                </form>
            </div>
            
            {/* Modal de Confirmación */}
            {isModalOpen && (
                <ConfirmModal 
                    onConfirm={handleSave} 
                    onClose={() => setIsModalOpen(false)} 
                />
            )}
            
            {/* Footer space */}
            <div className="h-[60px] block" aria-hidden="true"></div>
        </div>
    );
};

export default CrearNotaSalida;
