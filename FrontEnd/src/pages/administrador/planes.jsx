import { useEffect, useState } from "react";
import axios from "axios";
import NavDashAdmin from "../../components/navDashAdmin.jsx";
import CrudTable from "../../components/tablaAdmin.jsx";
import Contador from "../../components/contador.jsx";
import ButtonUpdate from "../../components/button_update.jsx";
import ButtonDelete from "../../components/button_eliminar.jsx";
import SearchBar from "../../components/search.jsx";
import { message } from "antd";
import BarraCarga from "../../components/barraCarga.jsx";

export default function ListarPlanesAdmin() {
  const [totales, setTotales] = useState(null);
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");
  const pageSize = 5;

  // 🔹 Cargar totales
  useEffect(() => {
    axios
      .get("http://localhost:8000/dashboard/total_planes")
      .then((res) => setTotales(res.data))
      .catch((err) => console.error("Error al cargar totales:", err));
  }, []);

  // 🔹 Cargar planes
  useEffect(() => {
    axios
      .get("http://localhost:8000/plan/listar-planes")
      .then((res) => setPlanes(res.data))
      .catch((err) => console.error("Error al obtener los planes:", err))
      .finally(() => setLoading(false));
  }, []);

  // 🔹 Eliminar plan
  const handleDeletePlan = async (planId) => {
    try {
      const res = await fetch(`http://localhost:8000/plan/delet/${planId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        message.success("✅ Plan eliminado correctamente");
        setPlanes((prev) => prev.filter((p) => p.id !== planId));
      } else {
        const error = await res.json();
        message.error("❌ Error: " + (error.detail || "desconocido"));
      }
    } catch (err) {
      message.error("❌ Error de conexión");
    }
  };

  // 🔍 Filtrar planes según búsqueda
  const filteredPlanes = planes.filter((plan) => {
    const search = query.toLowerCase();
    return (
      plan.nombre?.toLowerCase().includes(search) ||
      plan.descripcion?.toLowerCase().includes(search) ||
      plan.descripcion_corta?.toLowerCase().includes(search) ||
      plan.id_ciudad?.toString().includes(search) ||
      plan.ubicaciones?.join(", ").toLowerCase().includes(search)
    );
  });

  // 🔹 Mostrar loader mientras carga
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <BarraCarga /> {/* ✅ Loader visual */}
        <p className="text-gray-700 text-lg font-semibold">Cargando planes...</p>
      </div>
    );

  if (!totales)
    return <p className="text-center text-red-500">Error al cargar los datos</p>;

  // 🔹 Contadores
  const items = [
    { titulo: "Total Planes", valor: totales.total_planes },
    { titulo: "Planes Hoy", valor: totales.planes_hoy },
  ];

  // 🔹 Encabezados de tabla
  const headers = [
    { key: "nombre", label: "Nombre" },
    { key: "descripcion_corta", label: "Descripción Corta" },
    { key: "descripcion", label: "Descripción Larga" },
    { key: "costo_persona", label: "Precio" },
    { key: "id_ciudad", label: "Ciudad" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64">
        <NavDashAdmin />
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-6">
        {/* Navbar superior */}
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-4xl font-semibold">Planes</h1>
          <SearchBar query={query} setQuery={setQuery} />
        </header>

        <section>
          <Contador items={items} />
          <hr className="border-t-2 border-black my-6 w-full" />

          <CrudTable
            headers={headers}
            data={filteredPlanes}
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={filteredPlanes.length}
            onPageChange={setCurrentPage}
            onCreate={true}
            renderActions={(plan) => (

              <div className="flex justify-center gap-2">
                <ButtonUpdate id={plan.id} />
                <ButtonDelete
                  label="Eliminar Plan"
                  onConfirm={() => handleDeletePlan(plan.id)}
                />
              </div>
            )}
          />
        </section>
      </main>
    </div>
  );
}
