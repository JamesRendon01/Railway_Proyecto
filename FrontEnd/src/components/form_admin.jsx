export default function FormularioGenerico({
  titulo = "Formulario",
  campos = [], // Array de objetos que definen los campos
  valores = {},
  onChange,
  onFileChange,
  onSubmit,
  botonTexto = "Guardar",
}) {
  return (
    <div className="p-6 flex justify-center items-center min-h-screen">
      <form
        onSubmit={onSubmit}
        className="bg-white shadow-lg rounded-xl p-6 w-96"
      >
        <h2 className="text-xl font-bold mb-6 text-center">{titulo}</h2>

        {campos.map((campo) => {
          switch (campo.tipo) {
            case "file":
              return (
                <div key={campo.nombre} className="mb-4">
                  <label className="block font-medium mb-1">{campo.label}</label>
                  <input
                    type="file"
                    name={campo.nombre}
                    accept={campo.accept || "image/*"}
                    onChange={onFileChange}
                    className="w-full border px-3 py-2 rounded"
                  />
                  {campo.preview && (
                    <img
                      src={campo.preview}
                      alt="Vista previa"
                      className="mt-2 w-full h-40 object-cover rounded"
                    />
                  )}
                </div>
              );

            case "textarea":
              return (
                <div key={campo.nombre} className="mb-4">
                  <label className="block font-medium mb-1">{campo.label}</label>
                  <textarea
                    name={campo.nombre}
                    value={valores[campo.nombre] || ""}
                    onChange={onChange}
                    className="w-full border px-3 py-2 rounded"
                    required={campo.required}
                  />
                </div>
              );

            case "select":
              return (
                <div key={campo.nombre} className="mb-4">
                  <label className="block font-medium mb-1">{campo.label}</label>
                  <select
                    name={campo.nombre}
                    value={valores[campo.nombre] || ""}
                    onChange={onChange}
                    className="w-full border px-3 py-2 rounded"
                    required={campo.required}
                  >
                    <option value="">Seleccione una opción</option>
                    {campo.opciones?.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              );

            case "checkbox":
              return (
                <div
                  key={campo.nombre}
                  className="mb-4 flex items-center gap-2 border rounded p-2"
                >
                  <input
                    type="checkbox"
                    name={campo.nombre}
                    checked={!!valores[campo.nombre]}
                    onChange={(e) =>
                      onChange({
                        target: {
                          name: campo.nombre,
                          value: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 accent-green-500"
                  />
                  <label className="font-medium text-gray-700">
                    {campo.label}
                  </label>
                </div>
              );

            default:
              return (
                <div key={campo.nombre} className="mb-4">
                  <label className="block font-medium mb-1">{campo.label}</label>
                  <input
                    type={campo.tipo}
                    name={campo.nombre}
                    value={valores[campo.nombre] || ""}
                    onChange={onChange}
                    className="w-full border px-3 py-2 rounded"
                    required={campo.required}
                  />
                </div>
              );
          }
        })}

        <div className="mt-5">
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full font-semibold"
          >
            {botonTexto}
          </button>
        </div>
      </form>
    </div>
  );
}
