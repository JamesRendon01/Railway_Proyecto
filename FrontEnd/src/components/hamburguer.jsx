import React, { useState, useEffect } 
from "react"; import { jwtDecode } from "jwt-decode";

// 🔹 Subcomponente del menú hamburguesa
const HamburgerMenu = ({ links, nombre }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Icono hamburguesa */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isOpen}
        className="flex flex-col justify-between w-8 h-6 focus:outline-none"
      >
        <span className={`block h-0.5 bg-black transition-transform duration-300 ${isOpen ? "rotate-40 translate-y-3" : ""}`} />
        <span className={`block h-0.5 bg-black transition-opacity duration-300 ${isOpen ? "opacity-0" : ""}`} />
        <span className={`block h-0.5 bg-black transition-transform duration-300 ${isOpen ? "-rotate-40 -translate-y-2.5" : ""}`} />
      </button>

      {/* Menú desplegable */}
      <div className={`absolute top-full right-0 mt-3 bg-black/70 shadow-md rounded-xl flex-col min-w-[12rem] transition-all duration-300 w-55 ${isOpen ? "flex" : "hidden"}`}>
        {/* Nombre arriba */}
        {nombre && (
          <div className="px-4 py-3 border-b border-gray-500 text-white font-bold text-lg text-center">
            <div>{nombre}</div>
            <div className="text-sm font-normal mt-1">{"Turista"}</div>
          </div>
        )}

        {/* Links dinámicos */}
        {links.map(({ href, label, onClick, icon: Icon }, index) => (
  <a
    key={`${href}-${index}`}
    href={href}
    onClick={(e) => {
      if (onClick) {
        e.preventDefault();
        onClick();
      }
      setIsOpen(false);
    }}
    className="px-4 py-2 hover:bg-white hover:text-black hover:border-black hover:border-2 hover:rounded-xl text-white text-lg font-medium text-center flex gap-10"
  >
    {Icon && <Icon size={30} className="color-white hover:color-black" />}
    {label}
  </a>
))}

      </div>
    </div>
  );
};

// 🔹 Navbar principal
const Hamburguer = ({ links = [], rol }) => {
  const [nombre, setNombre] = useState(null);

  useEffect(() => {
    try {
       if (rol === "turista") {
        const tokenTurista = localStorage.getItem("token");
        if (tokenTurista) {
          const decoded = jwtDecode(tokenTurista);
          setNombre(decoded.nombre || "Turista");
        }
      }
    } catch (error) {
      console.error("Error decodificando token:", error);
      setNombre(null);
    }
  }, [rol]);

  return (
    <nav className="flex justify-end items-center py-6 px-4 text-black relative z-50 bg-nav">
      <HamburgerMenu links={links} nombre={nombre} rol={rol} />
    </nav>
  );
};

export default Hamburguer;
