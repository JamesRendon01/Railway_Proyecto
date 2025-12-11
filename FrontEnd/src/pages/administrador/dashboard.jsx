import { useEffect, useState } from "react";
import axios from "axios";
import NavDashAdmin from "../../components/navDashAdmin.jsx";
import Contador from "../../components/contador.jsx";
import BarraCarga from "../../components/barraCarga.jsx"; // ✅ Importamos la barra de carga
import GraficoReservasPorPlan from "../../components/graficaPorcentuada.jsx";
import { jwtDecode } from "jwt-decode";

export default function DashbordAdmin() {
  const [totales, setTotales] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState("Administrador");
  const [rol, setRol] = useState("Admin");

  useEffect(() => {
      try {
        const token = localStorage.getItem("token_admin");
        if (token) {
          const decoded = jwtDecode(token);
          setNombre(decoded.nombre || "Admin");
          setRol(decoded.rol || "Admin");
        } else {
          setNombre(localStorage.getItem("nombre_admin") || "Admin");
          setRol(localStorage.getItem("rol_admin") || "Administrador del sistema");
        }
      } catch (error) {
        console.error("Error al decodificar el token:", error);
      }
    }, []);

  useEffect(() => {
    axios
      .get("http://localhost:8000/dashboard/totales")
      .then((res) => setTotales(res.data))
      .catch((err) => console.error("Error al cargar totales:", err))
      .finally(() => setLoading(false));
  }, []);

  // ✅ Mostrar animación de carga mientras se obtiene la data
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <BarraCarga size={80} color="primary" />
        <p className="text-gray-700 text-lg font-semibold">
          Cargando información del dashboard...
        </p>
      </div>
    );

  if (!totales)
    return (
      <p className="text-center text-red-500">
        Error al cargar los datos del dashboard
      </p>
    );

  // 🔹 Datos de los contadores
  const items = [
    { titulo: "Total Reservas", valor: totales.total_reservas },
    { titulo: "Total Turistas", valor: totales.total_turistas },
    { titulo: "Total Planes", valor: totales.total_planes },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64">
        <NavDashAdmin />
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-6">
        <header className="mb-6 flex justify-center items-center">
          <h1 className="text-4xl font-semibold">Bienvenido {rol} {nombre}</h1>
        </header>

        <section>
          {/* Contadores */}
          <Contador items={items} />

          <hr className="border-t-2 border-black my-6 w-full" />
          {/* Gráfica de reservas por plan */}
          <GraficoReservasPorPlan />
        </section>
      </main>
    </div>
  );
}
