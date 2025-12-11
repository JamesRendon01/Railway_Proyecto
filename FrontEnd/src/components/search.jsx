import React from "react";
import { Search } from "lucide-react";

const SearchBar = ({ query, setQuery}) => {

    return (
    <div className="flex items-center max-w-[28rem] relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar..."
        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-full focus:ring-2 focus:ring-black transition-shadow"
      />
    </div>
  );
};

export default SearchBar;