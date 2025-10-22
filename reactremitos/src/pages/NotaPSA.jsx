// NotaPSA.jsx
import React, { useState, useEffect } from 'react';

const NotaPSA = () => {
  const [formData, setFormData] = useState({
    ingresoChecked: false,
    egresoChecked: false,
    sectorActividad: 'Hangares AR -- Aerolineas Argentinas',
    tipoSolicitud: 'transitoria',
    motivoSolicitud: 'Egreso de equipamiento',
    diasSolicitud: 'INGRESO del 30/08/2025 al 12/09/2025',
    horarioSolicitud: 'Horario: 24 hs',
    infoAdicional: '',
    tipoPuesto: 'INGRESO/EGRESO',
    puestoDetalle: 'ECO/CHECKPOINT',
    actividades: {
      orgPublico: false,
      explAeropuerto: false,
      explAereo: false,
      empresaProveedora: false,
      seguridadPrivada: false,
      otros: false,
      otrosText: ''
    }
  });

  const [articulos, setArticulos] = useState([
    { numero: 1, naturaleza: 'MONITOR', marca: 'LG 23MP55HQ-PA', serie: '504NSYVOL914', cantidad: 1 }
  ]);

  const [credenciales, setCredenciales] = useState([]);
  const [fechaActual, setFechaActual] = useState('');

  useEffect(() => {
    actualizarFecha();
  }, []);

  const actualizarFecha = () => {
    const ahora = new Date();
    const opciones = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const fechaFormateada = ahora.toLocaleDateString('es-ES', opciones);
    setFechaActual(`Ciudad Autónoma de Buenos Aires, ${fechaFormateada}`);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleActividadChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      actividades: {
        ...prev.actividades,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const addArticulo = () => {
    const newArticulo = {
      numero: articulos.length + 1,
      naturaleza: '',
      marca: '',
      serie: '',
      cantidad: 1
    };
    setArticulos([...articulos, newArticulo]);
  };

  const removeArticulo = (index) => {
    if (articulos.length > 1) {
      const newArticulos = articulos.filter((_, i) => i !== index);
      // Renumerar
      const renumerados = newArticulos.map((art, i) => ({
        ...art,
        numero: i + 1
      }));
      setArticulos(renumerados);
    } else {
      alert('Debe haber al menos un artículo en la lista.');
    }
  };

  const handleArticuloChange = (index, field, value) => {
    const newArticulos = [...articulos];
    newArticulos[index] = {
      ...newArticulos[index],
      [field]: value
    };
    setArticulos(newArticulos);
  };

  const handleCredencialUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.type.match('image.*')) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          setCredenciales(prev => [...prev, e.target.result]);
        };
        
        reader.readAsDataURL(file);
      }
    });
    
    e.target.value = '';
  };

  const removeCredencial = (index) => {
    setCredenciales(prev => prev.filter((_, i) => i !== index));
  };

  const validarFormulario = () => {
    let isValid = true;
    let errores = [];

    if (!formData.ingresoChecked && !formData.egresoChecked) {
      errores.push('Por favor seleccione INGRESO y/o EGRESO');
      isValid = false;
    }

    if (!formData.sectorActividad.trim()) {
      errores.push('El sector de actividad es requerido');
      isValid = false;
    }

    if (!formData.motivoSolicitud.trim()) {
      errores.push('El motivo de solicitud es requerido');
      isValid = false;
    }

    if (!formData.diasSolicitud.trim()) {
      errores.push('Los días de solicitud son requeridos');
      isValid = false;
    }

    if (!formData.horarioSolicitud.trim()) {
      errores.push('El horario de solicitud es requerido');
      isValid = false;
    }

    if (!formData.puestoDetalle.trim()) {
      errores.push('El puesto detalle es requerido');
      isValid = false;
    }

    const articulosValidos = articulos.every(art => art.naturaleza.trim());
    if (!articulosValidos || articulos.length === 0) {
      errores.push('Todos los artículos deben tener naturaleza definida');
      isValid = false;
    }

    if (!isValid) {
      alert(errores.join('\n'));
    } else {
      alert('El formulario ha sido validado correctamente. Puede proceder a imprimirlo.');
    }

    return isValid;
  };

  const handlePrint = () => {
    if (validarFormulario()) {
      window.print();
    }
  };

  return (
    <div className="nota-psa-container">
      {/* Primera página */}
      <div className="container">
        <div className="header">
          <div className="logo-container">
            <img src="/assets/LOGO.png" alt="Logo PSA" />
          </div>
          <div className="header-info">
            <p id="fecha-actual">{fechaActual}</p>
          </div>
        </div>

        <div className="header-lines">
          <h1>Unidad Operacional de Seguridad Preventiva Metropolitana</h1>
          <h1>Aeropuerto Internacional Aeroparque Jorge Newbery</h1>
          <h1>POLICIA DE SEGURIDAD AEROPORTUARIA</h1>
          <p>JEFE DE UNIDAD -- INSPECTOR RUBEN RIOS</p>
          <p>JEFATURA DIVISION ADUANA AEROPARQUE</p>
        </div>
        
        <div className="saludo">
          <p>De mi mayor consideración:</p>
          <p>Tengo el agrado de dirigirme a Usted a efectos de solicitar autorización para el</p>
          
          <div className="symbol-container">
            <div className="inline-checkbox-container">
              <div className="tipo-operacion">
                <input 
                  type="checkbox" 
                  id="ingreso-checkbox" 
                  name="ingresoChecked"
                  checked={formData.ingresoChecked}
                  onChange={handleInputChange}
                />
                <label htmlFor="ingreso-checkbox">INGRESO</label>
              </div>
              <div className="tipo-operacion">
                <input 
                  type="checkbox" 
                  id="egreso-checkbox" 
                  name="egresoChecked"
                  checked={formData.egresoChecked}
                  onChange={handleInputChange}
                />
                <label htmlFor="egreso-checkbox">EGRESO</label>
              </div>
              (Indicar lo que corresponda), de artículos incluidos en el listado de objetos prohibidos a utilizar en la zona de seguridad restringida y/o sector estéril de este Aeropuerto Internacional Aeroparque Jorge Newbery.
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <div className="form-section-title">Información de la Solicitud</div>
          <table>
            <tbody>
              <tr>
                <th style={{width: '30%'}}>Actividades desarrolladas en el Aeropuerto:</th>
                <td>
                  <div className="checkbox-container">
                    <input 
                      type="checkbox" 
                      id="org-publico"
                      name="orgPublico"
                      checked={formData.actividades.orgPublico}
                      onChange={handleActividadChange}
                    />
                    <label htmlFor="org-publico">Organismo público</label>
                  </div>
                  <div className="checkbox-container">
                    <input 
                      type="checkbox" 
                      id="expl-aeropuerto"
                      name="explAeropuerto"
                      checked={formData.actividades.explAeropuerto}
                      onChange={handleActividadChange}
                    />
                    <label htmlFor="expl-aeropuerto">Explotador de aeropuerto</label>
                  </div>
                  <div className="checkbox-container">
                    <input 
                      type="checkbox" 
                      id="expl-aereo"
                      name="explAereo"
                      checked={formData.actividades.explAereo}
                      onChange={handleActividadChange}
                    />
                    <label htmlFor="expl-aereo">Explotador aéreo</label>
                  </div>
                  <div className="checkbox-container">
                    <input 
                      type="checkbox" 
                      id="empresa-proveedora"
                      name="empresaProveedora"
                      checked={formData.actividades.empresaProveedora}
                      onChange={handleActividadChange}
                    />
                    <label htmlFor="empresa-proveedora">Empresa proveedora de provisiones, suministros, servicios de limpieza y otros servicios aeroportuarios.</label>
                  </div>
                  <div className="checkbox-container">
                    <input 
                      type="checkbox" 
                      id="seguridad-privada"
                      name="seguridadPrivada"
                      checked={formData.actividades.seguridadPrivada}
                      onChange={handleActividadChange}
                    />
                    <label htmlFor="seguridad-privada">Empresa prestadora de servicios de seguridad privada</label>
                  </div>
                  <div className="checkbox-container">
                    <input 
                      type="checkbox" 
                      id="otros-act"
                      name="otros"
                      checked={formData.actividades.otros}
                      onChange={handleActividadChange}
                    />
                    <label htmlFor="otros-act">Otros:</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      id="otros-act-text" 
                      name="otrosText"
                      value={formData.actividades.otrosText}
                      onChange={handleActividadChange}
                      placeholder="Especifique otras actividades"
                    />
                    <span className="required">*</span>
                  </div>
                </td>
              </tr>
              <tr>
                <th>Especificar sector en que desarrolle la actividad:<span className="required">*</span></th>
                <td>
                  <input 
                    type="text" 
                    className="input-field" 
                    id="sector-actividad"
                    name="sectorActividad"
                    value={formData.sectorActividad}
                    onChange={handleInputChange}
                    required
                  />
                </td>
              </tr>
              <tr>
                <th>Tipo de Solicitud:<span className="required">*</span></th>
                <td>
                  <div className="tipo-solicitud-container">
                    <div className="checkbox-container">
                      <input 
                        type="radio" 
                        id="transitoria" 
                        name="tipoSolicitud" 
                        value="transitoria"
                        checked={formData.tipoSolicitud === 'transitoria'}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="transitoria">TRANSITORIA (no mayor a un día)</label>
                    </div>
                    <div className="checkbox-container">
                      <input 
                        type="radio" 
                        id="permanente" 
                        name="tipoSolicitud" 
                        value="permanente"
                        checked={formData.tipoSolicitud === 'permanente'}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="permanente">PERMANENTE</label>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <th>Especificar motivo de la solicitud:<span className="required">*</span></th>
                <td>
                  <input 
                    type="text" 
                    className="input-field" 
                    id="motivo-solicitud"
                    name="motivoSolicitud"
                    value={formData.motivoSolicitud}
                    onChange={handleInputChange}
                    required
                  />
                </td>
              </tr>
              <tr>
                <th>Especificar día/s vº horario:<span className="required">*</span></th>
                <td>
                  <input 
                    type="text" 
                    className="input-field" 
                    id="dias-solicitud"
                    name="diasSolicitud"
                    value={formData.diasSolicitud}
                    onChange={handleInputChange}
                    required
                  />
                  <input 
                    type="text" 
                    className="input-field" 
                    id="horario-solicitud"
                    name="horarioSolicitud"
                    value={formData.horarioSolicitud}
                    onChange={handleInputChange}
                    style={{marginTop: '3px'}}
                    required
                  />
                  <input 
                    type="text" 
                    className="input-field"
                    name="infoAdicional"
                    value={formData.infoAdicional}
                    onChange={handleInputChange}
                    placeholder="Información adicional (opcional)" 
                    style={{marginTop: '3px'}}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="puesto-ingreso">
          <strong>PUESTO DE </strong>
          <select 
            className="ingreso-egreso-select" 
            id="tipo-puesto"
            name="tipoPuesto"
            value={formData.tipoPuesto}
            onChange={handleInputChange}
          >
            <option value="INGRESO/EGRESO">INGRESO/EGRESO</option>
            <option value="INGRESO">INGRESO</option>
            <option value="EGRESO">EGRESO</option>
          </select>
          <strong>:</strong>
          <input 
            type="text" 
            className="input-field puesto-input" 
            id="puesto-detalle"
            name="puestoDetalle"
            value={formData.puestoDetalle}
            onChange={handleInputChange}
            placeholder="ECO/CHECKPOINT" 
            required
          />
        </div>
        
        <div className="form-section">
          <div className="form-section-title">Artículos a Ingresar/Egresar <span className="required">*</span></div>
          <table className="tabla-articulos">
            <thead>
              <tr>
                <th style={{width: '5%'}}>Nº</th>
                <th style={{width: '20%'}}>NATURALEZA</th>
                <th style={{width: '30%'}}>MARCA</th>
                <th style={{width: '25%'}}>Nº SERIE O REGISTRO</th>
                <th style={{width: '10%'}}>CANTIDAD</th>
                <th style={{width: '10%'}} className="no-print">ACCIÓN</th>
              </tr>
            </thead>
            <tbody id="articulos-body">
              {articulos.map((articulo, index) => (
                <tr key={index}>
                  <td>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={articulo.numero} 
                      readOnly
                    />
                  </td>
                  <td>
                    <input 
                      type="text" 
                      className="input-field articulo-naturaleza"
                      value={articulo.naturaleza}
                      onChange={(e) => handleArticuloChange(index, 'naturaleza', e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <input 
                      type="text" 
                      className="input-field"
                      value={articulo.marca}
                      onChange={(e) => handleArticuloChange(index, 'marca', e.target.value)}
                    />
                  </td>
                  <td>
                    <input 
                      type="text" 
                      className="input-field"
                      value={articulo.serie}
                      onChange={(e) => handleArticuloChange(index, 'serie', e.target.value)}
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      className="input-field"
                      value={articulo.cantidad}
                      onChange={(e) => handleArticuloChange(index, 'cantidad', e.target.value)}
                      min="1" 
                      required
                    />
                  </td>
                  <td className="no-print">
                    <button 
                      className="btn btn-danger" 
                      onClick={() => removeArticulo(index)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <button 
            className="btn btn-secondary no-print" 
            onClick={addArticulo}
          >
            Añadir Artículo
          </button>
        </div>
        
        <div className="actions no-print">
          <button className="btn" onClick={validarFormulario}>Validar Formulario</button>
          <button className="btn btn-secondary" onClick={handlePrint}>Imprimir Documento</button>
        </div>
      </div>
      
      {/* Segunda página */}
      <div className="container-second page-break print-margin">
        <div className="header">
          <div className="logo-container">
            <img src="/assets/LOGO.png" alt="Logo PSA" />
          </div>           
        </div>
        
        <p className="nota">
          ***La presentación de una solicitud para la autorización de ingreso/egreso de objetos, no representa por si sola una autorización automática de la misma, dicho pedido se podrá extender hasta un máximo de una semana para casos excepcionales.***
        </p>
        
        <p>Maniobra que efectuarán el personal técnico de sistemas ARSA:</p>
        <h2>Credenciales del Personal</h2>
        <p>Seleccione las imágenes de las credenciales del personal involucrado:</p>
        
        <input 
          type="file" 
          id="credential-upload" 
          accept=".jpg,.jpeg,.png" 
          multiple 
          className="no-print" 
          style={{display: 'none'}}
          onChange={handleCredencialUpload}
        />
        <button 
          className="btn btn-secondary no-print" 
          onClick={() => document.getElementById('credential-upload').click()}
        >
          Añadir Credencial
        </button>
        
        <div className="flex-container" id="credentials-container">
          {credenciales.map((credencial, index) => (
            <div key={index} className="credential-box">
              <img src={credencial} alt={`Credencial ${index + 1}`} />
              <button 
                className="remove-btn no-print"
                onClick={() => removeCredencial(index)}
              >
                X
              </button>
            </div>
          ))}
        </div>
        
        <div className="actions no-print" style={{marginTop: '15px'}}>
          <button className="btn" onClick={handlePrint}>Imprimir Documento</button>
        </div>
      </div>
    </div>
  );
};

export default NotaPSA;