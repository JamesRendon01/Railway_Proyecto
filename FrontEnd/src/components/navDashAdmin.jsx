import { House, CalendarRange, Earth, Users, ChartLine, BookOpenText, LogOut, Cog } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export default function NavDashAdmin() {
  const [nombre, setNombre] = useState("Administrador");
  const [rol, setRol] = useState("Administrador del sistema");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      const token = localStorage.getItem("token_admin");
      if (token) {
        const decoded = jwtDecode(token);
        setNombre(decoded.nombre || "Administrador");
        setRol(decoded.rol || "Administrador");
      } else {
        setNombre(localStorage.getItem("nombre_admin") || "Administrador");
        setRol(localStorage.getItem("rol_admin") || "Administrador del sistema");
      }
    } catch (error) {
      console.error("Error al decodificar el token:", error);
    }
  }, []);

  const handleLogoutAdmin = () => {
    localStorage.removeItem("token_admin");
    localStorage.removeItem("nombre_admin");
    localStorage.removeItem("rol_admin");
    navigate("/admin");
  };


  const getLinkClass = (path) =>
    location.pathname === path
      ? "flex items-center gap-3 cursor-pointer bg-fondo text-blue-600 rounded-lg p-2 transition" // Activo
      : "flex items-center gap-3 cursor-pointer hover:text-blue-500 transition"; // Normal

  return (
    <nav className="fixed top-0 left-0 h-screen w-56 bg-nav p-6 flex flex-col justify-start gap-8 font-bold shadow-lg z-50">
      <img
        className="w-45 h-30"
        src="/img/logo.png"
        alt="logo"
      />

      <div className="border-b-2 pb-3 text-center">
        <h3 className="text-2xl font-bold">{nombre}</h3>
        <p className="text-sm">{rol}</p>
      </div>

      {/* Enlaces con sombreado dinámico */}
      <Link to="/dashboard-administrador">
        <div className={getLinkClass("/dashboard-administrador")}>
          <House />
          <span>Dashboard</span>
        </div>
      </Link>

      <Link to="/listar_reservas_admin">
        <div className={getLinkClass("/listar_reservas_admin")}>
          <CalendarRange />
          <span>Reservas</span>
        </div>
      </Link>

      <Link to="/listar_planes_admin">
        <div className={getLinkClass("/listar_planes_admin")}>
          <Earth />
          <span>Planes</span>
        </div>
      </Link>

      <Link to="/turistas">
        <div className={getLinkClass("/turistas")}>
          <Users />
          <span>Turistas</span>
        </div>
      </Link>

      <Link to="/listar_informes_admin">
        <div className={getLinkClass("/listar_informes_admin")}>
          <BookOpenText />
          <span>Informes</span>
        </div>
      </Link>

      <Link to="/estadisticas">
        <div className={getLinkClass("/estadisticas")}>
          <ChartLine />
          <span>Estadísticas</span>
        </div>
      </Link>

      <Link to="/configuracion">
        <div className={getLinkClass("/configuracion")}>
          <Cog />
          <span>Configuración</span>
        </div>
      </Link>

      <div
        className="flex items-center gap-3 hover:bg-red-100 text-red-500 rounded cursor-pointer transition p-2"
        onClick={handleLogoutAdmin}>
        <LogOut />
        <span>Cerrar sesión</span>
      </div>
    </nav>
  );
}
