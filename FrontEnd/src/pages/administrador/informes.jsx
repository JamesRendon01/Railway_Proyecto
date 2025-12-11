import React, { useEffect, useState } from "react";
import axios from "axios";
import CrudTable from "../../components/tablaAdmin";
import NavDashAdmin from "../../components/navDashAdmin.jsx";
import SearchBar from "../../components/search.jsx";
import BarraCarga from "../../components/barraCarga.jsx";
import Contador from "../../components/contador.jsx";

export default function Informes() {
  const [informes, setInformes] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 5;

  // 🔹 Cargar informes y totales de turistas (nuevo endpoint)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // ✅ Se obtienen informes y estadísticas de turistas
        const [resInformes, resDashboard] = await Promise.all([
          axios.get("http://localhost:8000/informe/listarInformes"),
          axios.get("http://localhost:8000/dashboard/dashboardListarnformes"),
        ]);

        setInformes(resInformes.data);
        setResumen(resDashboard.data);
      } catch (err) {
        console.error("Error al cargar datos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔹 Filtrar informes por nombre (sin id)
  const informesFiltrados = informes.filter((inf) =>
    inf.nombre.toLowerCase().includes(query.toLowerCase())
  );

  // 🔹 Encabezados (sin IDs, muestra nombre del admin)
  const headers = [
    { key: "nombre", label: "Nombre del Informe" },
    {
      key: "fecha_creacion",
      label: "Fecha de Creación",
      render: (fecha) => new Date(fecha).toLocaleDateString(),
    },
    { key: "administrador", label: "Administrador" },
  ];

  // 🔹 Acciones personalizadas
  const renderActions = (item) => (
    <div className="flex gap-2 justify-center">
      <button
        onClick={() =>
          window.open(`http://localhost:8000/${item.ruta_pdf}`, "_blank")
        }
        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
      >
        Ver PDF
      </button>
      <button
        onClick={() => handleDelete(item.id)}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
      >
        Eliminar
      </button>
    </div>
  );

  // 🔹 Eliminar informe
  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este informe?")) {
      try {
        await axios.delete(`http://localhost:8000/informe/${id}`);
        setInformes(informes.filter((inf) => inf.id !== id));
      } catch (error) {
        console.error("Error al eliminar informe:", error);
      }
    }
  };

  // 🔹 Mostrar loader mientras carga
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <BarraCarga />
        <p className="text-gray-700 text-lg font-semibold animate-pulse">
          Cargando informes...
        </p>
      </div>
    );

  // 🔹 Datos para el componente Contador (usando totales de turistas)
  const itemsContador = resumen
    ? [
        { titulo: "Total de Informes", valor: resumen.total_informes },
        { titulo: "Informes Hoy", valor: resumen.informes_hoy },
      ]
    : [];

  // 🔹 Vista principal
  return (
    <div className="flex min-h-screen">
      <aside className="w-64">
        <NavDashAdmin />
      </aside>

      <main className="flex-1 p-6">
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-4xl font-semibold">Informes</h1>
          <SearchBar query={query} setQuery={setQuery} />
        </header>

        <section>
          <Contador items={itemsContador} />
        </section>

        <hr className="border-t-2 border-black my-6 w-full" />

        {/* 🔹 Tabla con datos filtrados */}
        <CrudTable
          headers={headers}
          data={informesFiltrados}
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={informesFiltrados.length}
          onPageChange={setCurrentPage}
          renderActions={renderActions}
        />
      </main>
    </div>
  );
}
