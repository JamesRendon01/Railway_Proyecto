// src/components/ButtonGenerico.jsx
export default function ButtonGenerico({
  texto = "Botón",
  onClick = () => {},
}) {
  return (
    <button
      onClick={onClick}
      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 border-2 border-black"
    >
      {texto}
    </button>
  );
}
