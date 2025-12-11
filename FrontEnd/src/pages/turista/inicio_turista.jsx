import { unstableSetRender } from 'antd';
import { createRoot } from 'react-dom/client';
import { useState } from "react";
import Header from "../../components/header.jsx";
import LoginForm from "../../components/login_form.jsx";
import Sidebar from "../../components/sidebar.jsx";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { jwtDecode } from "jwt-decode"; // 👈 Importar jwt-decode

// Render helper para antd
unstableSetRender((node, container) => {
  container._reactRoot ||= createRoot(container);
  const root = container._reactRoot;
  root.render(node);
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    root.unmount();
  };
});

export default function InicioTurista() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    correo: "",
    contrasena: "",
  });

  // Manejo de inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Manejo de submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/turista/iniciarsesion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        // 🔹 Guardar token en localStorage
        localStorage.setItem("token", result.access_token);

        // 🔹 Decodificar el token para obtener el nombre del turista
        const decoded = jwtDecode(result.access_token);

        // 🔹 Guardar el nombre en localStorage para usarlo en la Navbar
        localStorage.setItem("nombre", decoded.nombre);

        // Mensaje de bienvenida
        message.success(`Bienvenido, ${decoded.nombre}`);

        // Redirigir al inicio
        navigate("/inicio");
      } else {
        message.error(result.detail || "Credenciales inválidas");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      message.error("No se pudo conectar al servidor");
    }
  };

  return (
    <div className="w-screen min-h-screen flex flex-col bg-fondo">
      <div className="text-center mt-5">
        <Header rol="turista" titulo="INICIO TURISTA" />
      </div>
      <main>
        <LoginForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          rol="turista"
        />
        <Sidebar rol="turista" />
      </main>
    </div>
  );
}
