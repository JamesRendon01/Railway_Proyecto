import { useState } from "react";
import { useNavigate } from "react-router-dom"; 

// Componente para ingresar el correo electrónico para recuperar la contraseña
export default function IngresarCorreo() {

  const [correo, setCorreo] = useState("");
  const [confirmarCorreo, setConfirmarCorreo] = useState("");
  const navigate = useNavigate();

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que los correos coincidan
    if (correo !== confirmarCorreo) {
      alert("Los correos no coinciden ❌");
      return;
    }

    // Conexion y envio de datos del correo al backend
    try {
      const res = await fetch("http://localhost:8000/turista/solicitar-recuperacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });

      const result = await res.json();

      // Si el envío del correo es exitoso, redirige al Turista a la página de ingresar PIN
      if (res.ok) {
        alert("Se ha enviado un PIN a tu correo ✅");
        localStorage.setItem("correoRecuperacion", correo);
        navigate("/ingresar_pin");
      } else {
        // Si hay un error en el envío del correo, muestra un mensaje de error
        alert("Error: " + (result.detail || "No se pudo enviar el correo"));
      }
    } catch (error) {
      // Si hay algún tipo de error de conexión, muestra un mensaje de error
      console.error("Error de conexión:", error);
      alert("No se pudo conectar al servidor ❌");
    }
  };

  // Renderizado del formulario para ingresar el correo
  return (
    <div className="w-screen min-h-screen bg-fondo flex flex-col items-center">
      {/* Header */}
      <header className="w-full flex flex-col items-center py-4 relative">
        {/* Estilos para las imagenes de la empresa */}
        {/* Logo de la empresa */}
        <img
          className="w-52 h-28 mt-2 absolute left-155 top-0"
          src="/img/logo.png"
          alt="logo"
        />

        {/* Imagenes decorativas */}
        {/* Esquinas*/}
        <img src="/img/esquina_sup_derecha.png" alt="" className=" z-13 w-40 h-40  absolute left-215 top-107" />
        <img src="/img/esquina_sup_izquierda.png" alt="" className=" z-13 w-40 h-40  absolute left-97 top-35" />

        {/* Contenedor del titulo */}
        <div className="w-80 md:w-130 h-25 bg-fondo border-2 border-black p-6 [border-radius:20px] text-white absolute right-130 top-46 z-12">
          {/* Titulo de la pagina */}
            <h1 className="font-serif text-5xl text-black text-center ">
              Recuperar contraseña
            </h1>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-col md:flex-row items-center mt-10 space-y-8 md:space-y-0 md:space-x-8">
        {/*Divisor del formulario */}
        <div className="w-80 md:w-128 h-80 bg-nav border-2 border-black p-6 [border-radius:30px] text-black text-lg font-bold absolute right-123 top-56 z-10">
          {/* Formulario para ingresar el correo */}
          <form className="flex flex-col" onSubmit={handleSubmit}>
            {/* Campo de correo */}
            <label className="mt-12">Correo:</label>
            <input
              type="email"
              name="correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              className="w-full p-2 rounded-md text-black mt-2 bg-gray-200"
            />

            {/* Campo para confirmar el correo */}
            <label className="mt-4">Confirmar Correo:</label>
            <input
              type="email"
              name="confirmarCorreo"
              value={confirmarCorreo}
              onChange={(e) => setConfirmarCorreo(e.target.value)}
              required
              className="w-full p-2 rounded-md text-black mt-2 bg-gray-200"
            />

            {/* Botón para enviar el formulario */}
            <button
              type="submit"
              className=" w-30 bg-fondo text-black py-2 rounded-full mt-4 hover:bg-white font-playfair border-2 border-black absolute left-50 top-60"
            >
              Continuar
            </button>
          </form>
        </div>

        {/* Contenedor*/}
        <div className="w-80 md:w-156 h-115 bg-white border-4 border-black p-6 [border-radius:30px] flex flex-col items-center absolute left-100 top-33">
        </div>
      </main>
    </div>
  );
}
