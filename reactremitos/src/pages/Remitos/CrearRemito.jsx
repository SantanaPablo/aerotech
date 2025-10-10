import React, { useState, useEffect } from "react";
import { PlusCircle, Save, Trash2, Loader2, FileText, CalendarDays, MapPin } from "lucide-react";

const API_URL = "http://localhost:5003/api/Remitos";

const CrearRemito = ({ token }) => {
  const [remito, setRemito] = useState({
    numero: "",
    fecha: new Date().toISOString().split("T")[0],
    destino: "",
    items: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar número de remito siguiente
  useEffect(() => {
    const fetchUltimoNumero = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const numeros = data
            .map((r) => parseInt(r.numero))
            .filter((n) => !isNaN(n));
          const max = Math.max(...numeros);
          setRemito((prev) => ({ ...prev, numero: (max + 1).toString() }));
        } else {
          setRemito((prev) => ({ ...prev, numero: "1" }));
        }
      } catch {
        setRemito((prev) => ({ ...prev, numero: "1" }));
      }
    };
    fetchUltimoNumero();

    const saved = localStorage.getItem("nuevoRemito");
    if (saved) setRemito(JSON.parse(saved));
  }, []);

  // Guardar localStorage
  useEffect(() => {
    localStorage.setItem("nuevoRemito", JSON.stringify(remito));
  }, [remito]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRemito((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...remito.items];
    newItems[index][field] = value;
    setRemito((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    if (remito.items.length >= 25) return;
    setRemito((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          numero_item: prev.items.length + 1,
          descripcion: "",
          serial: "",
          usuario: "",
          cantidad: 1,
          detalle: "",
          recibido_por: "",
        },
      ],
    }));
  };

  const removeItem = (index) => {
    const newItems = remito.items.filter((_, i) => i !== index);
    setRemito((prev) => ({ ...prev, items: newItems }));
  };

  const handleKeyPress = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (index === remito.items.length - 1) addItem();
    }
  };

  const handleSubmit = async () => {
    if (!remito.destino || !remito.fecha || remito.items.length === 0) {
      alert("Por favor, complete todos los campos requeridos y agregue al menos un ítem.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(remito),
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      alert("Remito guardado correctamente ✅");
      localStorage.removeItem("nuevoRemito");
      setRemito({
        numero: "",
        fecha: new Date().toISOString().split("T")[0],
        destino: "",
        items: [],
      });
    } catch (err) {
      setError("Error al guardar el remito");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 bg-gray-50 min-h-screen">
      <div className="bg-white shadow-xl rounded-xl p-8 border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center mb-6">
          <FileText className="w-8 h-8 mr-3 text-blue-600" /> Crear Remito
        </h2>

        {/* Campos principales */}
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
              value={remito.fecha}
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

        {/* Ítems */}
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xl font-semibold text-gray-800">Ítems del Remito</h4>
          <button
            onClick={addItem}
            disabled={remito.items.length >= 25}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
          >
            <PlusCircle className="w-5 h-5 mr-2" /> Agregar Ítem
          </button>
        </div>

        {remito.items.map((item, i) => (
          <div key={i} className="grid grid-cols-6 gap-3 mb-2 border-b pb-2">
            <input
              type="text"
              value={i + 1}
              readOnly
              className="text-center bg-gray-50 border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Descripción"
              value={item.descripcion}
              onChange={(e) => handleItemChange(i, "descripcion", e.target.value)}
              className="col-span-1 border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Serial"
              value={item.serial}
              onChange={(e) => handleItemChange(i, "serial", e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, i)}
              className="col-span-1 border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Usuario"
              value={item.usuario}
              onChange={(e) => handleItemChange(i, "usuario", e.target.value)}
              className="col-span-1 border-gray-300 rounded"
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
              className="col-span-1 border-gray-300 rounded"
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="text-red-600 hover:text-red-800 ml-2"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}

        {/* Botón Guardar */}
        <div className="mt-6 text-right">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center mx-auto sm:mx-0"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            Guardar Remito
          </button>
        </div>

        {error && <p className="text-red-600 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default CrearRemito;
