/*
SearchBar.js: Component for a search bar with a search button to search words in the NodeInfo label.
*/

import React, { useState } from "react";
import "./searchBar.css";
import searchIcon from "./search.png";

// Function to highlight the matches of the query in the content
export const highlightMatches = (content, query) => {
  if (!query) return content;
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Create a regular expression with the query and the global and case-insensitive flags
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  // Replace the matches with the query highlighted
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
        onKeyDown={(e) =>
          e.key === "Enter" && onSearch && onSearch(e.target.value)
        }
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
