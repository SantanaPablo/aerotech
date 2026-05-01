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
import { RefreshCw, Download, Upload, Server } from 'lucide-react';
import '.././css/DariOs.css';

const STORAGE_KEY = 'aeronet-noc-v6';

// Dimensiones de los nodos para calcular el centro
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
// Calcula qué handle de source y target usar según la posición relativa entre dos nodos
const getSmartHandles = (sourceNode, targetNode) => {
  const sw = sourceNode.type === 'localhostNode' ? LOCALHOST_W : NODE_W;

  // Centro de cada nodo
  const sx = sourceNode.position.x + sw / 2;
  const sy = sourceNode.position.y + NODE_H / 2;
  const tx = targetNode.position.x + NODE_W / 2;
  const ty = targetNode.position.y + NODE_H / 2;

  const dx = tx - sx;
  const dy = ty - sy;

  // Si el desplazamiento horizontal es dominante (ratio 1.2), usar lados
  const isHorizontal = Math.abs(dx) > Math.abs(dy) * 1.2;

  let sourceHandle, targetHandle;

  if (isHorizontal) {
    // El target está a la derecha o izquierda del source
    sourceHandle = dx > 0 ? 'sr' : 'sl';
    targetHandle = dx > 0 ? 'l'  : 'r';
  } else {
    // El target está arriba o abajo del source
    sourceHandle = dy > 0 ? 'sb' : 'st';
    targetHandle = dy > 0 ? 't'  : 'b';
  }

  return { sourceHandle, targetHandle };
};

// --- Construye todos los edges con handles inteligentes ---
const buildEdges = (hosts, nodeMap) => {
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
        style: {
          stroke: isUp ? '#00ff88' : '#ff4444',
          strokeWidth: 4,
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

// --- Nodo de Dispositivo XL (4 handles por lado, tooltip) ---
const DeviceNode = ({ data }) => {
  const status = data.status === 2 ? 'up' : data.status === 1 ? 'warning' : 'down';

  return (
    <div className={`noc-card-xl ${status}`}>
      {/* Handles TARGET — uno por lado */}
      <Handle type="target" position={Position.Top}    id="t" className="smart-handle" />
      <Handle type="target" position={Position.Bottom} id="b" className="smart-handle" />
      <Handle type="target" position={Position.Left}   id="l" className="smart-handle" />
      <Handle type="target" position={Position.Right}  id="r" className="smart-handle" />

      {/* Handles SOURCE — uno por lado */}
      <Handle type="source" position={Position.Top}    id="st" className="smart-handle" />
      <Handle type="source" position={Position.Bottom} id="sb" className="smart-handle" />
      <Handle type="source" position={Position.Left}   id="sl" className="smart-handle" />
      <Handle type="source" position={Position.Right}  id="sr" className="smart-handle" />

      <div className="card-content-xl">
        <div className="card-main-text">
          <div className="node-name-label" title={data.name}>{data.name}</div>
          <div className="node-address-label">{data.address}</div>
        </div>
        <div className="status-badge-xl">
          {data.status === 2 ? 'UP' : 'DOWN'}
        </div>
      </div>

      {/* Tooltip */}
      <div className="noc-tooltip-xl">
        <div className="tooltip-line"><span>UP:</span> {formatTime(data.last_time_up)}</div>
        <div className="tooltip-line"><span>DOWN:</span> {formatTime(data.last_time_down)}</div>
        <div className="tooltip-output">{data.plugin_output || 'Sin datos de salida'}</div>
      </div>
    </div>
  );
};

// --- Nodo Localhost (4 handles por lado) ---
const LocalhostNode = ({ data }) => (
  <div className="noc-card-xl up localhost-master">
    <div className="card-content-xl">
      <div className="card-icon-static"><Server size={40} /></div>
      <div className="card-main-text">
        <div className="node-name-label" style={{ fontSize: '32px' }}>LOCALHOST</div>
        <div className="node-address-label">LOCALHOST</div>
      </div>
    </div>

    {/* Handles TARGET */}
    <Handle type="target" position={Position.Top}    id="t" className="smart-handle" />
    <Handle type="target" position={Position.Bottom} id="b" className="smart-handle" />
    <Handle type="target" position={Position.Left}   id="l" className="smart-handle" />
    <Handle type="target" position={Position.Right}  id="r" className="smart-handle" />

    {/* Handles SOURCE */}
    <Handle type="source" position={Position.Top}    id="st" className="smart-handle" />
    <Handle type="source" position={Position.Bottom} id="sb" className="smart-handle" />
    <Handle type="source" position={Position.Left}   id="sl" className="smart-handle" />
    <Handle type="source" position={Position.Right}  id="sr" className="smart-handle" />
  </div>
);

// --- Componente principal ---
const DariOs = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef();

  // Referencia a los hosts para recalcular edges al mover sin re-fetch
  const hostsRef = useRef({});

  const nodeTypes = useMemo(() => ({
    deviceNode: DeviceNode,
    localhostNode: LocalhostNode,
  }), []);

  // --- Exportar layout ---
  const handleExport = () => {
    const data = localStorage.getItem(STORAGE_KEY) || '{}';
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'noc-layout.json';
    a.click();
  };

  // --- Importar layout ---
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

  // --- Fetch de datos con lógica de agrupamiento original ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://10.35.144.252:5500/api/Nagios/combinado');
      const json = await response.json();
      const hosts = json.data.hostlist;

      // Guardar referencia para recalcular edges al mover nodos
      hostsRef.current = hosts;

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const counts = { enlaces: 0, interna: 0 };

      // Construir nodos con lógica de agrupamiento original
      const deviceNodes = Object.keys(hosts).map(id => {
        const host = hosts[id];

        if (id === 'localhost') {
          return {
            id,
            type: 'localhostNode',
            data: { ...host },
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
          data: { ...host, group },
          position,
        };
      });

      // Mapa id -> nodo para cálculo de handles
      const nodeMap = Object.fromEntries(deviceNodes.map(n => [n.id, n]));
      const newEdges = buildEdges(hosts, nodeMap);

      setNodes(deviceNodes);
      setEdges(newEdges);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [setNodes, setEdges]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const onNodeDragStop = useCallback((_, movedNode) => {
    // 1. Persistir posición en localStorage
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    saved[movedNode.id] = movedNode.position;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

    setNodes(currentNodes => {
      const nodeMap = Object.fromEntries(currentNodes.map(n => [n.id, n]));
      // Asegurarse de usar la posición más reciente del nodo movido
      nodeMap[movedNode.id] = { ...movedNode };

      setEdges(buildEdges(hostsRef.current, nodeMap));
      return currentNodes; // No modificar el array de nodos
    });
  }, [setNodes, setEdges]);

  return (
    <div id="noc-terminal-scope">
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleImport}
      />

      <header className="noc-header-xl">
        <img src="/assets/images/DariOsLogo.png" alt="Logo" className="logo-img" />
        <div className="header-actions">
          <button className="n-btn" onClick={handleExport}>
            <Download size={14} /> EXPORTAR
          </button>
          <button className="n-btn" onClick={() => fileInputRef.current.click()}>
            <Upload size={14} /> IMPORTAR
          </button>
          <button className="n-btn sync" onClick={fetchData}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> REFRESCAR
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
        >
          <Background color="#111" variant="grid" gap={60} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};

export default DariOs;