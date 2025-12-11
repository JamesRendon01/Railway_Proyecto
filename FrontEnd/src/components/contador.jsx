// 📁 components/Contador.jsx
export default function Contador({ items = [] }) {
  if (!items.length) return null; // si no hay datos, no renderiza nada

  return (
    <div className="flex justify-center pb-10">
      <div
        className={`grid grid-cols-3 ${items.length} gap-40`}
      >
        {items.map((item, index) => (
          <Card key={index} titulo={item.titulo} valor={item.valor} />
        ))}
      </div>
    </div>
  );
}

// 🔹 Subcomponente de tarjeta reutilizable
function Card({ titulo, valor }) {
  return (
    <div className="bg-nav w-40 h-30 flex flex-col items-center justify-center rounded-xl shadow border-2 border-black">
      <span className="font-bold text-lg text-center">{titulo}</span>
      <span className="text-2xl">{valor}</span>
    </div>
  );
}
