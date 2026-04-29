import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  addEdge,
  updateEdge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { RefreshCw, Monitor, Download, Upload } from 'lucide-react';
import '.././css/DariOs.css'; 

const STORAGE_KEY = 'aeronet-noc-v6';

// Formateo de tiempo (milisegundos)
const formatTime = (ts) => {
  if (!ts || ts === 0) return '---';
  return new Date(ts).toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

// ─── Componentes de Nodo XL ────────────────────────────────────────────────

const DeviceNode = ({ data }) => {
  const isUp = data.status === 2;
  return (
    <div className={`noc-node ${isUp ? 'noc-node-up' : 'noc-node-down'}`}>
      <div className="noc-tooltip">
        <div style={{color:'#00ff55', fontWeight:'bold', marginBottom:'10px', fontSize:'22px', borderBottom:'2px solid #1a3a2a'}}>{data.name}</div>
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
            <span style={{color:'#4a9a5a', fontSize:'14px'}}>ÚLTIMO ÉXITO:</span>
            <span style={{color:'#00ff55'}}>{formatTime(data.last_time_up)}</span>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
            <span style={{color:'#4a9a5a', fontSize:'14px'}}>ÚLTIMA FALLA:</span>
            <span style={{color:'#ff4444'}}>{formatTime(data.last_time_down)}</span>
        </div>
        <div style={{fontSize:'16px', color:'#888', marginTop:'12px', borderTop:'1px solid #222', paddingTop:'12px', fontStyle:'italic'}}>
          {data.plugin_output || 'SIN RESPUESTA'}
        </div>
      </div>
      <Handle type="target" position={Position.Top} />
      <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isUp ? '#0d1f0f' : '#1f0d0d', borderRadius: '6px 6px 0 0' }}>
        <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.name}</span>
        <span style={{ fontSize: '16px', fontWeight: 'bold', color: isUp ? '#00ff50' : '#ff3030' }}>{isUp ? 'UP' : 'DOWN'}</span>
      </div>
      <div style={{ padding: '12px 20px', color: isUp ? '#4a9a5a' : '#9a4a4a', fontSize: '18px' }}>{data.address}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

const LocalhostNode = ({ data }) => (
  <div className="noc-node noc-node-up" style={{ minWidth: '440px', border: '3px solid #00cc44' }}>
    <Handle type="source" position={Position.Bottom} />
    <div style={{ padding: '15px', background: '#001a0e', color: '#00ff55', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '15px', fontSize: '22px' }}>
      <Monitor size={24} /> localhost
    </div>
  </div>
);

// ─── Componente Principal ────────────────────────────────────────────────────

const DariOs = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const edgeUpdateSuccessful = useRef(true);
  const fileInputRef = useRef();

  const nodeTypes = useMemo(() => ({ localhostNode: LocalhostNode, deviceNode: DeviceNode }), []);

  // Bloqueo de scroll global al montar
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';
    document.body.style.backgroundColor = '#000';
    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.backgroundColor = '';
    };
  }, []);

  const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
    edgeUpdateSuccessful.current = true;
    setEdges((els) => updateEdge(oldEdge, newConnection, els));
  }, [setEdges]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, type: 'straight', style: { stroke: '#006622', strokeWidth: 3 } }, eds)), [setEdges]);

  const handleDownload = () => {
    const data = localStorage.getItem(STORAGE_KEY) || '{}';
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'aeronet-layout.json'; a.click();
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { localStorage.setItem(STORAGE_KEY, ev.target.result); window.location.reload(); };
    reader.readAsText(file);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://10.35.144.252:5500/api/Nagios/combinado');
      const json = await response.json();
      const hosts = json.data.hostlist;
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

      const containerNodes = [
        { id: 'c-enlaces', data: { label: <div className="container-label">◈ ENLACES</div> }, position: saved['c-enlaces'] || { x: 300, y: 150 }, style: { width: 1050, height: 1100 }, type: 'group' },
        { id: 'c-10-34', data: { label: <div className="container-label">◈ RED 10.34.x</div> }, position: saved['c-10-34'] || { x: 1400, y: 150 }, style: { width: 1050, height: 1100 }, type: 'group' },
        { id: 'c-10-36', data: { label: <div className="container-label">◈ RED 10.36.x</div> }, position: saved['c-10-36'] || { x: 2500, y: 150 }, style: { width: 1050, height: 1100 }, type: 'group' }
      ];

      const counts = { 'c-enlaces': 0, 'c-10-34': 0, 'c-10-36': 0, 'otros': 0 };

      const deviceNodes = Object.keys(hosts).map(id => {
        const host = hosts[id];
        if (id === 'localhost') return { id, type: 'localhostNode', data: { ...host }, position: saved[id] || { x: 50, y: 50 } };

        const address = host.address || '';
        const name = host.name || '';
        let parentId;
        
        if (/\d{5,}$/.test(name)) parentId = 'c-enlaces';
        else if (address.startsWith('10.34.')) parentId = 'c-10-34';
        else if (address.startsWith('10.36.')) parentId = 'c-10-36';

        let position = saved[id];
        if (!position) {
          const pKey = parentId || 'otros';
          position = parentId 
            ? { x: 30 + ((counts[pKey] % 2) * 510), y: 80 + (Math.floor(counts[pKey] / 2) * 180) }
            : { x: 4000, y: counts['otros'] * 220 };
          counts[pKey]++;
        }
        return { id, type: 'deviceNode', data: { ...host }, parentId, position };
      });

      const newEdges = Object.keys(hosts).flatMap(key =>
        (hosts[key].parent_hosts || []).map(p => ({
          id: `e-${p}-${key}`, source: p, target: key,
          type: 'straight', style: { stroke: hosts[key].status === 2 ? '#006622' : '#660000', strokeWidth: 3, opacity: 0.8 }
        }))
      );

      setNodes([...containerNodes, ...deviceNodes]);
      setEdges(newEdges);
    } catch (err) { console.error("Error API:", err); }
    finally { setLoading(false); }
  }, [setNodes, setEdges]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 90000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  const onNodeDragStop = useCallback((_, node) => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    saved[node.id] = node.position;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, []);

  return (
    <div id="noc-terminal-scope">
      {/* Solo un input para el JSON del layout */}
      <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleUpload} />

      <header className="noc-header">
        <div className="noc-logo-zone">
          {/* Poné acá la ruta de tu imagen de logo fija */}
          <img src="/assets/images/DariOsLogo.png" alt="DariOsLogo" className="noc-logo-img" />
        </div>

        <div className="noc-header-actions">
          <button className="noc-btn" onClick={handleDownload}><Download size={16} /> Exportar</button>
          <button className="noc-btn" onClick={() => fileInputRef.current.click()}><Upload size={16} /> Importar</button>
          <button className="noc-btn" onClick={fetchData}>
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          </button>
        </div>
      </header>

      <div style={{ width: '100%', height: 'calc(100vh - 65px)', position: 'relative' }}>
        <ReactFlow
          nodes={nodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onEdgeUpdate={onEdgeUpdate} onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.1 }}
        >
          <Background color="#0a1a0a" variant="dots" gap={40} size={1} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};

export default DariOs;