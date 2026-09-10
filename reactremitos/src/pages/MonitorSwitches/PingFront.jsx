import { useState, useRef, useEffect, useCallback } from "react";

const WS_PING_URL = "ws://10.35.144.252:5064/ws/ping";

export default function PingTester() {
  const [ip, setIp] = useState("");
  const [status, setStatus] = useState("disconnected"); // disconnected, pinging

  const wsRef = useRef(null);
  const logRef = useRef(null);

  const append = useCallback((text) => {
    if (!logRef.current) return;
    
    const isScrolledToBottom = 
      logRef.current.scrollHeight - logRef.current.clientHeight <= logRef.current.scrollTop + 50;
    
    logRef.current.textContent += text;
    
    if (isScrolledToBottom) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, []);

  const startPing = () => {
    if (!ip) {
      append("\r\n[Error] Debe completar la IP o dominio.\r\n");
      return;
    }

    if (logRef.current) logRef.current.textContent = "";
    append(`[Sistema] Iniciando conexión WebSocket para ping a ${ip}...\r\n`);
    setStatus("pinging");

    let ws;
    try {

      ws = new WebSocket(`${WS_PING_URL}?ip=${encodeURIComponent(ip)}`);
    } catch (err) {
      append(`[Error] No se pudo crear WebSocket: ${err.message}\r\n`);
      setStatus("disconnected");
      return;
    }

    wsRef.current = ws;

    ws.onopen = () => {
      append("[Sistema] ✓ Conectado. Ejecutando ping...\r\n\r\n");
    };

    ws.onmessage = (e) => {
      append(e.data);
    };

    ws.onerror = () => {
      append("\r\n[Error] Error de conexión WebSocket.\r\n");
      setStatus("disconnected");
    };

    ws.onclose = (e) => {
      setStatus("disconnected");
      append(`\r\n[Sistema] Ping finalizado.\r\n`);
      wsRef.current = null;
    };
  };

  const stopPing = () => {
    if (wsRef.current) {
      wsRef.current.close(1000, "Detenido por el usuario");
    }
  };

  const clearLog = () => {
    if (logRef.current) logRef.current.textContent = "";
  };

  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  const isPinging = status === "pinging";

  const statusColor = isPinging ? "#22c55e" : "#6b7280";
  const statusLabel = isPinging ? "Haciendo ping..." : "Detenido";

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        background: "#111",
        color: "#eee",
        padding: "1.5rem",
        minHeight: "100vh",
      }}
    >
      <h2 style={{ marginTop: 0 }}>Network Ping Tester</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          maxWidth: 400,
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div>
          <label style={labelStyle}>IP o Hostname</label>
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            disabled={isPinging}
            placeholder=""
            style={inputStyle}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <button
          onClick={startPing}
          disabled={isPinging}
          style={btnStyle}
        >
          Iniciar Ping
        </button>

        <button
          onClick={stopPing}
          disabled={!isPinging}
          style={btnStyle}
        >
          Detener
        </button>

        <button onClick={clearLog} style={btnStyle}>
          Limpiar Log
        </button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: statusColor,
          }}
        />
        <span style={{ color: statusColor, fontSize: 13 }}>
          {statusLabel}
        </span>
      </div>

      <div
        ref={logRef}
        style={{
          height: 450,
          width: "100%",
          background: "#0a0a0a",
          color: "#a3e635", // Un verde clásico para el ping
          fontFamily: "Consolas, monospace",
          fontSize: 13,
          lineHeight: 1.5,
          border: "1px solid #2a2a2a",
          borderRadius: 6,
          padding: 10,
          boxSizing: "border-box",
          overflowY: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          textAlign: "left",
        }}
      />
    </div>
  );
}

const labelStyle = {
  fontSize: 12,
  color: "#888",
  display: "block",
  marginBottom: 4,
};

const inputStyle = {
  width: "100%",
  padding: "7px 10px",
  background: "#1a1a1a",
  border: "1px solid #333",
  borderRadius: 6,
  color: "#eee",
  fontSize: 13,
  boxSizing: "border-box",
};

const btnStyle = {
  padding: "7px 14px",
  background: "#222",
  border: "1px solid #444",
  borderRadius: 6,
  color: "#eee",
  fontSize: 13,
  cursor: "pointer",
};