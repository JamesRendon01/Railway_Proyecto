import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const FiltroGenerico = ({ url, campos = [], onChange }) => {
  const [datos, setDatos] = useState([]);
  const [valores, setValores] = useState({});

  // Cargar datos desde el backend
  useEffect(() => {
    if (!url) return;
    fetch(url)
      .then((res) => res.json())
      .then((data) => setDatos(data))
      .catch((err) => console.error("Error al cargar datos:", err));
  }, [url]);

  // Manejar selección
  const handleSelect = (campo, valor) => {
    const nuevosValores = { ...valores, [campo]: valor };

    // 🔸 Resetear los filtros siguientes al cambiar uno superior
    const indexActual = campos.indexOf(campo);
    campos.slice(indexActual + 1).forEach((c) => (nuevosValores[c] = ""));

    setValores(nuevosValores);
    onChange?.(nuevosValores);
  };

  // 🔹 Generar opciones dinámicas para cada campo
  const getOpciones = (campo, index) => {
    const filtrosPrevios = campos.slice(0, index);
    return [
      ...new Set(
        datos
          .filter((item) =>
            filtrosPrevios.every((f) => !valores[f] || item[f] === valores[f])
          )
          .map((item) => item[campo] || "")
      ),
    ];
  };

  return (
    <div className="flex flex-col flex-1 mt-2">
      <div className="flex gap-2 font-title">
        {campos.map((campo, index) => {
          const opciones = getOpciones(campo, index);
          const deshabilitado =
            index > 0 && !valores[campos[index - 1]] && opciones.length === 0;

          return (
            <select
              key={campo}
              value={valores[campo] || ""}
              onChange={(e) => handleSelect(campo, e.target.value)}
              disabled={deshabilitado}
              className={`bg-white text-black px-4 py-2 rounded-4xl border-2 border-black cursor-pointer font-bold text-[15px] w-[140px] h-[40px] text-center
                focus:outline-none focus:shadow-[0_0_4px_rgba(44,44,229,0.4)]
                disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <option value="">
                {campo.charAt(0).toUpperCase() + campo.slice(1)}
              </option>
              {opciones.map(
                (op, i) =>
                  op && (
                    <option key={i} value={op}>
                      {op}
                    </option>
                  )
              )}
            </select>
          );
        })}
      </div>
    </div>
  );
};

FiltroGenerico.propTypes = {
  url: PropTypes.string.isRequired, // Endpoint para cargar los datos
  campos: PropTypes.arrayOf(PropTypes.string).isRequired, // Orden jerárquico de los filtros
  onChange: PropTypes.func, // Callback al cambiar selección
};

export default FiltroGenerico;
