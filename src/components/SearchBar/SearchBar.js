import React, { useState } from "react";
import './searchBar.css';
import searchIcon from './search.png';


// Funzione per evidenziare i match della query all'interno del contenuto
export const highlightMatches = (content, query) => {
  if (!query) return content;
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Crea una regex per trovare tutte le occorrenze ignorando maiuscole/minuscole
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  // Evidenzia i match della query con il tag <mark>
  return content.replace(regex, "<mark>$1</mark>");
};


const SearchBar = ({ placeholder, onSearch }) => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <div className="search-bar">
      <input 
        type="text" 
        className="search-input" 
        placeholder={placeholder || "Search Information"} 
        onKeyDown={(e) => e.key === 'Enter' && onSearch && onSearch(e.target.value)}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button className="search-button" onClick={handleSearch}>
        <img src={searchIcon} alt="Search Icon" className="search-icon" />
      </button>
    </div>
  );
};

export default SearchBar;
