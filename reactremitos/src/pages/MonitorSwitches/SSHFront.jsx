import { useState, useRef, useEffect, useCallback } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

const WS_BASE_URL = "ws://10.35.144.252:5064/ws/terminal";

export default function SshTerminalTester() {
  const [ip, setIp] = useState("");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [status, setStatus] = useState("disconnected");

  const wsRef = useRef(null);
  const termRef = useRef(null);
  const terminalContainerRef = useRef(null);

  useEffect(() => {
    const term = new Terminal({
      theme: {
        background: "#0a0a0a",
        foreground: "#e0e0e0",
      },
      fontFamily: "Consolas, monospace",
      fontSize: 13,
      cursorBlink: true,
      convertEol: true,
    });

    const fitAddon = new FitAddon();

    term.loadAddon(fitAddon);

    if (terminalContainerRef.current) {
      term.open(terminalContainerRef.current);
      fitAddon.fit();
    }

    termRef.current = term;

    term.onData((data) => {
      if (
        wsRef.current &&
        wsRef.current.readyState === WebSocket.OPEN
      ) {
        wsRef.current.send(data);
      }
    });

    const handleResize = () => fitAddon.fit();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      term.dispose();
    };
  }, []);

  const append = useCallback((text) => {
    if (termRef.current) {
      termRef.current.write(text);
    }
  }, []);

  const connect = () => {
    if (!ip || !user || !pass) {
      append(
        "\r\n[Error] Debe completar IP, usuario y contraseña.\r\n"
      );
      return;
    }

    termRef.current?.clear();

    append(
      "[Tester] Abriendo conexión WebSocket...\r\n"
    );

    setStatus("connecting");

    let ws;

    try {
      ws = new WebSocket(WS_BASE_URL);
    } catch (err) {
      append(
        `[Error] No se pudo crear WebSocket: ${err.message}\r\n`
      );
      setStatus("disconnected");
      return;
    }

    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");

      append(
        "[Tester] ✓ WebSocket conectado\r\n"
      );

      const loginPayload = {
        type: "login",
        host: ip,
        user: user,
        pass: pass,
      };

      ws.send(JSON.stringify(loginPayload));

      append(
        `[Tester] Intentando conectar SSH a ${ip}...\r\n`
      );

      termRef.current?.focus();
    };

    ws.onmessage = (e) => {
      append(e.data);
    };

    ws.onerror = () => {
      append(
        "\r\n[Error] Error de conexión WebSocket.\r\n"
      );

      setStatus("disconnected");
    };

    ws.onclose = (e) => {
      setStatus("disconnected");

      append(
        `\r\n[Tester] Conexión cerrada (Código ${e.code}) ${e.reason}\r\n`
      );

      wsRef.current = null;
    };
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close(
        1000,
        "Desconectado por el usuario"
      );
    }
  };

  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  const isConnected = status === "connected";
  const isConnecting = status === "connecting";

  const statusColor = isConnected
    ? "#22c55e"
    : isConnecting
    ? "#f59e0b"
    : "#6b7280";

  const statusLabel = isConnected
    ? "Conectado"
    : isConnecting
    ? "Conectando..."
    : "Desconectado";

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
      <h2 style={{ marginTop: 0 }}>
        SSH WebSocket Tester
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div>
          <label style={labelStyle}>
            IP del switch
          </label>

          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            disabled={
              isConnected || isConnecting
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>
            Usuario
          </label>

          <input
            type="text"
            value={user}
            onChange={(e) =>
              setUser(e.target.value)
            }
            disabled={
              isConnected || isConnecting
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>
            Contraseña
          </label>

          <input
            type="password"
            value={pass}
            onChange={(e) =>
              setPass(e.target.value)
            }
            disabled={
              isConnected || isConnecting
            }
            style={inputStyle}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <button
          onClick={connect}
          disabled={
            isConnected || isConnecting
          }
          style={btnStyle}
        >
          Conectar
        </button>

        <button
          onClick={disconnect}
          disabled={!isConnected}
          style={btnStyle}
        >
          Desconectar
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

        <span
          style={{
            color: statusColor,
            fontSize: 13,
          }}
        >
          {statusLabel}
        </span>
      </div>

      <div
        ref={terminalContainerRef}
        style={{
          height: 450,
          width: "100%",
          background: "#0a0a0a",
          border: "1px solid #2a2a2a",
          borderRadius: 6,
          padding: 10,
          boxSizing: "border-box",
          overflow: "hidden",
          textAlign: "left",
        }}
      />

      <p
        style={{
          fontSize: 11,
          color: "#666",
          marginTop: 6,
        }}
      >
        Hacé clic en la terminal para escribir.
      </p>
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