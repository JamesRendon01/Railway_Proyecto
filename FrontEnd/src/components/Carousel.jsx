import { useEffect, useState } from "react";
import { Carousel, Spin, Empty, message } from "antd";

export default function PlanesCarousel() {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Cargar solo los planes con mostrar_en_carrusel=True
  useEffect(() => {
    fetch("http://localhost:8000/plan/listar-carrusel")
      .then(async (res) => {
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.detail || "Error al cargar los planes");
        }
        return res.json();
      })
      .then((data) => setPlanes(data))
      .catch((err) => {
        console.error("Error cargando planes:", err);
        message.warning("No hay planes para mostrar en el carrusel");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );

  if (planes.length === 0)
    return (
      <div className="flex justify-center items-center h-64">
        <Empty description="No hay planes para mostrar" />
      </div>
    );

  return (
    <div className="w-full py-10 px-10">
      <Carousel autoplay autoplaySpeed={5000} dotPosition="bottom">
        {planes.map((plan) => (
          <div key={plan.id} className="flex justify-center items-center">
            <div className="w-full h-[500px] rounded-lg shadow-lg overflow-hidden relative">
              {/* Imagen */}
              <img
                src={`http://localhost:8000/uploads/planes_img/${plan.imagen}`}
                alt={plan.nombre}
                className="w-full h-full object-cover"
              />

              {/* Overlay con título */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
                <h2 className="text-xl font-bold">{plan.nombre}</h2>
                <p className="text-sm line-clamp-2">{plan.descripcion_corta}</p>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}
