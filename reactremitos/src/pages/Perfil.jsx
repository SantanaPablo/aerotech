import React, { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Key } from 'lucide-react';
import { getToken, apiGet, apiPut } from '../utils/api';

const Perfil = () => {
  const [usuario, setUsuario] = useState({
    nombre: '',
    legajo: '',
    id: null
  });

  const [cambioContrasena, setCambioContrasena] = useState({
    contrasenaActual: '',
    nuevaContrasena: '',
    repetirContrasena: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    actual: false,
    nueva: false,
    repetir: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Cargar datos del usuario desde el token
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    try {
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(atob(payloadBase64));

      const usuarioId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      const nombre = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
      const legajo = payload['Legajo'];

      setUsuario({
        id: parseInt(usuarioId),
        nombre: nombre || '',
        legajo: legajo || ''
      });
    } catch (e) {
      console.error('Error al decodificar el token:', e);
    }
  }, []);

  const handleChange = (field, value) => {
    setCambioContrasena(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validarFormulario = () => {
    const newErrors = {};

    if (!cambioContrasena.contrasenaActual.trim()) {
      newErrors.contrasenaActual = 'La contraseña actual es obligatoria';
    }

    if (!cambioContrasena.nuevaContrasena.trim()) {
      newErrors.nuevaContrasena = 'La nueva contraseña es obligatoria';
    } else if (cambioContrasena.nuevaContrasena.length < 6) {
      newErrors.nuevaContrasena = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!cambioContrasena.repetirContrasena.trim()) {
      newErrors.repetirContrasena = 'Debe repetir la nueva contraseña';
    } else if (cambioContrasena.nuevaContrasena !== cambioContrasena.repetirContrasena) {
      newErrors.repetirContrasena = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validarFormulario()) {
    return;
  }

  setLoading(true);
  setErrors({});
  setSuccessMessage('');

  try {
    await apiPut(`/api/Usuarios/${usuario.id}`, {
      id: usuario.id,
      nombre: usuario.nombre,
      legajo: usuario.legajo,
      contrasena: cambioContrasena.nuevaContrasena
    });

    setSuccessMessage('Contraseña actualizada correctamente ✅');
    
    // Limpiar formulario
    setCambioContrasena({
      contrasenaActual: '',
      nuevaContrasena: '',
      repetirContrasena: ''
    });

    // Ocultar mensaje después de 5 segundos
    setTimeout(() => setSuccessMessage(''), 5000);

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    setErrors({ general: error.message || 'Error al actualizar la contraseña. Intente nuevamente.' });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <style>{`
        .font-inter { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-2">
          <User className="w-8 h-8 text-blue-600" />
          Perfil de Usuario
        </h2>
        <p className="text-gray-600">Administra tu información personal y contraseña</p>
      </div>

      {/* Información del Usuario */}
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          Información Personal
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-600 mb-1">Nombre</p>
            <p className="text-lg font-semibold text-gray-900">{usuario.nombre || 'No disponible'}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-600 mb-1">Legajo</p>
            <p className="text-lg font-semibold text-gray-900">{usuario.legajo || 'No disponible'}</p>
          </div>
        </div>
      </div>

      {/* Cambiar Contraseña */}
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Key className="w-5 h-5 text-blue-600" />
          Cambiar Contraseña
        </h3>

        {/* Mensajes */}
        {errors.general && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{errors.general}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded mb-6 flex items-start">
            <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contraseña Actual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña Actual <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPasswords.actual ? "text" : "password"}
                value={cambioContrasena.contrasenaActual}
                onChange={(e) => handleChange('contrasenaActual', e.target.value)}
                className={`block w-full pl-10 pr-10 py-3 border ${
                  errors.contrasenaActual ? 'border-red-500 ring-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                placeholder="Ingrese su contraseña actual"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('actual')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPasswords.actual ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.contrasenaActual && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.contrasenaActual}
              </p>
            )}
          </div>

          {/* Nueva Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Contraseña <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPasswords.nueva ? "text" : "password"}
                value={cambioContrasena.nuevaContrasena}
                onChange={(e) => handleChange('nuevaContrasena', e.target.value)}
                className={`block w-full pl-10 pr-10 py-3 border ${
                  errors.nuevaContrasena ? 'border-red-500 ring-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                placeholder="Ingrese la nueva contraseña"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('nueva')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPasswords.nueva ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.nuevaContrasena && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.nuevaContrasena}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">La contraseña debe tener al menos 6 caracteres</p>
          </div>

          {/* Repetir Nueva Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repetir Nueva Contraseña <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPasswords.repetir ? "text" : "password"}
                value={cambioContrasena.repetirContrasena}
                onChange={(e) => handleChange('repetirContrasena', e.target.value)}
                className={`block w-full pl-10 pr-10 py-3 border ${
                  errors.repetirContrasena ? 'border-red-500 ring-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                placeholder="Repita la nueva contraseña"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('repetir')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPasswords.repetir ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.repetirContrasena && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.repetirContrasena}
              </p>
            )}
          </div>

          {/* Botón Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Actualizando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Actualizar Contraseña
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Perfil;