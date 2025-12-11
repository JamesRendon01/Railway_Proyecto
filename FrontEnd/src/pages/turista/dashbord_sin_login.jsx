import { useState, useEffect } from "react";
import Nav from "../../components/nav.jsx";
import PlanesCarousel from "../../components/Carousel.jsx";
import CardComponent from "../../components/card.jsx";
import Footer from "../../components/footer.jsx";
export default function DashbordSinLogin() {

    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);

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
                showProfile={false}   // 👈 oculta ícono de persona
                showNavbar={false}
                showSearch={false}
                showButtonsLogin={true}
            />

            <div className="mt-25">
                <PlanesCarousel />
            </div>
            
            <footer>
                <Footer />
            </footer>

        </div>
    );
}
