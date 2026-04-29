// src/utils/api.js

import { clearAllDrafts } from "./draftStorage";

const API_URL = import.meta.env.VITE_API_URL;

export const getToken = () => localStorage.getItem("authToken");

export const isAuthenticated = () => !!getToken();

// --- ROL DINÁMICO DESDE EL JWT ---
export const getUserRol = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const payloadBase64 = token.split('.')[1];
    // Reemplazamos caracteres seguros para URL por caracteres Base64 estándar (buena práctica)
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    
    // ClaimTypes.Role de .NET se mapea por defecto a esta URL, o caemos en 'role' por si acaso
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
      // Ya no limpiamos "userRol" de acá porque ya no existe en localStorage
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