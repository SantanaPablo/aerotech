// src/utils/api.js

import { clearAllDrafts } from "./draftStorage";

const API_URL = import.meta.env.VITE_API_URL;

export const getToken = () => {
  return localStorage.getItem("authToken");
};

export const isAuthenticated = () => {
  return !!getToken();
};

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
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
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

export const apiPost = (endpoint, data) =>
  apiFetch(endpoint, { method: "POST", body: JSON.stringify(data) });

export const apiPut = (endpoint, data) =>
  apiFetch(endpoint, { method: "PUT", body: JSON.stringify(data) });

export const apiDelete = (endpoint) => apiFetch(endpoint, { method: "DELETE" });