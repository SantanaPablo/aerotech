import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  PlusCircle,
  Save,
  Trash2,
  Loader2,
  FileText,
  CalendarDays,
  MapPin,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { apiGet, apiPut } from "../../utils/api";
import {
  saveDraft,
  loadDraftRaw,
  clearDraft,
  markLastSaved,
  getLastSaved,
  DRAFT_TTL_MS,
} from "../../utils/draftStorage";

const REFETCH_AFTER_MS = 8 * 60 * 60 * 1000;

const EditarRemito = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const serialRefs = useRef([]);
  const STORAGE_KEY = `remitoEditDraft_${id}`;

  const [remito, setRemito] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const lastFetchRef = useRef(null);

  // ─── Lógica de decisión del draft ──────────────────────────────────────────
  //
  // Al cargar, siempre se fetchea el servidor. Luego se compara:
  //
  //   raw.savedAt  →  cuándo se guardó el draft por última vez
  //   lastSaved    →  cuándo fue el último submit exitoso (markLastSaved)
  //
  //   CASO A: No hay draft                     → usar servidor
  //   CASO B: Draft expirado (> 8hs)           → descartar, usar servidor
  //   CASO C: Draft anterior al último submit  → el usuario ya guardó todo,
  //                                              el draft es basura vieja → servidor
  //   CASO D: Draft posterior al último submit → el usuario agregó cosas
  //                                              después del último guardado
  //                                              y se fue sin guardar → draft
  //
  // El visibilitychange refresca silenciosamente si la pestaña estuvo
  // inactiva más de 8 horas, resolviendo el caso de persona 1 con la
  // pestaña abierta todo el día mientras persona 2 editó.
  //
  // ───────────────────────────────────────────────────────────────────────────

  const fetchRemito = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await apiGet(`/api/Remitos/${id}`);

      if (!data.items || data.items.length === 0) {
        data.items = [{
          numero_item: 1,
          descripcion: "",
          serial: "",
          usuario: "",
          cantidad: 1,
          detalle: "",
          recibido_por: "",
        }];
      }

      const raw = loadDraftRaw(STORAGE_KEY);
      const lastSaved = getLastSaved(id);
      const draftAge = raw ? Date.now() - raw.savedAt : Infinity;

      const draftIsRecent = raw && draftAge <= DRAFT_TTL_MS;
      const draftIsNewerThanLastSave = raw && raw.savedAt > lastSaved;

      if (draftIsRecent && draftIsNewerThanLastSave) {
        // CASO D: el usuario tenía cambios sin guardar → restaurar draft
        setRemito(raw.data);
      } else {
        // CASO A, B o C: servidor es la fuente de verdad
        clearDraft(STORAGE_KEY);
        setRemito(data);
      }

      lastFetchRef.current = Date.now();
    } catch (err) {
      // Sin conexión: usar draft como fallback si es reciente
      const raw = loadDraftRaw(STORAGE_KEY);
      if (raw && Date.now() - raw.savedAt <= DRAFT_TTL_MS) {
        setRemito(raw.data);
      } else {
        setError(err.message || "Error al cargar el remito");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemito();
  }, [id]);

  // ─── Refetch cuando la pestaña vuelve activa tras 8 horas ──────────────────
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState !== "visible") return;
      if (!lastFetchRef.current) return;

      const timeSinceLastFetch = Date.now() - lastFetchRef.current;
      if (timeSinceLastFetch < REFETCH_AFTER_MS) return;

      await fetchRemito(true);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [id]);

  // ─── Persistir draft mientras se edita ─────────────────────────────────────
  useEffect(() => {
    if (remito) {
      saveDraft(STORAGE_KEY, remito);
    }
  }, [remito]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRemito((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...remito.items];
    newItems[index][field] = value;
    setRemito((prev) => ({ ...prev, items: newItems }));
  };

  const renumberItems = (items) =>
    items.map((item, index) => ({ ...item, numero_item: index + 1 }));

  const addItem = (focusNew = false) => {
    if (remito.items.length >= 25) return;
    const newItem = {
      numero_item: remito.items.length + 1,
      descripcion: "",
      serial: "",
      usuario: "",
      cantidad: 1,
      detalle: "",
      recibido_por: "",
    };
    setRemito((prev) => {
      const updated = { ...prev, items: [...prev.items, newItem] };
      if (focusNew) {
        setTimeout(() => {
          const nextIndex = updated.items.length - 1;
          serialRefs.current[nextIndex]?.focus();
        }, 50);
      }
      return updated;
    });
  };

  const removeItem = (index) => {
    const newItems = remito.items.filter((_, i) => i !== index);
    const renumbered = renumberItems(newItems);
    setRemito((prev) => ({ ...prev, items: renumbered }));
  };

  const handleKeyPress = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (index === remito.items.length - 1) addItem(true);
    }
  };

  const handleSubmit = async () => {
    if (!remito.destino || !remito.fecha || remito.items.length === 0) {
      alert("Por favor, complete todos los campos requeridos y agregue al menos un ítem.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage("");

    try {
      await apiPut(`/api/Remitos/${id}`, remito);
      // Marcar el momento exacto del guardado exitoso
      markLastSaved(id);
      clearDraft(STORAGE_KEY);
      setSuccessMessage("Remito actualizado correctamente ✅");

      setTimeout(() => {
        navigate(`/remitos/verremito/${id}`);
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al guardar el remito. Intente nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600">
        <Loader2 className="w-6 h-6 animate-spin inline mr-2" />
        Cargando remito...
      </div>
    );
  }

  if (!remito) {
    return <p className="p-10 text-red-600 text-center">No se encontró el remito.</p>;
  }

  return (
    <div className="p-6 sm:p-10 bg-gray-50 min-h-screen font-inter">
      <style>{`
        .font-inter { font-family: 'Inter', sans-serif; }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>

      <div className="bg-white shadow-xl rounded-xl p-8 border border-gray-100 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center mb-6">
          <FileText className="w-8 h-8 mr-3 text-blue-600" /> Editar Remito #{remito.numero}
        </h2>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 mt-0.5" />
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded mb-4 flex items-start">
            <CheckCircle2 className="w-5 h-5 mr-2 mt-0.5" />
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="font-semibold flex items-center text-gray-700 mb-1">
              <FileText className="w-4 h-4 mr-2 text-blue-500" /> Número
            </label>
            <input
              type="text"
              name="numero"
              className="w-full border-gray-300 rounded-lg shadow-sm"
              value={remito.numero}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="font-semibold flex items-center text-gray-700 mb-1">
              <CalendarDays className="w-4 h-4 mr-2 text-blue-500" /> Fecha
            </label>
            <input
              type="date"
              name="fecha"
              className="w-full border-gray-300 rounded-lg shadow-sm"
              value={remito.fecha?.split("T")[0] || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="font-semibold flex items-center text-gray-700 mb-1">
              <MapPin className="w-4 h-4 mr-2 text-blue-500" /> Destino
            </label>
            <input
              type="text"
              name="destino"
              className="w-full border-gray-300 rounded-lg shadow-sm"
              value={remito.destino}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xl font-semibold text-gray-800">Ítems del Remito</h4>
          <button
            onClick={() => addItem(true)}
            disabled={remito.items.length >= 25}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
          >
            <PlusCircle className="w-5 h-5 mr-2" /> Agregar Ítem
          </button>
        </div>

        <div className="grid grid-cols-8 gap-3 mb-2 font-semibold text-gray-700 text-sm border-b-2 pb-2">
          <div className="text-center">#</div>
          <div>Descripción</div>
          <div>Serial</div>
          <div>Usuario</div>
          <div className="text-center">Cant.</div>
          <div>Detalle</div>
          <div>Recibido Por</div>
          <div className="text-center">Acciones</div>
        </div>

        {remito.items.map((item, i) => (
          <div key={i} className="grid grid-cols-8 gap-3 mb-2 border-b pb-2 items-center">
            <input
              type="text"
              value={item.numero_item}
              readOnly
              className="text-center bg-gray-50 border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Descripción"
              value={item.descripcion}
              onChange={(e) => handleItemChange(i, "descripcion", e.target.value)}
              className="border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Serial"
              value={item.serial}
              ref={(el) => (serialRefs.current[i] = el)}
              onChange={(e) => handleItemChange(i, "serial", e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, i)}
              className="border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Usuario"
              value={item.usuario}
              onChange={(e) => handleItemChange(i, "usuario", e.target.value)}
              className="border-gray-300 rounded"
            />
            <input
              type="number"
              placeholder="Cantidad"
              value={item.cantidad}
              onChange={(e) => handleItemChange(i, "cantidad", e.target.value)}
              className="border-gray-300 rounded text-center"
            />
            <input
              type="text"
              placeholder="Detalle"
              value={item.detalle}
              onChange={(e) => handleItemChange(i, "detalle", e.target.value)}
              className="border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Recibido por"
              value={item.recibido_por}
              onChange={(e) => handleItemChange(i, "recibido_por", e.target.value)}
              className="border-gray-300 rounded"
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="text-red-600 hover:text-red-800 flex justify-center"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}

        <div className="mt-6 text-right">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center mx-auto sm:mx-0"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarRemito;