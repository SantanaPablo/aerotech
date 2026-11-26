import { useEffect, useRef, useState } from 'react';
import '../css/NotaPSA.css';

const FILAS = 10;
const CONTROL_ALTERNATIVO = 'CONTROL ALTERNATIVO';
const CAMPOS_VIGENCIA = [
  ['desde', 'Fecha de inicio (Desde)', 'date'], ['hasta', 'Fecha de fin (Hasta)', 'date'],
  ['horaIngreso', 'Hora de ingreso', 'time'], ['horaEgreso', 'Hora de egreso', 'time'],
];
const ROLES = ['Contratista', 'Subcontratista', 'Proveedor', 'Responsable de Tarea'];
const SECTORES = ['Zona de Seguridad Restringida (ZSR)', 'Sector Estéril', 'Zona Pública'];
const PUESTOS = [
  ['Emb. Nacional', 'Emb. Internacional', 'Arribo Nacional', 'Arribo Internacional'],
  ['ECO', 'PAMPA', 'ECO', 'PAMPA'],
  ['BRAVO', 'Check Point', 'BRAVO', 'Check Point'],
  ['Barrera Cargas', '', 'Barrera Cargas', ''],
];
const MEDIDAS = ['Cerradura', 'CCTV', 'Seguridad Privada'];
const CAMPOS_PERSONA = {
  nombre: 'Nombre y Apellido', dni: 'D.N.I.', empresa: 'Empresa', cargo: 'Función / Cargo',
  numeroPpa: 'N° PPA', vencimiento: 'Venc. PPA', telefono: 'Teléfono',
};
const CAMPOS_OBJETO = [
  ['articulo', 'Artículo / Elemento'], ['marca', 'Marca'], ['serie', 'N° de Serie / Reg.'],
  ['cantidad', 'Cant.'], ['controlAlternativo', 'Ctrl. alt.'], ['observaciones', 'Observaciones'],
];
const ROLES_RESPONSABLES = ['TITULAR', 'SUPLENTE'];
const COMPROMISOS = [
  'Limitar el acceso, traslado y uso de los objetos autorizados EXCLUSIVAMENTE al personal consignado en la presente solicitud.',
  'Facilitar las tareas de fiscalización del personal de la PSA, exhibiendo los objetos, registros y medidas de seguridad cuando sean requeridos.',
  'Comunicar de manera INMEDIATA a la PSA cualquier novedad, faltante, extravío, daño o modificación respecto de los elementos autorizados.',
  'Justificar formalmente ante la PSA en un plazo no mayor a 24 HORAS cualquier inconsistencia detectada durante las fiscalizaciones.',
  'Retirar de inmediato del ámbito aeroportuario todo elemento sobrante no declarado oportunamente.',
];

function Campo({ etiqueta, valor = '', cambiar, tipo = 'text', multilinea = false, impreso = valor }) {
  const props = {
    className: 'psa-campo psa-no-print',
    'aria-label': etiqueta,
    value: valor,
    onChange: (event) => cambiar(event.target.value),
  };

  return (
    <>
      {multilinea ? <textarea {...props} rows={2} /> : <input {...props} type={tipo} min={tipo === 'number' ? 1 : undefined} />}
      <span className="psa-solo-impresion psa-valor">{impreso}</span>
    </>
  );
}

function Opcion({ children, marcado, cambiar, grupo, etiqueta }) {
  return (
    <label className="psa-opcion">
      <input
        className="psa-no-print"
        type={grupo ? 'radio' : 'checkbox'}
        name={grupo}
        aria-label={etiqueta}
        checked={marcado}
        onChange={cambiar}
        disabled={!cambiar}
      />
      <span aria-hidden="true" className="psa-solo-impresion psa-casilla">{marcado ? 'X' : ''}</span>
      {children}
    </label>
  );
}

function Documento({ empresa, children }) {
  const empresaImpresion = JSON.stringify(`Empresa: ${empresa || '______________________________'}`).replaceAll('<', '\\3c ');
  return (
    <article className="psa-hoja" aria-label="Solicitud de autorización">
      <style>{`@page nota-psa { @bottom-left { content: ${empresaImpresion}; } }`}</style>
      <header className="psa-encabezado">
        <span>POLICÍA DE SEGURIDAD AEROPORTUARIA · UOSP METROPOLITANA</span>
        <img src="/assets/logo-psa.png" alt="Escudo de la PSA" />
      </header>
      {children}
      <footer className="psa-pie">
        <span>Empresa: {empresa || '______________________________'}</span>
      </footer>
    </article>
  );
}

function Titulo({ children }) {
  return <h2 className="psa-titulo-seccion">{children}</h2>;
}

function Columnas({ anchos }) {
  const total = anchos.reduce((suma, ancho) => suma + ancho, 0);
  return <colgroup>{anchos.map((ancho, indice) => <col key={indice} style={{ width: `${ancho / total * 100}%` }} />)}</colgroup>;
}

function fechaCorta(fecha) {
  return fecha ? fecha.split('-').reverse().join('/') : '';
}

function fechaPpa(fecha) {
  const partes = fecha?.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (!partes) return null;
  const [, dia, mes, anio] = partes;
  const vencimiento = new Date(`${anio}-${mes}-${dia}T00:00:00Z`);
  return vencimiento.getUTCDate() === Number(dia) ? vencimiento : null;
}

function estadoVencimiento(fecha, hoy) {
  const vencimiento = fechaPpa(fecha);
  if (!vencimiento) return '';
  const dias = (vencimiento - new Date(hoy)) / 86400000;
  if (dias < 0) return 'Vencida';
  return dias <= 30 ? 'Por vencer' : 'OK';
}

const CLASE_ESTADO = { Vencida: 'vencida', 'Por vencer': 'por-vencer', OK: 'vigente' };

function Modal({ titulo, cerrar, children }) {
  const dialogo = useRef(null);
  useEffect(() => { dialogo.current.showModal(); }, []);
  return (
    <dialog ref={dialogo} className="psa-modal psa-no-print" aria-label={titulo}
      onCancel={(event) => { event.preventDefault(); cerrar(); }}>
      <header><h2>{titulo}</h2><button type="button" onClick={cerrar}>Cerrar</button></header>
      {children}
    </dialog>
  );
}

async function cargarJson(archivo, signal) {
  const respuesta = await fetch(`/${archivo}`, { signal, cache: 'no-cache' });
  if (!respuesta.ok) throw new Error(archivo);
  return respuesta.json();
}

export default function NotaPSA() {
  const [autoridades, setAutoridades] = useState({});
  const [tecnicos, setTecnicos] = useState([]);
  const [modal, setModal] = useState('');
  const [errores, setErrores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [hoy] = useState(() => new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date()));
  const [datos, setDatos] = useState({
    lugar: 'Ciudad Autónoma de Buenos Aires',
    fecha: hoy,
    empresa: 'Aerolineas Argentinas',
    actividades: 'Explotador Aerocomercial',
    tipo: 'temporal',
    horaIngreso: '00:00',
    horaEgreso: '23:59',
    area: 'Sector espigón / Hangares / Cargas / Mantenimiento de linea',
    motivo: 'Uso diario para la administración de recursos, operatoria y proyecciones.',
    aclaracion: 'Martin Rivera',
    dniFirmante: '24.207.164',
    cargoFirmante: 'Ad. RR.HH',
    rol: 'Responsable de Tarea',
    sector: 'Sector Estéril',
  });
  const [opciones, setOpciones] = useState({
    'Ingreso — Emb. Nacional': true, 'Ingreso — Emb. Internacional': true,
    'Egreso — Arribo Nacional': true, 'Egreso — Arribo Internacional': true,
    'Ingreso — ECO': true, 'Ingreso — Check Point': true,
    'Egreso — ECO': true, 'Egreso — Check Point': true,
  });
  const [objetos, setObjetos] = useState(() => Array.from({ length: FILAS }, () => ({})));
  const [nomina, setNomina] = useState([]);
  const [responsables, setResponsables] = useState({});
  const siguientePersonaManual = useRef(0);
  const agregarPersona = () => {
    const id = `manual-${++siguientePersonaManual.current}`;
    setNomina((prev) => [...prev, { id, nombre: '' }]);
  };
  const personalCatalogo = nomina.filter(({ id }) => !String(id).startsWith('manual-'));
  const personalManual = nomina.filter(({ id }) => String(id).startsWith('manual-'));
  const filasVacias = Array(Math.max(0, FILAS - personalCatalogo.length)).fill(null);
  const filasNomina = [...personalCatalogo, ...filasVacias, ...personalManual];
  const subinspector = (autoridades.subinspector || autoridades.subjefe || '').replace(/^SUB\.?\s*INSPECTOR\s*:?[\s-]*/i, '');

  useEffect(() => {
    const controlador = new AbortController();
    Promise.allSettled([
      cargarJson('Autoridades.json', controlador.signal),
      cargarJson('Tecnicos.json', controlador.signal),
    ]).then(([autoridadesResultado, tecnicosResultado]) => {
      if (controlador.signal.aborted) return;

      const fallos = [];
      if (autoridadesResultado.status === 'fulfilled' && autoridadesResultado.value && typeof autoridadesResultado.value === 'object') {
        setAutoridades(autoridadesResultado.value);
      } else {
        fallos.push('Autoridades.json');
      }
      if (tecnicosResultado.status === 'fulfilled' && Array.isArray(tecnicosResultado.value?.tecnicos)) {
        setTecnicos(tecnicosResultado.value.tecnicos);
      } else {
        fallos.push('el catálogo de técnicos');
      }
      setErrores(fallos);
      setCargando(false);
    });
    return () => controlador.abort();
  }, []);

  const campo = (nombre, etiqueta, tipo = 'text', multilinea = false, impreso = datos[nombre]) => (
    <Campo etiqueta={etiqueta} tipo={tipo} multilinea={multilinea} valor={datos[nombre]} impreso={impreso}
      cambiar={(valor) => setDatos((prev) => ({ ...prev, [nombre]: valor }))} />
  );

  const opcion = (nombre, etiqueta = nombre) => (
    <Opcion key={nombre} marcado={!!opciones[nombre]} cambiar={() => setOpciones((prev) => ({ ...prev, [nombre]: !prev[nombre] }))}>
      {etiqueta}
    </Opcion>
  );

  const elegir = (campo, valor, etiqueta = valor) => (
    <Opcion key={valor} grupo={`psa-${campo}`} marcado={datos[campo] === valor}
      cambiar={() => setDatos((prev) => ({ ...prev, [campo]: valor }))}>{etiqueta}</Opcion>
  );

  const alternarTecnico = (tecnico) => {
    setNomina((prev) => {
      if (prev.some(({ id }) => id === tecnico.id)) return prev.filter(({ id }) => id !== tecnico.id);
      return [...prev, tecnico];
    });
  };

  const cambiarPersona = (id, nombre, valor) => {
    setNomina((prev) => prev.map((persona) => persona.id === id ? { ...persona, [nombre]: valor } : persona));
  };

  const personaCampo = (persona, nombre, contexto) => persona && (
    <Campo etiqueta={`${contexto} — ${CAMPOS_PERSONA[nombre]}`} valor={persona[nombre]?.toString()}
      cambiar={(valor) => cambiarPersona(persona.id, nombre, valor)} />
  );

  const cambiarObjeto = (indice, nombre, valor) => {
    setObjetos((prev) => prev.map((objeto, fila) => {
      if (fila !== indice) return objeto;
      if (nombre !== 'controlAlternativo') return { ...objeto, [nombre]: valor };

      const texto = objeto.observaciones || '';
      const prefijo = `${CONTROL_ALTERNATIVO} — `;
      let observaciones = texto;
      if (valor && !texto.toUpperCase().includes(CONTROL_ALTERNATIVO)) {
        observaciones = texto.trim() ? prefijo + texto : CONTROL_ALTERNATIVO;
      }
      if (!valor && texto === CONTROL_ALTERNATIVO) observaciones = '';
      if (!valor && texto.startsWith(prefijo)) observaciones = texto.slice(prefijo.length);
      return { ...objeto, controlAlternativo: valor, observaciones };
    }));
  };

  const total = objetos.reduce((suma, { cantidad }) => {
    const unidades = Number(cantidad);
    return Number.isInteger(unidades) && unidades > 0 ? suma + unidades : suma;
  }, 0);

  return (
    <div className="psa-nota">
      <div className="psa-herramientas psa-no-print">
        <button type="button" onClick={() => setModal('seleccion')}>Seleccionar técnicos</button>
        <button type="button" onClick={() => window.print()}>Imprimir documento</button>
        {errores.length > 0 && <p role="alert">No se pudo cargar {errores.join(' ni ')}.</p>}

      </div>

      {modal === 'seleccion' && (
        <Modal titulo="Seleccionar técnicos" cerrar={() => setModal('')}>
          {cargando && <p role="status">Cargando técnicos…</p>}
          {!cargando && tecnicos.length === 0 && <p>No hay técnicos disponibles.</p>}
          <div className="psa-lista-tecnicos">
            {tecnicos.map((tecnico) => {
              const seleccionado = nomina.some(({ id }) => id === tecnico.id);
              const estado = estadoVencimiento(tecnico.vencimiento, hoy);
              return (
                <label className="psa-tarjeta-tecnico" key={tecnico.id}>
                  <input type="checkbox" checked={seleccionado}
                    onChange={() => {
                      alternarTecnico(tecnico);
                      if (seleccionado) {
                        setResponsables((prev) => Object.fromEntries(
                          Object.entries(prev).filter(([, id]) => id !== String(tecnico.id)),
                        ));
                      }
                    }} />
                  <div>
                    <strong>{tecnico.nombre}</strong>
                    <dl>
                      {Object.entries({ legajo: 'Legajo', ...CAMPOS_PERSONA }).filter(([campo]) => campo !== 'nombre').map(([campo, etiqueta]) => (
                        <div key={campo}><dt>{etiqueta}</dt><dd>{tecnico[campo] || '—'}</dd></div>
                      ))}
                    </dl>
                  </div>
                  <span className={`psa-estado ${CLASE_ESTADO[estado] ?? ''}`}>{estado || 'Sin fecha'}</span>
                </label>
              );
            })}
          </div>
        </Modal>
      )}

      <Documento empresa={datos.empresa}>
        <div className="psa-primera-pagina">
        <div className="psa-portada">
          <h1>SOLICITUD DE AUTORIZACIÓN TRANSITORIA / TEMPORAL DE INGRESO Y EGRESO</h1>
          <div className="psa-logo"><img src="/assets/LOGO.png" alt="Logo de la empresa" /></div>
        </div>

        <div className="psa-destinatario">
          <div>
            <em>Lugar y Fecha:</em>
            <div className="psa-fecha">
              {campo('lugar', 'Lugar')}
              {campo('fecha', 'Fecha de la solicitud', 'date', false, datos.fecha ? new Intl.DateTimeFormat('es-AR', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(datos.fecha)) : '')}
            </div>
            <div className="psa-autoridad">
              AL SR. JEFE DE UNIDAD OPERACIONAL DE SEGURIDAD PREVENTIVA METROPOLITANA<br />
              POLICÍA DE SEGURIDAD AEROPORTUARIA (PSA)<br />
              AEROPUERTO INTERNACIONAL AEROPARQUE JORGE NEWBERY S / D<br />
              JEFATURA DE UNIDAD OPERACIONAL METROPOLITANA<br />
              JEFE UOSP METRO-Sub. Inspector: {subinspector}<br />
              {autoridades.aduana || 'JEFATURA DIVISIÓN ADUANA AEROPARQUE'}<br />
              AEROPUERTOS ARGENTINA 2000 S.A.
            </div>
          </div>
          <section className="psa-reservado" aria-label="Reservado para autorización de la PSA">
            <h2>RESERVADO PARA AUTORIZACIÓN - PSA</h2>
            <div className="psa-reservado-opciones">
              <Opcion marcado={false}>AUTORIZADO</Opcion>
              <Opcion marcado={false}>RECHAZADO</Opcion>
            </div>
            <div className="psa-sello">Firma y sello:</div>
          </section>
        </div>

        <div className="psa-aviso">
          <strong>INFORMACIÓN IMPORTANTE SOBRE PLAZOS Y PRESENTACIÓN</strong>
          <ul>
            <li><b>Antelación mínima:</b> la nota debe presentarse con al menos <b>72 HORAS DE ANTICIPACIÓN</b> al inicio de la actividad.</li>
            <li><b>Retiro de solicitud:</b> transcurridas <b>48 HORAS</b> desde la presentación en Mesa de Entradas, indicando el N° de Expediente.</li>
            <li><b>Cantidad de copias:</b> UN (1) ORIGINAL y UNA (1) COPIA por cada Puesto de Control requerido.</li>
          </ul>
          <div className="psa-ejemplo">Ejemplo: para 3 Puestos de Control corresponde 1 original + 3 copias.</div>
          <div className="psa-leyenda"><span aria-hidden="true">■</span> Los campos sombreados en ámbar son de uso exclusivo de la PSA; la empresa no debe completarlos.</div>
        </div>

        <Titulo>1. DATOS DE LA EMPRESA SOLICITANTE</Titulo>
        <table className="psa-tabla psa-datos">
          <Columnas anchos={[2200, 8000]} />
          <tbody>
            <tr><th scope="row">Razón Social / Empresa:</th><td>{campo('empresa', 'Razón Social / Empresa')}</td></tr>
            <tr><th scope="row">Carácter / Rol de la Empresa:</th><td><div className="psa-opciones">{ROLES.map((rol) => elegir('rol', rol))}</div></td></tr>
            <tr><th scope="row">Detalle de Actividades Operativas:</th><td>{campo('actividades', 'Detalle de Actividades Operativas', 'text', true)}</td></tr>
          </tbody>
        </table>

        <Titulo>2. TIPO DE AUTORIZACIÓN, FECHAS Y HORARIOS</Titulo>
        <table className="psa-tabla psa-autorizacion">
          <Columnas anchos={[1, 1, 1, 1]} />
          <tbody>
            <tr>
              {[
                ['transitoria', 'AUTORIZACIÓN TRANSITORIA', '24 HORAS.', 'Para tareas específicas que inician y finalizan en el día.'],
                ['temporal', 'AUTORIZACIÓN TEMPORAL', 'TRES (03) MESES.', 'Para elementos electrónicos.'],
              ].map(([tipo, titulo, duracion, descripcion]) => (
                <td key={tipo} colSpan={2} className="psa-modalidad">
                  <Opcion grupo="psa-tipo" marcado={datos.tipo === tipo} cambiar={() => setDatos((prev) => ({ ...prev, tipo }))}><b>{titulo}</b></Opcion>
                  <div>Duración máxima: <b>{duracion}</b> {descripcion}</div>
                </td>
              ))}
            </tr>
            <tr>{CAMPOS_VIGENCIA.map(([nombre, etiqueta]) => <th key={nombre} scope="col">{etiqueta}</th>)}</tr>
            <tr>{CAMPOS_VIGENCIA.map(([nombre, etiqueta, formato]) => (
              <td key={nombre} className="psa-vigencia-valor">
                {campo(nombre, etiqueta, formato, false,
                  formato === 'date' ? fechaCorta(datos[nombre]) || 'DD / MM / AAAA' : `${datos[nombre] || 'HH : MM'} hs`)}
              </td>
            ))}</tr>
          </tbody>
        </table>

        <Titulo>3. UBICACIÓN, PUESTOS DE CONTROL Y GUARDA</Titulo>
        <table className="psa-tabla psa-datos psa-ubicacion">
          <Columnas anchos={[1500, 2175, 2175, 2175, 2175]} />
          <tbody>
            <tr><th scope="row">Sector de uso del objeto:</th><td colSpan={4}><div className="psa-opciones">{SECTORES.map((sector) => elegir('sector', sector))}</div></td></tr>
            <tr><th scope="row">Área / Local específico:</th><td colSpan={4}>{campo('area', 'Área / Local específico')}</td></tr>
            <tr><th rowSpan={6} scope="rowgroup">PUESTOS DE CONTROL</th><th className="psa-cabecera-media" colSpan={2}>PUESTO DE INGRESO</th><th className="psa-cabecera-media" colSpan={2}>PUESTO DE EGRESO</th></tr>
            {PUESTOS.map((fila) => (
              <tr key={fila[0]}>
                {fila.map((puesto, i) => <td key={i}>{puesto && opcion(`${i < 2 ? 'Ingreso' : 'Egreso'} — ${puesto}`, puesto)}</td>)}
              </tr>
            ))}
            <tr>{['Ingreso', 'Egreso'].map((sentido) => (
              <td colSpan={2} key={sentido}>
                <div className="psa-otro">{opcion(`Otro ${sentido}`, 'Otro:')}{campo(`otro${sentido}`, `Otro puesto de ${sentido.toLowerCase()}`)}</div>
              </td>
            ))}</tr>
            <tr>
              <th scope="row">Lugar de resguardo / guarda:</th>
              <td colSpan={4}>
                <div className="psa-opciones">
                  <Opcion marcado={datos.tipo === 'transitoria'}>Transitoria: ingreso y egreso en el día</Opcion>
                  {datos.tipo === 'temporal' && <>
                    {elegir('guarda', 'diaria', 'Ingreso y egreso diario durante el período autorizado')}
                    {elegir('guarda', 'aeropuerto', 'Local, oficina o depósito dentro del aeropuerto')}
                  </>}
                </div>
                {datos.tipo === 'temporal' && datos.guarda === 'aeropuerto' && campo('lugarGuarda', 'Local, oficina o depósito asignado')}
              </td>
            </tr>
            {datos.tipo === 'temporal' && <tr>
              <th scope="row">Medidas de seguridad (solo temporal):</th>
              <td colSpan={4}><div className="psa-opciones">{MEDIDAS.map((medida) => opcion(medida))}</div></td>
            </tr>}
          </tbody>
        </table>
        <Titulo>4. MOTIVO / ACTIVIDAD A REALIZAR</Titulo>
        <div className="psa-motivo">
          <p>Descripción detallada de la tarea y finalidad operativa que justifica la necesidad del ingreso de los objetos:</p>
          {campo('motivo', 'Motivo / Actividad a realizar', 'text', true)}
        </div>
        </div>

        <Titulo>5. DETALLE DE OBJETOS A INGRESAR / EGRESAR</Titulo>
        <p className="psa-instruccion">Si el objeto detallado es de grandes dimensiones, tildar “Ctrl. alt.” y consignar en observaciones: <b>CONTROL ALTERNATIVO.</b></p>
        <table className="psa-tabla psa-planilla psa-objetos">
          <Columnas anchos={[450, 2400, 1200, 1757, 851, 850, 2835]} />
          <thead>
            <tr><th className="psa-cabecera-media" colSpan={7}>DECLARADO POR LA EMPRESA</th></tr>
            <tr><th scope="col">N°</th>{CAMPOS_OBJETO.map(([nombre, titulo]) => <th key={nombre} scope="col">{titulo}</th>)}</tr>
          </thead>
          <tbody>
            {objetos.map((objeto, indice) => (
              <tr key={indice}>
                <th scope="row">{String(indice + 1).padStart(2, '0')}</th>
                {CAMPOS_OBJETO.map(([nombre, etiqueta]) => (
                  <td key={nombre}>
                    {nombre === 'controlAlternativo' ? (
                      <Opcion marcado={!!objeto.controlAlternativo}
                        etiqueta={`Objeto ${indice + 1} — Control alternativo`}
                        cambiar={(event) => cambiarObjeto(indice, nombre, event.target.checked)} />
                    ) : (
                        <Campo etiqueta={`Objeto ${indice + 1} — ${etiqueta}`}
                          valor={objeto[nombre]} tipo={nombre === 'cantidad' ? 'number' : 'text'}
                          cambiar={(valor) => cambiarObjeto(indice, nombre, valor)} />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><th colSpan={4} scope="row">TOTAL DE OBJETOS DECLARADOS (suma de Cant.)</th><td>{total || ''}</td><td colSpan={2} /></tr>
          </tfoot>
        </table>
          <button className="psa-agregar-fila psa-no-print" type="button" onClick={() => setObjetos((prev) => [...prev, {}])}>
            Agregar línea de objeto
          </button>
        <Titulo>6. DESIGNACIÓN DE RESPONSABLES DE LOS OBJETOS (Titular y Suplente)</Titulo>
        <table className="psa-tabla psa-planilla psa-responsables">
          <Columnas anchos={[1000, 2400, 1250, 1100, 1100, 1300, 2193]} />
          <thead>
            <tr>{['Rol', 'Nombre y Apellido', 'D.N.I.', 'N° PPA', 'Venc. PPA', 'Teléfono', 'Firma'].map((titulo) => <th key={titulo} scope="col">{titulo}</th>)}</tr>
          </thead>
          <tbody>
            {ROLES_RESPONSABLES.map((rol) => {
              const persona = nomina.find(({ id }) => String(id) === responsables[rol]);
              const otro = ROLES_RESPONSABLES.find((opcion) => opcion !== rol);
              return (
                <tr key={rol}>
                  <th scope="row">{rol}</th>
                  <td>
                    <select className="psa-campo psa-no-print" aria-label={`Responsable ${rol.toLowerCase()}`}
                      value={persona ? String(persona.id) : ''}
                      onChange={(event) => setResponsables((prev) => ({ ...prev, [rol]: event.target.value }))}>
                      <option value="">Seleccionar</option>
                      {nomina.filter(({ id, nombre }) => nombre.trim() || String(id) === responsables[rol]).map(({ id, nombre }) => (
                        <option key={id} value={id} disabled={String(id) === responsables[otro]}>{nombre || 'Sin nombre'}</option>
                      ))}
                    </select>
                    <span className="psa-solo-impresion psa-valor">{persona?.nombre}</span>
                  </td>
                  {['dni', 'numeroPpa', 'vencimiento', 'telefono'].map((nombre) => <td key={nombre}>{personaCampo(persona, nombre, rol)}</td>)}
                  <td />
                </tr>
              );
            })}
          </tbody>
        </table>
        <Titulo>7. NÓMINA DE PERSONAL AUTORIZADO A MANIPULAR / UTILIZAR LOS OBJETOS</Titulo>
        <table className="psa-tabla psa-planilla psa-nomina">
          <Columnas anchos={[450, 2300, 1300, 1750, 1600, 1100, 1701]} />
          <thead>
            <tr>
              <th scope="col">N°</th>
              {['nombre', 'dni', 'empresa', 'cargo', 'numeroPpa', 'vencimiento'].map((nombre) => <th scope="col" key={nombre}>{CAMPOS_PERSONA[nombre]}</th>)}
            </tr>
          </thead>
          <tbody>
            {filasNomina.map((persona, fila) => (
              <tr key={persona ? `persona-${persona.id}` : `vacia-${fila}`}>
                <th scope="row">{String(fila + 1).padStart(2, '0')}</th>
                {['nombre', 'dni', 'empresa', 'cargo', 'numeroPpa', 'vencimiento'].map((nombre) => (
                  <td key={nombre}>{personaCampo(persona, nombre, `Técnico ${fila + 1}`)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <button className="psa-agregar-fila psa-no-print" type="button" onClick={agregarPersona}>Agregar línea de personal</button>
        <section className="psa-declaracion-final">
        <Titulo>8. DECLARACIÓN JURADA Y COMPROMISO DE CUMPLIMIENTO</Titulo>
        <div className="psa-declaracion">
          <p>Por la presente, la empresa solicitante asume la responsabilidad formal y se compromete expresamente a:</p>
          <ol>{COMPROMISOS.map((compromiso) => <li key={compromiso}>{compromiso}</li>)}</ol>
        </div>
        <table className="psa-tabla psa-datos psa-firma">
          <Columnas anchos={[5400, 1200, 3600]} />
          <tbody>
            <tr>
              <td className="psa-firma-empresa" rowSpan={3}>
                <strong>POR LA EMPRESA SOLICITANTE</strong>
                <span>Firma y sello del Responsable / Apoderado</span>
              </td>
              <th scope="row">Aclaración:</th><td>{campo('aclaracion', 'Aclaración')}</td>
            </tr>
            <tr><th scope="row">D.N.I.:</th><td>{campo('dniFirmante', 'D.N.I. del firmante')}</td></tr>
            <tr><th scope="row">Cargo:</th><td>{campo('cargoFirmante', 'Cargo del firmante')}</td></tr>
          </tbody>
        </table>
        </section>
      </Documento>
    </div>
  );
}
