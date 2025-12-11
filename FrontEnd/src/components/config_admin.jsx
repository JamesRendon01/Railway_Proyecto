import { useState, useEffect } from "react";
import ButtonDeleteAdmin from "./button_delete_admin.jsx";
import { message } from "antd";

export default function ActualizarAdmin() {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    celular: "",
    tipo_identificacion: "",
    identificacion: "",
  });

  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState(null);

  // --- Función para decodificar token ---
  function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Error decodificando token:", e);
      return null;
    }
  }

  // --- Obtener datos del token y del backend ---
  useEffect(() => {
    const token_admin = localStorage.getItem("token_admin");
    if (!token_admin) {
      message.error("No estás logueado");
      setLoading(false);
      return;
    }

    const decoded = parseJwt(token_admin);
    if (!decoded || !decoded.sub) {
      message.error("Token inválido");
      setLoading(false);
      return;
    }

    // Guardamos el ID del administrador desde el token
    setAdminId(decoded.sub);

    // Llamada al backend para traer los datos del administrador
    fetch("http://localhost:8000/administrador/misDatosAdministrador", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token_admin}` ,
      },
    })


      .then(res => {
        if (!res.ok) throw new Error("Error obteniendo datos");
        return res.json();
      })
      .then(data => {
        setFormData({
          nombre: data.nombre || "",
          correo: data.correo || "",
          celular: data.celular || "",
          tipo_identificacion: data.tipo_identificacion || "",
          identificacion: data.identificacion || ""
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // --- Manejar cambios en inputs ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Guardar cambios ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!adminId) {
      message.error("No se pudo obtener el ID del administrador");
      return;
    }

    const token_admin = localStorage.getItem("token_admin");
    if (!token_admin) {
      message.error("No estás logueado");
      return;
    }

    const parsedData = {
      ...formData,
      celular: formData.celular?.toString() || null,
      identificacion: formData.identificacion?.toString() || null,
    };

    try {

      const response = await fetch(
        `http://localhost:8000/administrador/actualizar/${adminId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token_admin}`,
          },
          body: JSON.stringify(parsedData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error completo:", errorData);
        message.error(
          "Error: " + JSON.stringify(errorData.detail || errorData)
        );
        return;
      }

      const result = await response.json();
      message.success(result.mensaje);
    } catch (error) {
      console.error("Error en la actualización:", error);
      message.error("Error al actualizar los datos");
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="p-6 justify-center items-center min-h-screen">
      {/* Tarjeta de perfil */}
      <div className="w-96 h-80 bg-white border-black border-2 rounded-2xl flex flex-col items-center justify-center">
        <img
          src="/img/imagen.png"
          alt="perfil"
          className="w-32 h-32 rounded-full border-2 border-black object-cover bg-fondo"
        />
        <div className="flex mt-5 gap-10 justify-center">
          <ButtonDeleteAdmin />
        </div>
      </div>

      {/* Formulario */}
      <form
        className="bg-white shadow-lg rounded-xl p-6 w-96 mt-8"
        onSubmit={handleSubmit}
      >
        <label className="block mb-2 font-medium">Nombre</label>
        <input
          type="text"
          name="nombre"
          className="w-full border px-3 py-2 rounded mb-4"
          required
          value={formData.nombre}
          onChange={handleChange}
        />

        <label className="block mb-2 font-medium">Correo</label>
        <input
          type="email"
          name="correo"
          className="w-full border px-3 py-2 rounded mb-4"
          required
          value={formData.correo}
          onChange={handleChange}
        />

        <label className="block mb-2 font-medium">Celular</label>
        <input
          type="number"
          name="celular"
          className="w-full border px-3 py-2 rounded mb-4"
          value={formData.celular}
          onChange={handleChange}
        />

        <label className="block mb-2 font-medium">Tipo identificación</label>
        <input
          type="text"
          name="tipo_identificacion"
          className="w-full border px-3 py-2 rounded mb-4"
          required
          value={formData.tipo_identificacion}
          onChange={handleChange}
        />

        <label className="block mb-2 font-medium">Identificación</label>
        <input
          type="number"
          name="identificacion"
          className="w-full border px-3 py-2 rounded mb-4"
          required
          value={formData.identificacion}
          onChange={handleChange}
        />

        <button className="bg-fondo w-full text-black px-4 py-2 rounded hover:bg-green-600 border-2 border-black">
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
