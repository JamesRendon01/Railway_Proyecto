import React, { useState } from "react";

/**
 * 🔹 Componente genérico para filtrar por fechas
 * 
 * Props:
 * - onFiltrar(fechaInicio, fechaFin): función callback que recibe las fechas seleccionadas
 * - titulo (opcional): texto que se mostrará arriba del filtro
 */
export default function FiltroFechas({ onFiltrar, titulo = "Filtrar por fechas" }) {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const aplicarFiltro = () => {
    if (onFiltrar) {
      onFiltrar(fechaInicio || null, fechaFin || null);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-end gap-4 bg-gray-50 p-4 rounded-xl shadow-md mb-6">
      {titulo && (
        <h3 className="text-lg font-semibold text-gray-700">{titulo}</h3>
      )}

      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-600 mb-1">Desde:</label>
        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-600 mb-1">Hasta:</label>
        <input
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
        />
      </div>

      <button
        onClick={aplicarFiltro}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-all mt-2 md:mt-0"
      >
        Aplicar filtro
      </button>
    </div>
  );
}
