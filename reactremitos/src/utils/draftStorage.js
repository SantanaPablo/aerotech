// src/utils/draftStorage.js

export const DRAFT_TTL_MS = 8 * 60 * 60 * 1000; // 8 horas

/**
 * Guarda un draft con timestamp de cuándo se guardó.
 */
export function saveDraft(key, data) {
  localStorage.setItem(key, JSON.stringify({ data, savedAt: Date.now() }));
}

/**
 * Carga un draft y verifica que no haya expirado (TTL).
 * Si expiró, lo borra y devuelve null.
 */
export function loadDraft(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, savedAt } = JSON.parse(raw);
    if (Date.now() - savedAt > DRAFT_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * Carga el draft crudo (con savedAt incluido), sin verificar TTL.
 * Útil para comparar timestamps manualmente.
 */
export function loadDraftRaw(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw); // { data, savedAt }
  } catch {
    return null;
  }
}

/**
 * Elimina un draft.
 */
export function clearDraft(key) {
  localStorage.removeItem(key);
}

/**
 * Marca el momento del último submit exitoso para un remito específico.
 * Se usa para comparar contra el draft y saber si el usuario agregó
 * cosas nuevas después del último guardado.
 */
export function markLastSaved(id) {
  localStorage.setItem(`remitoLastSaved_${id}`, Date.now().toString());
}

/**
 * Devuelve el timestamp del último submit exitoso, o 0 si nunca se guardó.
 */
export function getLastSaved(id) {
  return parseInt(localStorage.getItem(`remitoLastSaved_${id}`) || "0");
}

/**
 * Limpia todos los drafts y markers de remitos del localStorage.
 * Se llama al expirar el token (401).
 */
export function clearAllDrafts() {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (
      key === "remitoDraft" ||
      key.startsWith("remitoEditDraft_") ||
      key.startsWith("remitoLastSaved_")
    ) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}