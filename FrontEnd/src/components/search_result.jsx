import React from "react";
import CardComponent from "./card.jsx";

const SearchResults = ({ results = [], hasSearched = false }) => {
  if (hasSearched && results.length === 0) {
    return <p className="text-center text-gray-700">No se encontraron resultados</p>;
  }

  if (results.length === 0) return null;

  // Pasamos los resultados como prop "plans"
  return <CardComponent showButton plans={results} />;
};

export default SearchResults;
