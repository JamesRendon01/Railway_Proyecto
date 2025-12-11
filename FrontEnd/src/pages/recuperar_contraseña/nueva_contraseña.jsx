import { useState } from "react";
import { useSearchParams } from "react-router-dom";

// Componente para restablecer la contraseña
export default function nuevaContrasena() {
  //
  const [searchParams] = useSearchParams();
  const token = localStorage.getItem("tokenRecuperacion"); // Captura el token de la URL

  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que las contraseñas coincidan
    if (password !== confirmarPassword) {
      alert("Las contraseñas no coinciden ❌");
      return;
    }

    // Validar que el token exista
    if (!token) {
      alert("Token inválido ❌");
      return;
  }
    // Conexion y envio de datos de la nueva contraseña al backend
    try {
      const res = await fetch("http://localhost:8000/turista/cambiar-contrasena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, nueva_contrasena: password, }),
      });

      const result = await res.json();

      // Si el cambio de contraseña es exitoso, redirige al Turista a la página de inicio de sesión
      if (res.ok) {
        alert("Contraseña restablecida con éxito ✅");
        window.location.href = "/turista";
      } else {
        // Si hay un error en el cambio de contraseña, muestra un mensaje de error
        alert("Error: " + (result.detail || "No se pudo cambiar la contraseña"));
      }
    } catch (error) {
      // Si hay algún tipo de error de conexión, muestra un mensaje de error
      console.error("Error de conexión:", error);
      alert("No se pudo conectar al servidor ❌");
    }
  };

  // Renderizado del formulario para restablecer la contraseña
  return (
    // Contenedor principal
    <div className="w-screen min-h-screen bg-fondo to-white flex flex-col items-center">
      <header className="w-full flex flex-col items-center py-4 relative">
        {/* Estilos para las imagenes de la empresa */}
        {/* Logo de la empresa */}
        <img className="w-52 h-28 mt-2 absolute left-155 top-0" src="/img/logo.png" alt="logo" />
        {/* Imagenes decorativas de las esquinas */}
        <img src="/img/esquina_sup_derecha.png" alt="" className=" z-13 w-40 h-40  absolute left-215 top-107" />
        <img src="/img/esquina_sup_izquierda.png" alt="" className=" z-13 w-40 h-40  absolute left-97 top-35" />

        {/* Contenedor del titulo */}
        <div className="w-80 md:w-130 h-25 bg-fondo border-2 border-black p-6 [border-radius:20px] text-white absolute right-130 top-46 z-12">
          {/* Titulo de la pagina */}
          <h1 className="font-serif text-5xl text-black text-center ">
            Nueva Contraseña
          </h1>
        </div>
      </header>

      {/*Main*/}
      <main className="flex flex-col md:flex-row items-center mt-10 space-y-8 md:space-y-0 md:space-x-8">
        {/* Divisor del Formulario */}
        <div className="w-80 md:w-128 h-80 bg-nav border-2 border-black p-6 [border-radius:30px] text-white absolute right-123 top-56 z-10">
          {/* Formulario para ingresar la nueva contraseña */}
          <form className="flex flex-col font-bold text-black text-lg" onSubmit={handleSubmit}>
            {/* Campo para la nueva contraseña */}
            <label className="mt-12">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 rounded-md text-black mt-2 bg-gray-200"
            />

            {/* Campo para confirmar la nueva contraseña */}
            <label className="mt-4">Confirmar Contraseña:</label>
            <input
              type="password"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
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

        <div className="w-80 md:w-156 h-115 bg-white border-4 border-[#5e637e] p-6 [border-radius:30px] flex flex-col items-center absolute left-100 top-33">
          <div></div>
        </div>
      </main>
    </div>
  );
}
