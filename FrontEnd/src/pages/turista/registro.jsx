import { unstableSetRender } from 'antd';
import { message } from "antd";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { Eye, EyeOff } from 'lucide-react'; // 👁️ Importa los íconos
import TermsModal from '../../components/terminos_condiciones';

unstableSetRender((node, container) => {
  container._reactRoot ||= createRoot(container);
  const root = container._reactRoot;
  root.render(node);
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    root.unmount();
  };
});

export default function Registro() {
  const [messageApi, contextHolder] = message.useMessage();

  const [formData, setFormData] = useState({
    correo: "",
    nombre: "",
    fecha_nacimiento: "",
    tipo_identificacion: "",
    identificacion: "",
    contrasena: "",
    confirmar_contrasena: "",
    ciudad_residencia_id: "",
    celular: "",
    direccion: "",
  });

  const [ciudades, setCiudades] = useState([]);
  const [showTerms, setShowTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Estados para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Cargar ciudades al montar
  useEffect(() => {
    fetch("preyecto2-production.up.railway.app/ciudad/listar_ciudades")
      .then(res => res.json())
      .then(data => setCiudades(data))
      .catch(err => console.error("Error cargando ciudades:", err));
  }, []);

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones previas
    if (!acceptedTerms) {
      messageApi.warning("Debes aceptar los términos y condiciones ⚠️");
      return;
    }

    if (formData.contrasena !== formData.confirmar_contrasena) {
      messageApi.error("Las contraseñas no coinciden ❌");
      return;
    }

    if (!formData.ciudad_residencia_id) {
      messageApi.warning("Debes seleccionar una ciudad 🏙️");
      return;
    }

    // Eliminar campo de confirmación y construir objeto para enviar
    const { confirmar_contrasena, ...rest } = formData;

    const dataToSend = {
      ...rest,
      ciudad_residencia_id: parseInt(formData.ciudad_residencia_id, 10),
      acepto_terminos: acceptedTerms
    };

    try {
      const res = await fetch("preyecto2-production.up.railway.app/turista/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const result = await res.json();

      if (res.ok) {
        messageApi.success("Registro exitoso ✅");
        setTimeout(() => window.location.href = "/turista", 1000);
      } else {
        if (typeof result.detail === "object") {
          const errores = Array.isArray(result.detail) ? result.detail : [result.detail];
          errores.forEach(err => {
            messageApi.error(`${err.campo ? err.campo + ": " : ""}${err.mensaje}`);
          });
        } else {
          messageApi.error(result.detail || "No se pudo registrar ❌");
        }
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      messageApi.error("No se pudo conectar al servidor ❌");
    }
  };

  return (
    <div className="min-h-screen w-full bg-fondo flex flex-col">
      {contextHolder}

      {/* Header */}
      <header className="w-full flex py-4 relative">
        <div className="flex">
          <img className="w-38 h-18 mt-2 sm:w-20 sm:h-12 sm:mt-0 md:w-28 md:h-18 xl:w-40 xl:h-20" src="/img/logo.png" alt="logo" />
          <img className="w-38 h-18 mt-2 sm:w-20 sm:h-12 sm:mt-0 md:w-28 md:h-18 xl:w-40 xl:h-20" src="/img/avion.gif" alt="logo" />
          <h1 className="flex text-6xl text-black font-bold font-title sm:text-4xl md:text-5xl lg:ml-30 xl:text-6xl xl:ml-55">
            REGISTRARSE
          </h1>
        </div>
      </header>

      {/* Formulario */}
      <main className="flex flex-col md:flex-row">
        <div className="w-125 h-auto bg-nav border-4 border-black p-6 rounded-lg text-black sm:w-100 sm:ml-10 md:ml-50 lg:ml-80 xl:ml-130 xl:w-120">
          <form className="flex flex-col font-general" onSubmit={handleSubmit}>
            <label className="mt-4">*Correo:</label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              required
              className="w-full p-1 rounded-md text-black mt-2 bg-gray-200"
            />

            <label className="mt-4">*Nombre Completo:</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full p-1 rounded-md text-black mt-2 bg-gray-200"
            />

            <label className="mt-4">*Fecha de nacimiento:</label>
            <input
              type="date"
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleChange}
              required
              className="w-full p-1 rounded-md text-black mt-2 bg-gray-200"
            />

            <label className="mt-4">*Tipo de identificación:</label>
            <select
              name="tipo_identificacion"
              value={formData.tipo_identificacion}
              onChange={handleChange}
              required
              className="w-full p-1 rounded-md text-black mt-2 bg-gray-200"
            >
              <option value="">Seleccione un tipo de documento</option>
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="TI">Tarjeta de Identidad</option>
              <option value="PP">Pasaporte</option>
              <option value="PPT">Permiso por Protección Temporal</option>
            </select>

            <label className="mt-4">*Identificación:</label>
            <input
              type="number"
              name="identificacion"
              value={formData.identificacion}
              onChange={handleChange}
              required
              className="w-full p-1 rounded-md text-black mt-2 bg-gray-200"
            />

            {/* Contraseña */}
            <label className="mt-4">*Contraseña:</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="contrasena"
                value={formData.contrasena}
                onChange={handleChange}
                required
                className="w-full p-1 pr-10 rounded-md text-black mt-2 bg-gray-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Confirmar Contraseña */}
            <label className="mt-4">*Confirmar contraseña:</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmar_contrasena"
                value={formData.confirmar_contrasena}
                onChange={handleChange}
                required
                className="w-full p-1 pr-10 rounded-md text-black mt-2 bg-gray-200"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Ciudad */}
            <label className="mt-4">*Ciudad de residencia:</label>
            <select
              name="ciudad_residencia_id"
              value={formData.ciudad_residencia_id}
              onChange={handleChange}
              required
              className="w-full p-1 rounded-md text-black mt-2 bg-gray-200"
            >
              <option value="">Seleccione una ciudad</option>
              {ciudades.map(ciudad => (
                <option key={ciudad.id} value={ciudad.id}>
                  {ciudad.nombre}
                </option>
              ))}
            </select>

            <label className="mt-4">*Número de celular:</label>
            <input
              type="number"
              name="celular"
              value={formData.celular}
              onChange={handleChange}
              required
              className="w-full p-1 rounded-md text-black mt-2 bg-gray-200"
            />

            <label className="mt-4">*Dirección:</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              required
              className="w-full p-1 rounded-md text-black mt-2 bg-gray-200"
            />

            {/* Link login */}
            <p className="text-center mt-2 text-sm">
              <Link to="/turista" className="underline text-black">
                ¿Ya tienes cuenta? Inicia sesión
              </Link>
            </p>

            {/* Checkbox de Términos */}
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mr-2"
              />
              <span>
                Acepto los{" "}
                <button
                  type="button"
                  className="text-blue-600 underline"
                  onClick={() => setShowTerms(true)}
                >
                  términos y condiciones
                </button>
              </span>
            </div>

            {/* Botón */}
            <button
              type="submit"
              className="bg-fondo text-black font-bold px-4 py-2 rounded-md mt-4 hover:bg-white"
            >
              Registrarme
            </button>
          </form>
        </div>
      </main>

      {/* Modal de términos */}
      <TermsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={() => setAcceptedTerms(true)}
      />
    </div>
  );
}
