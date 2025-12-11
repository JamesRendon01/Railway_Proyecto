import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MoveLeft, MoveRight } from 'lucide-react';
import axios from "axios";
import CardComponent from "./card";
import { message, Modal, DatePicker } from "antd";
import { IMaskInput } from "react-imask";
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");

export default function FormReservas() {
  const location = useLocation();
  const navigate = useNavigate();
  const { plan } = location.state || {};

  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    id: "",
    correo: "",
    nombre: "",
    fecha: "",
    identificacion: "",
    celular: "",
    numeroPersonas: "",
    tarjeta: "",
    numeroTarjeta: "",
    fechaVencimiento: "",
    ccv: "",
  });

  const [personas, setPersonas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fechasOcupadas, setFechasOcupadas] = useState([]);

  const [confirmarAcompanantes, setConfirmarAcompanantes] = useState(false);
  const [currentPersonaIndex, setCurrentPersonaIndex] = useState(0);
  const [nombreAcompanante, setNombreAcompanante] = useState("");
  const [TipoIdentificacionAcompanante, setTipoIdentificacionAcompanante] = useState("");
  const [identificacionAcompanante, setIdentificacionAcompanante] = useState("");
  const [edadAcompanante, setEdadAcompanante] = useState("");


  const [tarjeta, setTarjeta] = useState({
    nombre: "",
    tipo_tarjeta: "",
    numero: "",
    fecha_vencimiento: "",
    cvv: "",
  });

  const handleTarjetaChange = (campo, valor) => {
    setTarjeta((prev) => ({ ...prev, [campo]: valor }));
  };



  useEffect(() => {
    const token = localStorage.getItem("token");


    if (token) {
      axios
        .get("http://localhost:8000/turista/reservas/mis-datos", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setFormData((prev) => ({ ...prev, ...res.data })))
        .catch((err) =>
          console.error("❌ Error al obtener los datos del turista", err)
        );
    }


    if (plan?.id) {
      axios
        .get(`http://localhost:8000/reserva/disponibilidad/${plan.id}`)
        .then((res) => setFechasOcupadas(res.data.fechas_ocupadas || []))
        .catch((err) =>
          console.error("❌ Error al obtener fechas ocupadas", err)
        );
    }
  }, [plan]);


  const deshabilitarFechas = (current) => {
    const hoy = dayjs().startOf("day");
    if (current.isBefore(hoy)) return true;
    return fechasOcupadas.some((fecha) => dayjs(fecha).isSame(current, "day"));
  };

  const handleNumeroPersonas = (e) => {
    const value = parseInt(e.target.value, 10);
    setFormData({ ...formData, numeroPersonas: value });

    if (value > 1) {
      const nuevasPersonas = Array.from({ length: value - 1 }, () => ({
        nombre: "",
        tipo_identificacion: "",
        identificacion: "",
        edad: "",
      }));
      setPersonas(nuevasPersonas);
    } else {
      setPersonas([]);
    }
  };

  const handlePersonaChange = (index, field, value) => {
    const updated = [...personas];
    updated[index][field] = value;
    setPersonas(updated);
  };

  const formatValidationDetail = (detail) => {
    if (Array.isArray(detail)) {
      return detail
        .map((d) => {
          if (typeof d === "string") return d;
          return d?.msg
            ? `${d.msg} (${(d.loc || []).join(" > ")})`
            : JSON.stringify(d);
        })
        .join("\n");
    }
    if (typeof detail === "object") return JSON.stringify(detail);
    return String(detail);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const token = localStorage.getItem("token");

    for (const [i, p] of personas.entries()) {
      if (!p.nombre || !p.tipo_identificacion || !p.identificacion || !p.edad) {
        Modal.warning({
          title: `Campos incompletos en acompañante #${i + 1}`,
          content: "Por favor completa todos los campos requeridos.",
        });
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const payload = {
        fecha_reserva: formData.fecha,
        disponibilidad: "Confirmada",
        numero_personas: parseInt(formData.numeroPersonas, 10),
        id_informe: null,
        id_plan: plan?.id,
        email_cliente: formData.correo,
        acompanantes: personas.length ? personas.map((p) => ({
          nombre: p.nombre,
          tipo_identificacion: p.tipo_identificacion,
          identificacion: p.identificacion,
          edad: parseInt(p.edad || 0, 10),
        })) : [],
        tarjeta: {
          nombre: tarjeta.nombre,
          tipo_tarjeta: tarjeta.tipo_tarjeta,
          numero: tarjeta.numero.replace(/\s/g, ""),
          fecha_vencimiento: tarjeta.fecha_vencimiento,
          cvv: parseInt(tarjeta.cvv, 10), // ✅ corregido
        },
      };
      const res = await axios.post(
        "http://localhost:8000/reserva/crear_reserva",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      message.success("✅ Reserva realizada con éxito");
      setShowModal(true);
    } catch (error) {
      console.error("❌ Error al crear reserva:", error);
      const data = error.response?.data || {};
      const detail =
        data.detail ?? data.message ?? data.error ?? data ?? "Error desconocido";
      const text = formatValidationDetail(detail);
      Modal.error({ title: "Error al crear reserva", content: text });
    } finally {
      setIsSubmitting(false);
    }

  };

  // 🔹 Render de secciones
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h3 className="text-lg font-bold mb-4 text-center">
              🗓️ Datos de la reserva
            </h3>
            <label className="block pb-2">Correo</label>
            <input readOnly type="email" value={formData.correo}
              className="bg-black/20 border-2 border-black rounded-xl h-10 w-full px-3 mb-4" />

            <label className="block pb-2">Nombre</label>
            <input readOnly type="text" value={formData.nombre}
              className="bg-black/20 border-2 border-black rounded-xl h-10 w-full px-3 mb-4" />

            <label className="block pb-2">Identificación</label>
            <input readOnly type="number" value={formData.identificacion}
              className="bg-black/20 border-2 border-black rounded-xl h-10 w-full px-3 mb-4" />

            <label className="block pb-2">Celular</label>
            <input readOnly type="number" value={formData.celular}
              className="bg-black/20 border-2 border-black rounded-xl h-10 w-full px-3 mb-4" />


            <label className="block pb-2">Fecha de reserva</label>
            <DatePicker
              format="YYYY-MM-DD"
              disabledDate={deshabilitarFechas}
              onChange={(date) =>
                setFormData({
                  ...formData,
                  fecha: date?.format("YYYY-MM-DD") || "",
                })
              }
              className="w-full border-2 border-black rounded-xl h-10 px-3 mb-4"
              placeholder="Selecciona una fecha disponible"
              required
            />

            <label className="block pb-2">Número de personas</label>
            <input
              type="number"
              value={formData.numeroPersonas}
              onChange={handleNumeroPersonas}
              className="bg-white border-2 border-black rounded-xl h-10 w-full px-3 mb-4"
              required
              min="1"
            />
          </>
        );

      case 2:
        return (
          <>
            <h3 className="text-lg font-bold mb-4 text-center">
              👥 Datos de acompañantes
            </h3>

            {personas.length > 0 ? (
              <div className="mb-4 border border-gray-300 rounded-lg p-3 bg-gray-50">
                <p className="font-semibold mb-2 text-center">
                  Acompañante {currentPersonaIndex + 1} de {personas.length}
                </p>

                <label className="block text-sm pb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={personas[currentPersonaIndex].nombre}
                  onChange={(e) =>
                    handlePersonaChange(currentPersonaIndex, "nombre", e.target.value)
                  }
                  className="w-full border-2 border-black rounded-xl h-8 px-2 mb-2"
                  required
                />

                <label className="block text-sm pb-1 mt-2">Tipo de identificación</label>
                <select
                  name="tipo_identificacion"
                  value={personas[currentPersonaIndex].tipo_identificacion}
                  onChange={(e) =>
                    handlePersonaChange(currentPersonaIndex, "tipo_identificacion", e.target.value)
                  }
                  required
                  className="w-full border-2 border-black rounded-xl h-8 px-2 mb-2 bg-white"
                >
                  <option value="">Seleccione un tipo de documento</option>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="TI">Tarjeta de Identidad</option>
                  <option value="PP">Pasaporte</option>
                  <option value="PPT">Permiso por Protección Temporal</option>
                </select>



                <label className="block text-sm pb-1">Identificación</label>
                <input
                  type="text"
                  value={personas[currentPersonaIndex].identificacion}
                  onChange={(e) =>
                    handlePersonaChange(currentPersonaIndex, "identificacion", e.target.value)
                  }
                  className="w-full border-2 border-black rounded-xl h-8 px-2 mb-2"
                  required
                />

                <label className="block text-sm pb-1">Edad</label>
                <input
                  type="number"
                  value={personas[currentPersonaIndex].edad}
                  onChange={(e) =>
                    handlePersonaChange(currentPersonaIndex, "edad", e.target.value)
                  }
                  className="w-full border-2 border-black rounded-xl h-8 px-2"
                />

                <div className="flex justify-between mt-4">
                  <button
                    type="button"
                    disabled={currentPersonaIndex === 0}
                    onClick={() =>
                      setCurrentPersonaIndex(currentPersonaIndex - 1)
                    }
                    className={`px-6 py-2 border-2 border-black rounded-3xl font-bold ${currentPersonaIndex === 0
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-gray-200 hover:bg-gray-300"
                      }`}
                  >
                    <MoveLeft />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const p = personas[currentPersonaIndex];
                      if (!p.nombre || !p.tipo_identificacion || !p.identificacion) {
                        message.warning("Completa todos los campos antes de continuar.");
                        return;
                      }

                      if (currentPersonaIndex < personas.length - 1) {
                        setCurrentPersonaIndex(currentPersonaIndex + 1);
                      } else {
                        // ✅ Todos los acompañantes completados — mostrar modal de confirmación
                        setConfirmarAcompanantes(true);
                      }

                    }}
                    className="bg-nav px-6 py-2 border-2 border-black rounded-3xl font-bold"
                  >
                    {currentPersonaIndex < personas.length - 1
                      ? <MoveRight />
                      : "Confirmar"}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-600">
                No hay acompañantes registrados.
              </p>
            )}
          </>
        );


      case 3:
        return (
          <>
            <h3 className="text-lg font-bold mb-4 text-center">💳 Datos de pago</h3>

            {/* Nombre en la tarjeta */}
            <label className="block pb-2 mt-4">Nombre en la tarjeta</label>
            <input
              type="text"
              name="nombre"
              value={tarjeta.nombre}
              onChange={(e) => handleTarjetaChange("nombre", e.target.value)}
              placeholder="Ej: Ana Hernández"
              className="bg-white border-2 border-black rounded-xl h-10 w-full px-3 mb-2"
              required
            />

            {/* Tipo de tarjeta */}
            <label className="block text-sm pb-1 mt-2">Tipo de tarjeta</label>
            <select
              name="tipo_tarjeta"
              value={tarjeta.tipo_tarjeta}
              onChange={(e) => handleTarjetaChange("tipo_tarjeta", e.target.value)}
              className="w-full border-2 border-black rounded-xl h-10 px-2 mb-2 bg-white"
              required
            >
              <option value="">Seleccione un tipo de tarjeta</option>
              <option value="TC">Crédito</option>
              <option value="TD">Débito</option>
            </select>

            {/* Número de tarjeta */}
            <label className="block pb-2 mt-2">Número de tarjeta</label>
            <IMaskInput
              mask="0000 0000 0000 0000"
              value={tarjeta.numero}
              onAccept={(value) => handleTarjetaChange("numero", value)}
              placeholder="XXXX XXXX XXXX XXXX"
              className="bg-white border-2 border-black rounded-xl h-10 w-full px-3 mb-2"
              required
            />

            {/* Fecha de vencimiento */}
            <label className="block pb-2 mt-2">Fecha de vencimiento</label>
            <IMaskInput
              mask="00/00"
              value={tarjeta.fecha_vencimiento}
              onAccept={(value) =>
                handleTarjetaChange("fecha_vencimiento", value)
              }
              placeholder="MM/AA"
              className="bg-white border-2 border-black rounded-xl h-10 w-full px-3 mb-2"
              required
            />

            {/* CVV */}
            <label className="block pb-2 mt-2">CVV</label>
            <IMaskInput
              mask="0000"
              value={tarjeta.cvv}
              onAccept={(value) => handleTarjetaChange("cvv", value)}
              placeholder="3 o 4 dígitos"
              className="bg-white border-2 border-black rounded-xl h-10 w-full px-3 mb-6"
              required
            />
          </>
        );


      default:
        return null;
    }
  };

  return (
    <>
      <div className="mt-10 flex flex-col lg:flex-row justify-center items-start gap-10 px-4">
        {plan && <CardComponent showButton={false} plans={[plan]} />}

        <div className="w-full lg:w-1/2">
          <form
            onSubmit={handleSubmit}
            className="w-full bg-white border-2 border-black rounded-xl p-6 sm:p-10 shadow-lg"
          >
            {renderStep()}

            <div className="flex justify-between mt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    if (currentStep === 3) {
                      const num = parseInt(formData.numeroPersonas || 0, 10);
                      // Si solo hay una persona → volver directo al paso 1
                      if (num <= 1) {
                        setCurrentStep(1);
                        return;
                      }
                    }
                    setCurrentStep(currentStep - 1);
                  }}
                  className="bg-gray-300 px-6 py-2 border-2 border-black rounded-3xl font-bold"
                >
                  Atrás
                </button>
              )}

              {currentStep < 3 && (
                <button
                  type="button"
                  onClick={() => {
                    // 🔍 Validación antes de avanzar
                    if (currentStep === 1) {
                      if (!formData.fecha || !formData.numeroPersonas) {
                        message.warning("Por favor completa todos los campos de la reserva.");
                        return;
                      }

                      const num = parseInt(formData.numeroPersonas || 0, 10);

                      // 🧩 Si solo hay una persona, salta al paso de pago (no acompañantes)
                      if (num <= 1) {
                        setCurrentStep(3);
                        return;
                      }

                      // Si hay más de una persona → ir al paso 2
                      setCurrentStep(2);
                      return;
                    }

                    // 🔍 Validación antes de pasar del paso 2 (acompañantes)
                    if (currentStep === 2) {
                      for (const [i, p] of personas.entries()) {
                        if (!p.nombre || !p.apellido || !p.identificacion) {
                          message.warning(`Por favor completa todos los datos del acompañante #${i + 1}`);
                          return;
                        }
                      }
                      setCurrentStep(3);
                      return;
                    }
                  }}
                  className="bg-nav px-6 py-2 border-2 border-black rounded-3xl font-bold"
                >
                  Siguiente
                </button>
              )}

              {currentStep === 3 && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 border-2 border-black rounded-3xl font-bold ${isSubmitting ? "bg-gray-300" : "bg-nav"
                    }`}
                >
                  {isSubmitting ? "Reservando..." : "Reservar"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* 🔹 Modal de confirmación de acompañantes */}
      <Modal
        title="✅ Confirmación de acompañantes"
        open={confirmarAcompanantes}
        onCancel={() => setConfirmarAcompanantes(false)}
        footer={null}
      >
        <div className="p-4 max-h-64 overflow-y-auto">
          {personas.map((p, i) => (
            <div key={i} className="border-b pb-2 mb-2">
              <p>
                <strong>{i + 1}. {p.nombre} {p.tipo_identificacion}</strong><br />
                <span>Identificación: {p.identificacion}</span><br />
                <span>Edad: {p.edad || "N/A"}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => {
              setConfirmarAcompanantes(false);
              setCurrentPersonaIndex(personas.length - 1);
            }}
            className="bg-gray-300 px-4 py-2 border-2 border-black rounded-3xl font-bold"
          >
            Atrás
          </button>

          <button
            onClick={() => {
              setConfirmarAcompanantes(false);
              setCurrentStep(2);
            }}
            className="bg-gray-300 px-4 py-2 border-2 border-black rounded-3xl font-bold"
          >
            Editar
          </button>

          <button
            onClick={() => {
              setConfirmarAcompanantes(false);
              setCurrentStep(3);
            }}
            className="bg-nav px-4 py-2 border-2 border-black rounded-3xl font-bold"
          >
            Continuar
          </button>
        </div>
      </Modal>
      {/* 🔹 Modal de comprobante de pago */}

      <Modal
        title="📄 Comprobante de Pago"
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={[
          <button
            key="close"
            onClick={() => setShowModal(false)}
            className="bg-nav px-4 py-2 border-2 border-black rounded-xl font-bold"
          >
            Cerrar
          </button>,
        ]}
      >
        <div className="p-4 text-sm leading-relaxed">
          <h2 className="text-center font-bold text-xl mb-2">
            COMPROBANTE DE PAGO
          </h2>
          <p className="text-center font-semibold mb-4">
            ✅ Reservación Exitosa
          </p>
          <p>Bogotá, {new Date().toLocaleDateString("es-CO")}</p>
          <p>
            Sr. <strong>{formData.nombre}</strong>, identificado con CC{" "}
            <strong>{formData.identificacion}</strong> y teléfono{" "}
            <strong>{formData.celular}</strong>.
          </p>
          <p className="mt-2">
            Su reserva para el plan <strong>{plan?.nombre}</strong> ha sido
            procesada exitosamente.
          </p>

          <div className="mt-3">
            <p>
              <strong>Fecha de reserva:</strong> {formData.fecha}
            </p>
            <p>
              <strong>Número de personas:</strong> {formData.numeroPersonas}
            </p>
          </div>

          <div className="mt-3">
            <p>
              <strong>Precio por persona:</strong>{" "}
              {plan?.costo_persona?.toLocaleString("es-CO", {
                style: "currency",
                currency: "COP",
                maximumFractionDigits: 0,
              })}
            </p>
            <p>
              <strong>Total:</strong>{" "}
              {(
                (plan?.costo_persona || 0) *
                parseInt(formData.numeroPersonas || 0)
              ).toLocaleString("es-CO", {
                style: "currency",
                currency: "COP",
                maximumFractionDigits: 0,
              })}
            </p>
            <p>Método de pago: Tarjeta de crédito</p>
          </div>
        </div>
      </Modal>
    </>
  );
}
