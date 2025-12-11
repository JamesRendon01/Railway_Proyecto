import { useState, useEffect } from "react";
import Footer from "../../components/footer.jsx";
import ActualizarAdmin from "../../components/config_admin.jsx";
import { useBreadcrumb } from "../../context/breadcrumb_context.jsx";
import NavDashAdmin from "../../components/navDashAdmin.jsx";

export default function ConfigAdmin() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const { addBreadcrumb, resetBreadcrumb } = useBreadcrumb();

  // ✅ Evita el bucle infinito
  useEffect(() => {
    resetBreadcrumb();
    addBreadcrumb({ title: "Perfil", path: "/turista/editar/:id" });
  }, []); // ← Solo una vez al montar

  const handleSearch = () => {
    const filtered = favoritos.filter((item) =>
      item.nombre.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
    setHasSearched(true);
  };

  return (
    <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64">
            <NavDashAdmin />
        </aside>

      <div className="flex mt-30 gap-10 items-center justify-center">
        <div>
          <ActualizarAdmin />
        </div>
      </div>
    </div>
  );
}
