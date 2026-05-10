import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { RefreshCw, Download, Upload, Server, AlertTriangle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '.././css/DariOs.css';

const STORAGE_KEY = 'aeronet-noc-v6';
const API_URL = 'http://10.35.144.252:5500/api/Nagios/combinado';

// Dimensiones de los nodos
const NODE_W = 500;
const NODE_H = 120;
const LOCALHOST_W = 550;

const formatTime = (ts) => {
  if (!ts || ts === 0) return '---';
  return new Date(ts).toLocaleString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// --- Lógica de edges inteligentes ---
const getSmartHandles = (sourceNode, targetNode) => {
  const sw = sourceNode.type === 'localhostNode' ? LOCALHOST_W : NODE_W;
  const sx = sourceNode.position.x + sw / 2;
  const sy = sourceNode.position.y + NODE_H / 2;
  const tx = targetNode.position.x + NODE_W / 2;
  const ty = targetNode.position.y + NODE_H / 2;

  const dx = tx - sx;
  const dy = ty - sy;
  const isHorizontal = Math.abs(dx) > Math.abs(dy) * 1.2;

  let sourceHandle, targetHandle;
  if (isHorizontal) {
    sourceHandle = dx > 0 ? 'sr' : 'sl';
    targetHandle = dx > 0 ? 'l' : 'r';
  } else {
    sourceHandle = dy > 0 ? 'sb' : 'st';
    targetHandle = dy > 0 ? 't' : 'b';
  }
  return { sourceHandle, targetHandle };
};

const buildEdges = (hosts, nodeMap) => {
  // OPTIMIZACIÓN: Detectamos si es celular para apagar las animaciones pesadas
  const isMobile = window.innerWidth <= 768;

  return Object.keys(hosts).flatMap(key =>
    (hosts[key].parent_hosts || []).map(p => {
      const sourceNode = nodeMap[p];
      const targetNode = nodeMap[key];
      if (!sourceNode || !targetNode) return null;

      const { sourceHandle, targetHandle } = getSmartHandles(sourceNode, targetNode);
      const isUp = hosts[key].status === 2;

      return {
        id: `e-${p}-${key}`,
        source: p,
        target: key,
        sourceHandle,
        targetHandle,
        type: 'default',
        // En celular apagamos el animated, en PC lo dejamos
        animated: isMobile ? false : isUp,
        className: isUp ? 'fluor-edge-up' : 'fluor-edge-down',
        style: {
          stroke: isUp ? '#00ff88' : '#ff4444',
          strokeWidth: isMobile ? 2 : 4, // Línea un poco más fina en móvil
          opacity: 0.5,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isUp ? '#00ff88' : '#ff4444',
        },
      };
    }).filter(Boolean)
  );
};

// --- Componentes de Nodo ---
const DeviceNode = ({ data }) => {
  // Si hay error de conexión, forzamos un estado visual neutro
  const statusClass = data.isError ? 'offline' : (data.status === 2 ? 'up' : data.status === 1 ? 'warning' : 'down');

  return (
    <div className={`noc-card-xl ${statusClass}`}>
      <Handle type="target" position={Position.Top} id="t" className="smart-handle" />
      <Handle type="target" position={Position.Bottom} id="b" className="smart-handle" />
      <Handle type="target" position={Position.Left} id="l" className="smart-handle" />
      <Handle type="target" position={Position.Right} id="r" className="smart-handle" />

      <Handle type="source" position={Position.Top} id="st" className="smart-handle" />
      <Handle type="source" position={Position.Bottom} id="sb" className="smart-handle" />
      <Handle type="source" position={Position.Left} id="sl" className="smart-handle" />
      <Handle type="source" position={Position.Right} id="sr" className="smart-handle" />

      <div className="card-content-xl">
        <div className="card-main-text">
          <div className="node-name-label" title={data.name}>{data.name}</div>
          <div className="node-address-label">{data.address}</div>
        </div>
        <div className="status-badge-xl">
          {data.isError ? 'ERROR' : (data.status === 2 ? 'UP' : 'DOWN')}
        </div>
      </div>

      <div className="noc-tooltip-xl">
        <div className="tooltip-line"><span>UP:</span> {formatTime(data.last_time_up)}</div>
        <div className="tooltip-line"><span>DOWN:</span> {formatTime(data.last_time_down)}</div>
        <div className="tooltip-output">{data.plugin_output || 'Sin datos'}</div>
      </div>
    </div>
  );
};

const LocalhostNode = ({ data }) => (
  <div className={`noc-card-xl localhost-master ${data.isError ? 'offline' : 'up'}`}>
    <div className="card-content-xl">
      <div className="card-icon-static"><Server size={40} /></div>
      <div className="card-main-text">
        <div className="node-name-label" style={{ fontSize: '32px' }}>SENSOR T4</div>
        <div className="node-address-label">{data.isError ? 'DESCONECTADO' : 'UBUNTU SERVER'}</div>
      </div>
    </div>
    
    {/* PARCHE: Se agregaron los 4 conectores para evitar el error de "Couldn't create edge" */}
    <Handle type="source" position={Position.Top} id="st" className="smart-handle" />
    <Handle type="source" position={Position.Bottom} id="sb" className="smart-handle" />
    <Handle type="source" position={Position.Left} id="sl" className="smart-handle" />
    <Handle type="source" position={Position.Right} id="sr" className="smart-handle" />
  </div>
);

// --- Componente Principal ---
const DariOs = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const fileInputRef = useRef();
  const hostsRef = useRef({});
  const navigate = useNavigate();

  const nodeTypes = useMemo(() => ({
    deviceNode: DeviceNode,
    localhostNode: LocalhostNode,
  }), []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const json = await response.json();
      const hosts = json.data.hostlist;
      hostsRef.current = hosts;
      setHasError(false);

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const counts = { enlaces: 0, interna: 0 };

      const deviceNodes = Object.keys(hosts).map(id => {
        const host = hosts[id];
        if (id === 'localhost') {
          return {
            id,
            type: 'localhostNode',
            data: { ...host, isError: false },
            position: saved[id] || { x: 1200, y: 50 },
          };
        }

        const name = host.name || '';
        const group = /\d{5,}$/.test(name) ? 'enlaces' : 'interna';
        const xOffset = group === 'enlaces' ? 100 : 2000;

        let position = saved[id];
        if (!position) {
          const col = counts[group] % 2;
          const row = Math.floor(counts[group] / 2);
          position = { x: xOffset + col * 550, y: 450 + row * 150 };
          counts[group]++;
        }

        return {
          id,
          type: 'deviceNode',
          data: { ...host, group, isError: false },
          position,
        };
      });

      const nodeMap = Object.fromEntries(deviceNodes.map(n => [n.id, n]));
      setNodes(deviceNodes);
      setEdges(buildEdges(hosts, nodeMap));

    } catch (err) {
      console.error("Fetch Error:", err);
      setHasError(true);
      // Marcamos los nodos existentes como erróneos para dar feedback visual
      setNodes(nds => nds.map(n => ({
        ...n,
        data: { ...n.data, isError: true, status: 0 }
      })));
      setEdges([]); // Opcional: quitar conexiones para resaltar el fallo
    } finally {
      setLoading(false);
    }
  }, [setNodes, setEdges]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const onNodeDragStop = useCallback((_, movedNode) => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    saved[movedNode.id] = movedNode.position;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

    setNodes(nds => {
      const nodeMap = Object.fromEntries(nds.map(n => [n.id, n]));
      nodeMap[movedNode.id] = movedNode;
      setEdges(buildEdges(hostsRef.current, nodeMap));
      return nds.map(n => n.id === movedNode.id ? movedNode : n);
    });
  }, [setNodes, setEdges]);

  const handleExport = () => {
    const data = localStorage.getItem(STORAGE_KEY) || '{}';
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'noc-layout.json';
    a.click();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      localStorage.setItem(STORAGE_KEY, ev.target.result);
      window.location.reload();
    };
    reader.readAsText(file);
  };

  return (
    <div id="noc-terminal-scope">
      <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleImport} />

      <header className={`noc-header-xl ${hasError ? 'header-error' : ''}`}>
        <img src="/assets/images/DariOsLogo.png" alt="Logo" className="logo-img" />
        
        {hasError && (
          <div className="error-badge">
            <AlertTriangle size={18} />
            <span>ERROR DE CONEXIÓN CON NAGIOS</span>
          </div>
        )}

        <div className="header-actions">
          {/* BOTÓN PARA VOLVER A AEROTECH */}
          <button className="n-btn" onClick={() => navigate('/')}>
            <Home size={14} /> AEROTECH
          </button>
          
          <button className="n-btn" onClick={handleExport}><Upload size={14} /> EXPORTAR</button>
          <button className="n-btn" onClick={() => fileInputRef.current.click()}><Download size={14} /> IMPORTAR</button>
          <button className={`n-btn sync ${hasError ? 'btn-danger' : ''}`} onClick={fetchData}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> 
            {hasError ? 'REINTENTAR' : 'REFRESCAR'}
          </button>
        </div>
      </header>

      <div className="flow-wrapper">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          fitView
          // OPTIMIZACIONES PARA MÓVIL: Evita lags al scrollear y seleccionar
          nodesFocusable={false}
          edgesFocusable={false}
          elementsSelectable={false}
          zoomOnDoubleClick={false}
          panOnScroll={true}
          elevateNodesOnSelect={false}
        >
          <Background color="#111111" variant="grid" gap={60} />
          {/* Los controles molestan en pantallas táctiles chicas, los ocultamos en móviles */}
          {window.innerWidth > 768 && <Controls />}
        </ReactFlow>
      </div>
    </div>
  );
};

export default DariOs;