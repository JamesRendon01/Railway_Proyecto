import { useState, useEffect } from "react";
import ButtonDeleteTurista from "./button_delet_turista.jsx";
import { message } from "antd";

export default function ActualizarTurista() {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    celular: "",
    fecha_nacimiento: "",
    ciudad_residencia_id: 1, // ID por defecto, cambia según tu ciudad
    tipo_identificacion: "",
    identificacion: "",
    direccion: ""
  });

  const [loading, setLoading] = useState(true);
  const [turistaId, setTuristaId] = useState(null);

  // Función para decodificar el token manualmente
  function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("No estás logueado");
      setLoading(false);
      return;
    }

    const decoded = parseJwt(token);
    if (!decoded || !decoded.sub) {
      message.error("Token inválido");
      setLoading(false);
      return;
    }

    setTuristaId(Number(decoded.sub));

    // Traer datos actuales del usuario
    fetch("http://localhost:8000/turista/perfil/mis-datos", {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` },
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
          fecha_nacimiento: data.fecha_nacimiento || "",
          ciudad_residencia_id: data.ciudad_residencia_id || 1, // Ajusta si tu backend devuelve id
          tipo_identificacion: data.tipo_identificacion || "",
          identificacion: data.identificacion || "",
          direccion: data.direccion || ""
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!turistaId) {
      message.error("No se pudo obtener el ID del turista");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      message.error("No estás logueado");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/turista/${turistaId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        message.error("Error: " + JSON.stringify(errorData));
        return;
      }

      const result = await response.json();
      alert(result.mensaje);
    } catch (error) {
      console.error(error);
      message.error("Error al actualizar los datos");
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="p-6 justify-center items-center min-h-screen">
      <div className="w-96 h-80 bg-white border-black border-2 rounded-2xl">
        <img
          src="/img/imagen.png"
          alt="perfil"
          className="w-30 rounded-full border-2 ml-30 border-black object-cover bg-fondo sm:mt-0 sm:h-25 sm:w-25 md:mt-5 xl:w-40 xl:h-40"
        />
        <div className="flex mt-5 gap-10 justify-center">
          <ButtonDeleteTurista />
        </div>
      </div>

      <form className="bg-white shadow-lg rounded-xl p-6 w-96" onSubmit={handleSubmit}>
        {/* Nombre */}
        <label className="block mb-2 font-medium">Nombre</label>
        <input
          type="text"
          name="nombre"
          className="w-full border px-3 py-2 rounded mb-4"
          required
          value={formData.nombre}
          onChange={handleChange}
        />

        {/* Correo */}
        <label className="block mb-2 font-medium">Correo</label>
        <input
          type="email"
          name="correo"
          className="w-full border px-3 py-2 rounded mb-4"
          required
          value={formData.correo}
          onChange={handleChange}
        />

        {/* Celular */}
        <label className="block mb-2 font-medium">Celular</label>
        <input
          type="number"
          name="celular"
          className="w-full border px-3 py-2 rounded mb-4"
          value={formData.celular}
          onChange={handleChange}
        />

        {/* Fecha Nacimiento */}
        <label className="block mb-2 font-medium">Fecha Nacimiento</label>
        <input
          type="date"
          name="fecha_nacimiento"
          className="w-full border px-3 py-2 rounded mb-4"
          required
          value={formData.fecha_nacimiento}
          onChange={handleChange}
        />

        {/* Ciudad */}
        <label className="block mb-2 font-medium">Ciudad</label>
        <input
          type="text"
          name="ciudad"
          className="w-full border px-3 py-2 rounded mb-4"
          required
          value={formData.ciudad}
          onChange={handleChange}
        />

        {/* Tipo identificación */}
        <label className="block mb-2 font-medium">Tipo identificacion</label>
        <input
          type="text"
          name="tipo_identificacion"
          className="w-full border px-3 py-2 rounded mb-4"
          required
          value={formData.tipo_identificacion}
          onChange={handleChange}
        />

        {/* Identificacion */}
        <label className="block mb-2 font-medium">Identificacion</label>
        <input
          type="number"
          name="identificacion"
          className="w-full border px-3 py-2 rounded mb-4"
          required
          value={formData.identificacion}
          onChange={handleChange}
        />

        {/* Direccion */}
        <label className="block mb-2 font-medium">Direccion</label>
        <input
          type="text"
          name="direccion"
          className="w-full border px-3 py-2 rounded mb-4"
          required
          value={formData.direccion}
          onChange={handleChange}
        />

        {/* Botón */}
        <button className="bg-fondo absolute top-102 left-165 w-40 text-black px-4 py-2 rounded hover:bg-green-600 border-2 border-black">
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
