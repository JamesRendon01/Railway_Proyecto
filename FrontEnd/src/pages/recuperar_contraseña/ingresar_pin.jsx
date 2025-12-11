import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Componente para ingresar el PIN recibido por correo
export default function IngresarPin() {
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const navigate = useNavigate();

  const inputsRef = useRef([]);

  const handleChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newPin = [...pin];
      newPin[index] = value || "";
      setPin(newPin);

      // Mover al siguiente input si hay valor
      if (value && index < pin.length - 1) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    // Volver al input anterior si Backspace y está vacío
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const codigo = pin.join("");
    const correo = localStorage.getItem("correoRecuperacion");

    //Conexion y envio de datos del form al backend
    try {
      const res = await fetch("http://localhost:8000/turista/verificar-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, pin: codigo }),
      });

      const result = await res.json();

      //Si el PIN es correcto, redirige al turista a la pagina de nueva contraseña
      if (res.ok) {
        alert("PIN correcto ✅");
        localStorage.setItem("tokenRecuperacion", result.token);
        navigate("/nueva_contrasena");
      } else {
        //Si el PIN es incorrecto, envia un mensaje de error
        alert(result.detail || "PIN inválido ❌");
      }
    } catch (error) {
      //si hay algun tipo de error de conexion, muestra un mensaje de error
      console.error("Error de conexión:", error);
      alert("No se pudo conectar al servidor ❌");
    }
  };

  // Renderizado del formulario para ingresar el PIN
  return (
    <div className="w-screen min-h-screen bg-fondo flex flex-col items-center">
      {/* Header */}
      <header className="w-full flex flex-col items-center py-4 relative">
        {/* Estilos para las imagenes de la empresa */}
        {/* Logo de la empresa */}
        <img className="w-52 h-28 mt-2 absolute left-155 top-0" src="/img/logo.png" alt="logo" />
        {/* Imagenes decorativas */}
        {/* Esquinas*/}
        <img src="/img/esquina_sup_derecha.png" alt="" className="z-13 w-40 h-40 absolute left-215 top-107" />
        <img src="/img/esquina_sup_izquierda.png" alt="" className="z-13 w-40 h-40 absolute left-97 top-35" />
        {/* Candados */}
        <img src="/img/Candado.png" alt="" className="z-13 w-20 h-20 absolute left-198 top-75"/>
        <img src="/img/Candado.png" alt="" className="z-13 w-20 h-20 absolute left-140 top-75 "/>
        {/* Contenedor del titulo */}
        <div className="w-80 md:w-130 h-25 bg-fondo border-2 border-black p-6 [border-radius:20px] text-white absolute right-130 top-46 z-12">
          {/* Titulo de la pagina */}
          <h1 className="font-serif font-bold text-2xl text-black text-center absolute top-4">
            Te enviamos un correo electrónico con un PIN, por favor ingrésalo
          </h1>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-col md:flex-row items-center mt-10 space-y-8 md:space-y-0 md:space-x-8">
        {/*Divisor del Formulario */}
        <div className="w-80 md:w-128 h-80 bg-nav border-2 border-black p-6 [border-radius:30px] text-white absolute right-123 top-56 z-10">
          {/* Formulario para ingresar el PIN */}
          <form className="flex flex-col items-center" onSubmit={handleSubmit}>
            <h1 className="text-6xl font-bold text-black mb-4 absolute top-20 left-52">PIN</h1>

            {/* Input de PIN */}
            <div className="flex gap-3 mb-6">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  inputMode="numeric"
                  className="w-17 h-19 text-center text-5xl text-black bg-gray-200 border rounded-md mt-35"
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  ref={(el) => (inputsRef.current[index] = el)} // guardar ref
                  required
                />
              ))}
            </div>

            {/* Botón para enviar el formulario */}
            <button
              type="submit"
              className="w-30 bg-fondo text-black font-serif font-bold py-2 rounded-full mt-4 hover:bg-white border-2 border-black absolute left-50 top-60"
            >
              Continuar
            </button>
          </form>
        </div>

        {/* Contenedor*/}
        <div className="w-80 md:w-156 h-115 bg-white border-4 border-black p-6 [border-radius:30px] flex flex-col items-center absolute left-100 top-33">
          <div></div>
        </div>
      </main>
    </div>
  );
}