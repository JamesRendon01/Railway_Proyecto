import React, { useEffect, useState } from "react";
import { CheckCircle, X } from "lucide-react";

export default function CardReservas({ query }) {
  const [reservas, setReservas] = useState([]);
  const [filteredReservas, setFilteredReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReserva, setSelectedReserva] = useState(null);

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No estás autenticado. Inicia sesión nuevamente.");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:8000/reserva/mis_reservas", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) throw new Error("No autorizado. Inicia sesión nuevamente.");
        if (!response.ok) throw new Error("Error al obtener las reservas.");

        const data = await response.json();
        setReservas(data);
        setFilteredReservas(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, []);

  // 👉 Filtrado en tiempo real
  useEffect(() => {
    if (query.trim() === "") {
      setFilteredReservas(reservas);
    } else {
      const lowerQuery = query.toLowerCase();
      const filtered = reservas.filter(
        (r) =>
          r.plan_nombre.toLowerCase().includes(lowerQuery) ||
          r.turista_nombre.toLowerCase().includes(lowerQuery)
      );
      setFilteredReservas(filtered);
    }
  }, [query, reservas]);

  if (loading) return <p className="text-center mt-10">Cargando tus reservas...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (

    <div>
      {filteredReservas.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">No tienes reservas registradas.</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-6">
          {filteredReservas.map((reserva) => (
            <ReservaCard
              key={reserva.id}
              reserva={reserva}
              onVerComprobante={() => setSelectedReserva(reserva)}
            />
          ))}
        </div>
      )}

      {selectedReserva && (
        <ComprobanteModal
          reserva={selectedReserva}
          onClose={() => setSelectedReserva(null)}
        />
      )}
    </div>
  );
}

function ReservaCard({ reserva, onVerComprobante }) {
  return (
    <div className="w-[260px] bg-white rounded-3xl shadow-md overflow-hidden border border-gray-200 transition-shadow hover:shadow-lg">
      <div className="p-3 pb-0">
        <div className="rounded-2xl overflow-hidden border border-gray-300 shadow-sm">
          <img
            src={`http://localhost:8000/uploads/planes_img/${reserva.plan_imagen}`}
            alt={reserva.plan_nombre}
            className="w-full h-[160px] object-cover"
          />
        </div>
      </div>

      <div className="p-4 text-gray-900">
        <h3 className="font-semibold text-lg">{reserva.plan_nombre}</h3>
        <p className="text-sm text-gray-600">
          Fecha reserva: {reserva.fecha_reserva}
        </p>
        <p className="font-bold text-base mb-3">
          Total pagado: ${reserva.costo_final}
        </p>

        <button
          onClick={onVerComprobante}
          className="w-full bg-[#62b6cb] text-white py-2 rounded-lg hover:bg-[#4aa1b7] transition-colors"
        >
          Ver comprobante
        </button>
      </div>
    </div>
  );
}

function ComprobanteModal({ reserva, onClose }) {
  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-lg p-6 relative animate-fadeIn border border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X size={22} />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
          📄 COMPROBANTE DE PAGO
        </h2>

        <div className="text-center mt-4">

          <div className="flex justify-center items-center gap-2 text-green-600 font-semibold mt-2 mb-6">
            <CheckCircle size={20} />
            <span>Reservación Exitosa</span>
          </div>

          <div className="text-gray-700 text-left space-y-2">
            <p>Bogotá, {new Date().toLocaleDateString()}</p>
            <p>
              Sr. <b>{reserva.turista_nombre}</b>, identificado con CC{" "}
              <b>{reserva.turista_identificacion}</b> y teléfono{" "}
              <b>{reserva.turista_celular}</b>.
            </p>
            <p>
              Su reserva para el plan <b>{reserva.plan_nombre}</b> ha sido procesada exitosamente.
            </p>

            <p>
              <b>Fecha de reserva:</b> {reserva.fecha_reserva}
            </p>
            <p>
              <b>Número de personas:</b> {reserva.numero_personas}
            </p>
            <p>
              <b>Total:</b> ${reserva.costo_final}
            </p>
            <p>
              <b>Método de pago:</b> {reserva.metodo_pago || "Tarjeta de crédito"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="mt-6 bg-[#62b6cb] text-black font-semibold px-6 py-2 rounded-lg hover:bg-[#4aa1b7]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
