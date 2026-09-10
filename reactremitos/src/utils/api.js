import { clearAllDrafts } from "./draftStorage";

const API_URL = import.meta.env.VITE_API_URL;

export const getToken = () => localStorage.getItem("authToken");

// --- NUEVA FUNCIÓN PARA VERIFICAR EXPIRACIÓN DEL TOKEN ---
export const isTokenExpired = () => {
  const token = getToken();
  if (!token) return true;

  try {
    const payloadBase64 = token.split('.')[1];
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    
    // Verificamos si la fecha actual (en ms) superó la fecha 'exp' del token (que viene en segundos)
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return true;
    }
    return false;
  } catch (e) {
    return true; // Si hay error al decodificar, asumimos que es inválido
  }
};

// Verificamos que exista y que NO esté expirado
export const isAuthenticated = () => !isTokenExpired();

// --- ROL DINÁMICO DESDE EL JWT ---
export const getUserRol = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const payloadBase64 = token.split('.')[1];
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    
    return payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload['role'];
  } catch (e) {
    console.error("Error obteniendo el rol del token:", e);
    return null;
  }
};

export const hasRol = (...roles) => {
  const userRol = getUserRol();
  return roles.includes(userRol);
};
// -----------

const getAuthHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const config = {
    ...options,
    headers: { ...getAuthHeaders(), ...options.headers },
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      clearAllDrafts();
      localStorage.removeItem("authToken");
      window.location.href = "/login";
      throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Error HTTP: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    return response;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const apiGet = (endpoint) => apiFetch(endpoint, { method: "GET" });
export const apiPost = (endpoint, data) => apiFetch(endpoint, { method: "POST", body: JSON.stringify(data) });
export const apiPut = (endpoint, data) => apiFetch(endpoint, { method: "PUT", body: JSON.stringify(data) });
export const apiDelete = (endpoint) => apiFetch(endpoint, { method: "DELETE" });