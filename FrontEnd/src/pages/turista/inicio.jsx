// pages/HomePage.jsx
import { useState, useEffect } from "react";
import PlanesCarousel from "../../components/Carousel.jsx";
import CardComponent from "../../components/card.jsx";
import Nav from "../../components/nav.jsx";
import { useFavoritosStore } from "../../storage/favoritos_storage.js";
import Footer from "../../components/footer.jsx";
import Paginacion from "../../components/paginacion.jsx";

const USER_ID = 1;

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);

  // 👉 Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8; // 👈 ahora 8 cards por página

  const { cargarFavoritos } = useFavoritosStore();

  // Cargar planes desde API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch("http://localhost:8000/plan/card_planes");
        const data = await res.json();
        setPlans(data);
        setFilteredPlans(data);
      } catch (error) {
        console.error("Error cargando planes:", error);
      }
    };
    fetchPlans();
    cargarFavoritos(USER_ID);
  }, []);

  // Filtrado en tiempo real
  useEffect(() => {
    if (query.trim() === "") {
      setFilteredPlans(plans);
    } else {
      const lowerQuery = query.toLowerCase();
      const filtered = plans.filter(
        (plan) =>
          plan.nombre.toLowerCase().includes(lowerQuery) ||
          plan.descripcion.toLowerCase().includes(lowerQuery)
      );
      setFilteredPlans(filtered);
    }
    setCurrentPage(1); // 👈 reinicia a la primera página al filtrar
  }, [query, plans]);

  // Calcular datos paginados
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPlans = filteredPlans.slice(startIndex, startIndex + pageSize);

  return (
    <div>
      {/* Navbar */}
      <Nav query={query} setQuery={setQuery} showFilter={true} showNavbar={true} />

      <div className="h-24" />

      <div>
        {/* Carrusel */}
        <PlanesCarousel />
      </div>

      {/* Cards paginadas en grid */}
      <div className="px-6 mt-30">
        {paginatedPlans.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {paginatedPlans.map((plan) => (
              <CardComponent
                key={plan.id}
                showButton
                userId={USER_ID}
                plans={[plan]} // 👈 le pasamos un solo plan
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-700">No se encontraron resultados</p>
        )}
      </div>

      {/* Paginación */}
      <Paginacion
        current={currentPage}
        total={filteredPlans.length}
        pageSize={pageSize}
        onChange={setCurrentPage}
      />

      {/* Footer */}
      <footer>
        <Footer />
      </footer>
    </div>
  );
}
