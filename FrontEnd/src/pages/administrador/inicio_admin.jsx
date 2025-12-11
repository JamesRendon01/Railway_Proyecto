import { useState } from "react";
import Header from "../../components/header.jsx";
import LoginForm from "../../components/login_form.jsx";
import Sidebar from "../../components/sidebar.jsx";
import { useNavigate } from "react-router-dom";
import { unstableSetRender } from 'antd';
import { message } from "antd";
import { jwtDecode } from "jwt-decode";

unstableSetRender((node, container) => {
  container._reactRoot ||= createRoot(container);
  const root = container._reactRoot;
  root.render(node);
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    root.unmount();
  };
});

// Componente de inicio de sesión para administradores
export default function InicioAdministrador() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    correo: "",
    contrasena: "",
  });

  // Manejo cambios de inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Manejo envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    //Conexion y envio de datos del form al backend
    try {
      const res = await fetch("http://localhost:8000/administrador/iniciarsesion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();

      //Si el inicio de sesion es exitoso, redirige al administrador a la pagina principal
      if (res.ok) {
        // Guarda el token en el local storage
        localStorage.setItem("token_admin", result.access_token);
        
        const decoded = jwtDecode(result.access_token)

        localStorage.setItem("nombre", decoded.nombre);

        message.success(`Bienvenido, ${decoded.nombre}`);

        navigate("/dashboard-administrador");
      } else {
        //Si los datos ingresados son incorrectos, envia un mensjae de error
        message.error(result.detail || "Credenciales inválidas");
      }
    } catch (error) {
      //si hay algun tipo de error de conexion, muestra un mensaje de error
      console.error("Error de conexión:", error);
      message.error("No se pudo conectar al servidor ❌");
    }
  };

  // Renderizado del formulario de inicio de sesión para el administrador
  return (
    <div className="w-screen min-h-screen">
      <div className="mt-5">
        <Header rol="admin" titulo="ADMINISTRADOR" />
      </div>
      <main>
        <LoginForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          rol="admin"
        />
        <Sidebar rol="admin" />
      </main>
    </div>
  );
}
