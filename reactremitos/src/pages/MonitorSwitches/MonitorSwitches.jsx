import React, { useState, useEffect } from 'react';

import PcIcon from '../.././assets/icons/pc.svg?react';
import CctvIcon from '../.././assets/icons/cctv.svg?react';
import ClockIcon from '../.././assets/icons/clock.svg?react';
import PrinterIcon from '../.././assets/icons/printer.svg?react';
import RadioIcon from '../.././assets/icons/radio.svg?react';
import TvIcon from '../.././assets/icons/tv.svg?react';
import WifiIcon from '../.././assets/icons/wifi.svg?react';
import LinkIcon from '../.././assets/icons/link.svg?react';
import bgImage from '../.././assets/cisco-catalyst.png';
import SSHFront from './SSHFront';
import PingFront from './PingFront';

const API_BASE_URL = 'http://10.35.144.252:5063/api/Monitor'; 

function RealTimeClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center bg-[#111827] px-4 py-2 rounded-lg border border-slate-700 shadow-md">
      <span className="font-mono text-l text-slate-200 tracking-wider">
        {time.toLocaleTimeString('es-AR', { hour12: false })}
      </span>
    </div>
  );
}

function SelectorPanel({ onConsultar }) {
  const [edificios, setEdificios] = useState([]);
  const [cuartos, setCuartos] = useState([]);
  const [equipos, setEquipos] = useState([]);

  const [edificioId, setEdificioId] = useState('');
  const [cuartoId, setCuartoId] = useState('');
  const [equipoId, setEquipoId] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/edificios`)
      .then(res => res.json())
      .then(data => setEdificios(data))
      .catch(err => console.error("Error cargando edificios:", err));
  }, []);

  useEffect(() => {
    if (edificioId) {
      fetch(`${API_BASE_URL}/edificios/${edificioId}/cuartos`)
        .then(res => res.json())
        .then(data => setCuartos(data))
        .catch(err => console.error("Error cargando cuartos:", err));
    } else {
      setCuartos([]);
    }
    setCuartoId('');
    setEquipos([]);
    setEquipoId('');
  }, [edificioId]);

  useEffect(() => {
    if (cuartoId) {
      fetch(`${API_BASE_URL}/cuartos/${cuartoId}/dispositivos`)
        .then(res => res.json())
        .then(data => setEquipos(data))
        .catch(err => console.error("Error cargando equipos:", err));
    } else {
      setEquipos([]);
    }
    setEquipoId('');
  }, [cuartoId]);

  return (
    <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-800 shadow-lg mb-6">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 font-medium ml-1">1. Selecciona Edificio</label>
          <select value={edificioId} onChange={(e) => setEdificioId(e.target.value)} className="w-full bg-[#1E293B] text-slate-200 border border-slate-700 rounded-md p-2.5 outline-none focus:border-blue-500 text-sm cursor-pointer">
            <option value="">Seleccione...</option>
            {edificios.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 font-medium ml-1">2. Selecciona Cuarto</label>
          <select value={cuartoId} onChange={(e) => setCuartoId(e.target.value)} disabled={!edificioId} className="w-full bg-[#1E293B] text-slate-200 border border-slate-700 rounded-md p-2.5 outline-none focus:border-blue-500 text-sm disabled:opacity-50 cursor-pointer">
            <option value="">Seleccione...</option>
            {cuartos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 font-medium ml-1">3. Selecciona Switch / FEX</label>
          <select value={equipoId} onChange={(e) => setEquipoId(e.target.value)} disabled={!cuartoId} className="w-full bg-[#1E293B] text-slate-200 border border-slate-700 rounded-md p-2.5 outline-none focus:border-blue-500 text-sm disabled:opacity-50 cursor-pointer">
            <option value="">Seleccione...</option>
            {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombreEdificio} ({eq.ipSwitch})</option>)}
          </select>
        </div>

        <button onClick={() => onConsultar(equipoId)} disabled={!equipoId} className={`h-[42px] px-6 rounded-md font-medium transition-all ${equipoId ? 'bg-[#2563EB] hover:bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
          Consultar
        </button>
      </div>
    </div>
  );
}

const Icons = {
  pc: <PcIcon className="w-6 h-6" />,
  cctv: <CctvIcon className="w-6 h-6" />,
  clock: <ClockIcon className="w-6 h-6" />,
  printer: <PrinterIcon className="w-6 h-6" />,
  radio: <RadioIcon className="w-5 h-5" />,
  wifi: <WifiIcon className="w-5 h-5" />,
  link: <LinkIcon className="w-5 h-5" />,
  tv: <TvIcon className="w-6 h-6" />
};

const getConfigFrontend = (data) => {
  if (data.isDisabled) return { hex: '#334155', bg: 'bg-[#334155]', border: 'border-[#475569]', icon: Icons.pc, label: 'Apagado' };
  if (data.vlan === 'Error / N/A' || data.vlan === 'Timeout') return { hex: '#EF4444', bg: 'bg-red-500', border: 'border-red-300', icon: Icons.pc, label: 'Error' };

  const usoStr = (data.uso || '').toLowerCase();
  const vlanStr = (data.vlan || '').toString();

  if (usoStr.includes('cctv') || usoStr.includes('cámara') || vlanStr === '177') {
    return { hex: '#EA580C', bg: 'bg-[#EA580C]', border: 'border-[#FDBA74]', icon: Icons.cctv, label: 'CCTV' };
  }
  if (usoStr.includes('impres') || vlanStr === '50' || vlanStr === '30') {
    return { hex: '#0EA5E9', bg: 'bg-[#0EA5E9]', border: 'border-[#7DD3FC]', icon: Icons.printer, label: 'PRINT' };
  }
  if (usoStr.includes('fichador') || usoStr.includes('reloj') || usoStr.includes('bms') || vlanStr === '100' || vlanStr === '40') {
    return { hex: '#64748B', bg: 'bg-[#64748B]', border: 'border-[#CBD5E1]', icon: Icons.clock, label: 'FICHADOR' };
  }
  if (usoStr.includes('carteler') || vlanStr === '75' || vlanStr === '176') {
    return { hex: '#ec5c22', bg: 'bg-[#F59E0B]', border: 'border-[#FCD34D]', icon: Icons.tv, label: 'CARTELERIA' };
  }
  if (usoStr.includes('multicast') || (vlanStr === '56' && !usoStr.includes('radio'))) {
    return { hex: '#60A5FA', bg: 'bg-[#60A5FA]', border: 'border-[#93C5FD]', icon: Icons.radio, label: 'MULTICAST' };
  }
  // WIFI APs
  if (
    usoStr.includes('ap') ||
    usoStr.includes('wifi') ||
    vlanStr === '80'
  ) {
    return {
      hex: '#65A30D',
      bg: 'bg-[#65A30D]',
      border: 'border-[#A3E635]',
      icon: Icons.wifi,
      label: 'WIFI - Aps'
    };
  }

  // TRUNK / ENLACES
  if (
    usoStr.includes('trunk') ||
    usoStr.includes('uplink') ||
    usoStr.includes('enlace') ||
    data.vlan === 'Trunk / AP'
  ) {
    return {
      hex: '#14B8A6',
      bg: 'bg-[#14B8A6]',
      border: 'border-[#5EEAD4]',
      icon: Icons.link,
      label: 'TRUNK'
    };
  }
  if (usoStr.includes('radio') || usoStr.includes('micros') || vlanStr === '57' || vlanStr === '113') {
    return { hex: '#60A5FA', bg: 'bg-[#60A5FA]', border: 'border-[#C4B5FD]', icon: Icons.radio, label: 'Radio / Micros' };
  }
  if (usoStr.includes('Ksk') || usoStr.includes('Amos') || vlanStr === '71') 
    {
    return { hex: '#b15010', bg: 'bg-[#8B5CF6]', border: 'border-[#C4B5FD]', icon: Icons.pc, label: 'Ksk AMOS' };
  }
  return { hex: '#eab308', bg: 'bg-[#EAB308]', border: 'border-[#FEF08A]', icon: Icons.pc, label: 'USUARIOS' };
};

function Port({ data, isSelected, onClick }) {
  const styles = getConfigFrontend(data);
  const notchColor = data.isDisabled ? '#222222' : (data.isConnected ? '#39FF14' : '#ef4444');
  const numStr = data.nombrePuerto.split('/').pop() || '0';
  const portNum = parseInt(numStr, 10);

  return (
    <div className="flex flex-col items-center group" onClick={() => onClick(data)}>
      <div 
        className={`
          relative w-[42px] h-[42px] rounded-[6px] flex items-center justify-center cursor-pointer transition-all border-2
          ${styles.bg} ${styles.border}
          ${isSelected ? 'border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.9)] z-20 scale-110' : ''}
          hover:scale-110 hover:z-10 hover:shadow-lg
        `}
      >
        <div 
          style={{ backgroundColor: notchColor, boxShadow: `0 0 6px ${notchColor}cc` }}
          className="absolute top-[-2px] left-1/2 -translate-x-1/2 w-3.5 h-[6px] rounded-b-sm"
        ></div>
        
        <div className={`text-white drop-shadow-md ${data.isDisabled ? 'opacity-40' : ''}`}>
          {styles.icon}
        </div>
      </div>
      <span className={`mt-2 text-[11px] font-mono transition-colors ${isSelected ? 'text-blue-400 font-bold' : 'text-slate-400 group-hover:text-white'}`}>
        {portNum < 10 ? `0${portNum}` : portNum}
      </span>
    </div>
  );
}

function PortDetailsPanel({ port }) {
  if (!port) {
    return (
      <div className="bg-[#0B1120] p-6 rounded-2xl border border-slate-800 shadow-2xl h-full flex flex-col items-center justify-center text-center opacity-50 min-h-[300px]">
        <svg className="w-12 h-12 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
        <p className="text-slate-400">Haz clic en un puerto para<br/>ver sus detalles aquí.</p>
      </div>
    );
  }

  const styles = getConfigFrontend(port);

  return (
    <div className="bg-[#0B1120] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
      <div className="p-5 flex items-center justify-between border-b border-slate-800" style={{ backgroundColor: `${styles.hex}22` }}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center border border-white/20 text-white shadow-lg ${styles.bg}`}>
            {styles.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white font-mono" title={port.nombrePuerto}>
              {port.nombrePuerto.length > 12 ? port.nombrePuerto.substring(0,12)+'...' : port.nombrePuerto}
            </h2>
            <p className="text-sm text-slate-400">{port.uso || styles.label}</p>
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4 text-sm">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <span className="text-slate-500">Estado</span>
          <span className="text-slate-200 font-medium">
             {port.estadoEnlace}
          </span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <span className="text-slate-500">Administrativo</span>
          <span className="text-slate-200 font-medium">{port.isDisabled ? 'Shutdown' : 'No Shutdown'}</span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <span className="text-slate-500">VLAN</span>
          <span className="text-blue-400 font-mono bg-blue-900/30 px-2 py-0.5 rounded border border-blue-800/50">
            {port.vlan}
          </span>
        </div>
        
        <div className="pb-2">
          <span className="text-slate-500 block mb-2">Servicios en este puerto:</span>
          {port.servicios && port.servicios.length > 0 ? (
            <ul className="space-y-1">
              {port.servicios.map((srv, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-300 text-xs">
                  <span className="text-blue-500 mt-0.5">●</span> {srv}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-600 text-xs italic">No hay servicios definidos.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function MacAddressPanel({ port }) {
  if (!port) return null;

  return (
    <div className="bg-[#0B1120] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="p-4 border-b border-slate-800 bg-[#111827]">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          MAC Addresses (FDB)
        </h3>
      </div>
      <div className="p-4">
        {port.isConnected && port.macConectadas && port.macConectadas.length > 0 ? (
          <ul className="space-y-2">
            {port.macConectadas.map((mac, idx) => (
              <li key={idx} className="bg-[#1E293B] border border-slate-700 px-3 py-2 rounded-lg font-mono text-sm text-blue-400 flex justify-between items-center shadow-inner">
                {mac}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-slate-500 italic">No se detectaron MACs.</p>
            <p className="text-xs text-slate-600 mt-1">El puerto podría no tener tráfico.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MonitorSwitches() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [switchInfo, setSwitchInfo] = useState(null); 
  const [ports, setPorts] = useState([]); 
  const [selectedPort, setSelectedPort] = useState(null);

  const procesarYAgruparPuertos = () => {
    if (!ports || ports.length === 0) return {};

    const puertosFiltrados = ports.filter(p => {
      const parts = p.nombrePuerto.split('/');
      const portNum = parseInt(parts[parts.length - 1], 10);
      const modulo = parts.slice(0, -1).join('/'); 

      if (switchInfo?.nombre.includes("6800") && (portNum === 49 || portNum === 50)) return false;
      if (switchInfo?.nombre.includes("C2960") && modulo.endsWith("2/0") && (portNum === 1 || portNum === 2)) return false;

      return true;
    });

    const grupos = puertosFiltrados.reduce((acc, port) => {
      const parts = port.nombrePuerto.split('/');
      const portNum = parseInt(parts.pop(), 10) || 0;
      const modulo = parts.join('/') || 'Default';

      if (!acc[modulo]) acc[modulo] = [];
      acc[modulo].push({ ...port, numericSort: portNum });
      return acc;
    }, {});

    Object.keys(grupos).forEach(key => {
      grupos[key].sort((a, b) => a.numericSort - b.numericSort);
    });

    return grupos;
  };

  const handleConsultar = async (equipoId) => {
    setLoading(true);
    setSelectedPort(null);
    setError(null);
    setSwitchInfo(null);
    setPorts([]);

    try {
      const response = await fetch(`${API_BASE_URL}/estado/${equipoId}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error("Configuración no encontrada.");
        throw new Error(`Error en el servidor: ${response.status}`);
      }
      
      const data = await response.json();
      setSwitchInfo({ nombre: data.nombre, detalles: data.detalles });
      setPorts(data.puertos || []);

    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo conectar con el backend o equipo.");
    } finally {
      setLoading(false);
    }
  };

  const modulos = procesarYAgruparPuertos();

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300 font-sans p-4 md:p-8">
      <header className="mb-6 pb-4 border-b border-slate-800 flex justify-between items-center w-full">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tighter">NetMonitor SNMP</h1>

        </div>
        <RealTimeClock />
      </header>

      <main className="w-full">
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <SelectorPanel onConsultar={handleConsultar} />

        {!switchInfo && !loading ? (
          <div className="relative flex flex-col items-center justify-center min-h-[500px] border border-slate-800 rounded-2xl bg-[#0F172A] overflow-hidden shadow-2xl">
            <div className="absolute inset-0 z-0">
              <img 
                src={bgImage} 
                alt="Fondo Switch"
                className="w-full h-full object-cover opacity-30 grayscale mix-blend-overlay"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-[#0F172A]"></div>
            </div>

            <div className="relative z-10 text-center px-6">
              <div className="w-20 h-20 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-5 border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Panel de Monitoreo</h2>
              <p className="text-slate-400 mt-3 max-w-md mx-auto text-sm leading-relaxed">
                Selecciona el edificio, cuarto y equipo en el panel superior para visualizar el estado físico y operativo de los puertos en tiempo real vía SNMP.
              </p>
            </div>
          </div>
        ) : (
          /* ACÁ ESTÁ LA NUEVA GRILLA QUE REEMPLAZA A FLEXBOX */
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
            
            {/* 1. SECCIÓN PUERTOS (Arriba en el celular, Izquierda en PC) */}
            <div className="flex flex-col gap-6 xl:col-start-1 xl:row-start-1">
              <div className="bg-[#0B1120] p-6 rounded-2xl border border-slate-800 shadow-2xl relative min-h-[400px]">
                {loading && (
                  <div className="absolute inset-0 bg-[#0B1120]/80 z-50 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <span className="text-blue-400 font-medium">Ejecutando SNMP Walk en el equipo...</span>
                    </div>
                  </div>
                )}

                {switchInfo && (
                  <div className="mb-6 pb-4 border-b border-slate-800 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in fade-in duration-300">
                    <div>
                      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        {switchInfo.nombre}
                        <span className="text-xs bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                          Online
                        </span>
                      </h2>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-slate-400 font-mono">
                        <p>{switchInfo.detalles}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className={`bg-[#111827] p-6 rounded-xl border border-slate-900 overflow-x-auto transition-opacity duration-300 ${!switchInfo ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                  {Object.keys(modulos).length > 0 ? (
                    <div className="flex flex-col gap-10">
                      {Object.entries(modulos)
                        .sort(([moduloA], [moduloB]) => moduloA.localeCompare(moduloB, undefined, { numeric: true }))
                        .map(([nombreModulo, puertosModulo]) => {
                          const topRow = puertosModulo.filter(p => p.numericSort % 2 !== 0);
                          const bottomRow = puertosModulo.filter(p => p.numericSort % 2 === 0);

                          return (
                            <div key={nombreModulo} className="min-w-max bg-[#0B1120] p-4 rounded-lg border border-slate-800">
                              <h3 className="text-slate-400 font-mono text-xs mb-4 border-b border-slate-800 pb-2">Módulo: {nombreModulo}</h3>
                              <div className="flex gap-1.5 mb-6">
                                {topRow.map((p) => (
                                  <Port key={p.ifIndex} data={p} isSelected={selectedPort?.ifIndex === p.ifIndex} onClick={setSelectedPort} />
                                ))}
                              </div>
                              <div className="flex gap-1.5">
                                {bottomRow.map((p) => (
                                  <Port key={p.ifIndex} data={p} isSelected={selectedPort?.ifIndex === p.ifIndex} onClick={setSelectedPort} />
                                ))}
                              </div>
                            </div>
                          );
                      })}
                    </div>
                  ) : (
                    switchInfo && !loading && <p className="text-slate-500 text-center py-4">No se recuperaron puertos. Verifica los filtros de Módulos Ignorados.</p>
                  )}
                </div>
              </div>

              <p className="ml-8 text-xs text-slate-500 uppercase tracking-wider font-bold">
                Leyenda de Dispositivos (S/ Referencia de Planos)
              </p>
              
              <div className="ml-8 flex flex-wrap gap-6 text-sm text-slate-300 font-mono">
                <div className="flex items-center gap-2"> <PcIcon className="w-8 h-8 rounded border border-white/20 shadow-sm bg-[#EAB308]" /> USUARIOS</div>
                <div className="flex items-center gap-2"> <PcIcon className="w-8 h-8 rounded border border-white/20 shadow-sm bg-[#8B5CF6]" /> KSKAMOS</div>
                <div className="flex items-center gap-2"> <PrinterIcon className="w-8 h-8 rounded border border-white/20 shadow-sm bg-[#0EA5E9]"/> PRINT</div>
                <div className="flex items-center gap-2"> <ClockIcon className="w-8 h-8 rounded border border-white/20 shadow-sm bg-[#64748B]"/> FICHADOR</div>
                <div className="flex items-center gap-2"> <TvIcon className="w-8 h-8 rounded border border-white/20 shadow-sm bg-[#F59E0B]"/> CARTELERIA</div>
                <div className="flex items-center gap-2"> <RadioIcon className="w-8 h-8 rounded border border-white/20 shadow-sm bg-[#60A5FA]"/> RADIO/MULTICAST</div>
                <div className="flex items-center gap-2"> <WifiIcon className="w-8 h-8 rounded border border-white/20 shadow-sm bg-[#65A30D]"/> WIFI/TRUNK - AP</div>
                <div className="flex items-center gap-2"> <CctvIcon className="w-8 h-8 rounded border border-white/20 shadow-sm bg-[#EA580C]"/> CCTV</div>
              </div>
            </div>

            {/* 2. SECCIÓN DETALLES / PING (Al medio en el celular, a la Derecha en PC) */}
            <aside className="w-full flex flex-col gap-6 xl:col-start-2 xl:row-start-1 xl:row-span-2">
              <PortDetailsPanel port={selectedPort} />
              <MacAddressPanel port={selectedPort} />
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <PingFront />
              </div>
            </aside>

            {/* 3. SECCIÓN SSH (Al fondo en el celular, Abajo a la Izquierda en PC) */}
            {switchInfo && (
              <div className="bg-[#0B1120] p-6 rounded-2xl border border-slate-800 shadow-2xl flex flex-col gap-6 xl:col-start-1 xl:row-start-2">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <SSHFront />
                </div>
              </div>
            )}
            
          </div>
        )}
      </main>
    </div>
  );
}

export default MonitorSwitches;