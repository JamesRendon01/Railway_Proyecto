import { Link } from "react-router-dom";

export default function Sidebar({ rol }) {
  //Configuración dinámica del botón
  const toggleLink =
    rol === "turista"
      ? { to: "/admin", label: "Admin" }
      : rol === "admin"
      ? { to: "/turista", label: "Turista" }
      : null;

  return (
    //Divisor principal
    <div
      className={`w-80 relative bg-white border-3 border-black p-6 rounded-md flex flex-col items-center z-0 sm:w-85 sm:mt-0 md:w-70 md:h-70 xl:w-90 xl:h-80
      ${rol === "turista" ? "sm:ml-20 md:ml-20 md:mt-7 lg:ml-55 xl:ml-90 xl:mt-12" : ""}
      ${rol === "admin" ? " absolute sm:ml-13 md:ml-105 md:mt-7 lg:ml-140 xl:ml-190 xl:mt-12" : ""}`}
    >
      {/* Imagen de perfil */}
      <img
        src="/img/imagen.png"
        alt="Foto de perfil"
        className="w-30 rounded-full border-2 border-black object-cover bg-fondo sm:mt-0 sm:h-25 sm:w-25 md:mt-5 xl:w-40 xl:h-40"
      />

      {/* Botón Cambio de rol "Turista" y "Administrador " */}
      {toggleLink && (
        <Link
          to={toggleLink.to}
          className="w-48 h-16 mt-6 font-bold bg-fondo border-2 border-black rounded-2xl text-black text-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          {toggleLink.label}
        </Link>
      )}
    </div>
  );
}
