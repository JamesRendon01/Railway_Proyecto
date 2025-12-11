import React, { useEffect, useState } from "react";
import { Heart, X } from "lucide-react";
import { useFavoritosStore } from "../storage/favoritos_storage.js";
import { useNavigate } from "react-router-dom";

export default function CardComponent({ showButton, plans = [] }) {
  const { cargarFavoritos } = useFavoritosStore();

  useEffect(() => {
    cargarFavoritos();
  }, [cargarFavoritos]);

  return (
    <div className="flex flex-wrap justify-center gap-6 mt-6 mb-16">
      {Array.isArray(plans) && plans.length > 0 ? (
        plans.map((plan) => (
          <Card key={plan.id} plan={plan} showButton={showButton} />
        ))
      ) : (
        <p className="text-gray-500">No hay planes disponibles.</p>
      )}
    </div>
  );
}

function Card({ plan, showButton }) {
  const { favoritos, toggleFavorito } = useFavoritosStore();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const esFavorito = favoritos.some((fav) => fav.id === plan.id);

  const handleReservar = () => {
    navigate("/reservas", { state: { plan } });
  };

  return (
    <>
      {/* === CARD === */}
      <div
        className="w-[260px] bg-white rounded-3xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200 relative cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        {/* Imagen + Corazón */}
        <div className="relative p-3 pb-0">
          <div className="rounded-2xl overflow-hidden border border-gray-300 shadow-sm relative">
            <img
              src={`http://localhost:8000/uploads/planes_img/${plan.imagen}`}
              alt={plan.nombre}
              className="w-full h-[160px] object-cover transition-transform duration-300 hover:scale-105"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorito(plan);
              }}
              className={`absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                esFavorito ? "bg-fondo border-black" : "bg-white border-black"
              }`}
            >
              <Heart
                size={20}
                color="black"
                fill={esFavorito ? "#62b6cb" : "none"}
                strokeWidth={1.5}
              />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900">{plan.nombre}</h3>
          <p className="text-sm text-gray-600 mb-1">{plan.ciudad}</p>
          <p className="text-gray-700 text-sm line-clamp-2 mb-3">
            {plan.descripcion_corta || plan.descripcion}
          </p>
          <p className="text-gray-900 font-bold text-base mb-4">
            desde ${plan.costo_persona} por persona
          </p>

          {showButton && (
            <div
              className="flex justify-between items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleReservar}
                className="bg-[#62b6cb] text-white font-semibold text-sm px-4 py-2 rounded-full hover:bg-[#4aa1b7] transition-colors duration-200 border-2 border-black"
              >
                Reservar
              </button>

              <button
                onClick={() => toggleFavorito(plan)}
                className="flex items-center gap-2 text-gray-700 font-medium text-sm hover:text-[#62b6cb] transition-colors duration-200"
              >
                <Heart
                  size={16}
                  fill={esFavorito ? "#62b6cb" : "none"}
                  color={esFavorito ? "#62b6cb" : "gray"}
                />
                <span>{esFavorito ? "Eliminar" : "Favoritos"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* === MODAL === */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm bg-black/30">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-lg w-[90%] max-w-2xl p-6 relative flex flex-col md:flex-row gap-6 border border-gray-300">
            {/* Botón cerrar */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X size={24} />
            </button>

            {/* Imagen */}
            <div className="flex-1 flex justify-center items-center">
              <img
                src={`http://localhost:8000/uploads/planes_img/${plan.imagen}`}
                alt={plan.nombre}
                className="w-full max-h-[300px] object-cover rounded-2xl border border-gray-300"
              />
            </div>

            {/* Información + botón abajo */}
            <div className="flex-1 flex flex-col justify-between">
              <div className="overflow-y-auto max-h-[320px] pr-2 mb-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {plan.nombre}
                </h2>
                <p className="text-gray-600 mb-1 text-sm">Ciudad: {plan.ciudad}</p>
                <p className="text-gray-800 text-sm leading-relaxed mb-4">
                  {plan.descripcion}
                </p>

                {/* 🧭 Sección de ubicaciones */}
                {plan.ubicaciones && plan.ubicaciones.length > 0 && (
                  <div className="mb-3">
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm uppercase">
                      Ubicaciones:
                    </h4>
                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                      {plan.ubicaciones.map((ubi, idx) => (
                        <li key={idx}>{ubi}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-lg font-bold text-[#62b6cb]">
                  ${plan.costo_persona} por persona
                </p>
              </div>

              <div className="flex justify-center mt-auto pt-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowModal(false);
                    handleReservar();
                  }}
                  className="bg-[#62b6cb] text-white font-semibold text-base px-6 py-3 rounded-full hover:bg-[#4aa1b7] transition-colors duration-200 border-2 border-black"
                >
                  Reservar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
