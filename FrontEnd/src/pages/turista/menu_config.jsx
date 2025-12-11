import { useState, useEffect } from "react";
import Nav from "../../components/nav.jsx";
import Footer from "../../components/footer.jsx";
import ActualizarTurista from "../../components/config_perfil.jsx";
import BreadcrumbNav from "../../components/breadcrumb.jsx";
import { useBreadcrumb } from "../../context/breadcrumb_context.jsx";

export default function MenuConfig() {
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
    <div>
      <Nav
        query={query}
        setQuery={setQuery}
        results={results}
        hasSearched={hasSearched}
        handleSearch={handleSearch}
        showFilter={false}
        showTitle={false}
        showProfile={false}
        showNavbar={true}
        showSearch={false}
        showButtonsLogin={false}
        showConfig={true}
      />
      <div className="border-1 border-black mt-24 h-8 flex items-center bg-nav/30">
        <BreadcrumbNav />
      </div>

      <div className="flex mt-30 gap-10 items-center justify-center">
        <div>
          <ActualizarTurista />
        </div>
      </div>

      <footer>
        <Footer />
      </footer>
    </div>
  );
}
