import { useState } from "react";
import Nav from "../../components/nav.jsx";
import Footer from "../../components/footer.jsx";
import CardReservas from "../../components/card_reservas.jsx";

export default function MisReservasPage() {
  const [query, setQuery] = useState("");

  return (
    <div>
      {/* Navbar con buscador activo */}
      <Nav
        query={query}
        setQuery={setQuery}
        showFilter={false}
        showTitle={false}
        showNavbar={true}
        showSearch={true}
        showButtonsLogin={false}
        showTitleMisReservas={true}
      />

      <div className="mt-28 mb-20 px-6">

        {/* 👇 Pasamos el query al componente que renderiza las tarjetas */}
        <CardReservas query={query} />
      </div >

      <Footer/>
    </div>
  );
}
