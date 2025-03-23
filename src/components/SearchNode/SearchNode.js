// SearchNode.js
/*
SearchNode.js: This component allows you to search for a node within the graph. It includes an input field to enter the name of the node to be searched
and a search button to start the search. It also shows possible matches as the user enters the name of the node.
*/

import React, { useState } from "react";
import "./searchNode.css";
import searchIcon from "./search.png";

/*
 - placeholder: text displayed within the input field
 - onSearch: callback function call when you press the search button or press enter
 - nodes: array of nodes from which to search for matching
*/
const SearchNode = ({ placeholder, onSearch, nodes }) => {
  const [searchTerm, setSearchTerm] = useState(""); // State to store the search term
  const [suggestions, setSuggestions] = useState([]); // State to store the search suggestions

  // Function to handle search
  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchTerm); // Call the onSearch callback function with the search term
      setSuggestions([]); // Hide the suggestions after search
    }
  };

  // Function to handle input change
  const handleInputChange = (e) => {
    const value = e.target.value; // Get the value from the input field
    setSearchTerm(value); // Update the search term state with the input value

    // Filter the nodes based on the search term
    if (value.trim() === "") {
      setSuggestions([]);
    } else {
      const filtered = nodes.filter((node) => {
        // Check if the node id includes the search term
        const nodeId = node?.id?.toString() || "";
        return nodeId.toLowerCase().includes(value.toLowerCase());
      });
      setSuggestions(filtered);
    }
  };

  // Function to handle suggestion click
  const handleSuggestionClick = (nodeId) => {
    setSearchTerm(nodeId); // Update the search term with the clicked suggestion
    setSuggestions([]); // Hide the suggestions
    if (onSearch) onSearch(nodeId);
  };

  return (
    <div className="search-bar-container">
      <div className="search-Bar">
        <input
          type="text"
          className="search-input"
          placeholder={placeholder || "Search any node on the graph"}
          value={searchTerm}
          onChange={handleInputChange} // Update the search term on input change
          onKeyDown={(e) => e.key === "Enter" && handleSearch()} // Call handleSearch on Enter key press
        />
        <button className="search-button" onClick={handleSearch}>
          <img src={searchIcon} alt="Search Icon" className="search-icon" />
        </button>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && ( // Show suggestions only if there are any
        <div className="suggestions-container">
          {suggestions.map((node) => (
            <div
              key={node.id} // Key for the suggestion item
              className="suggestion-item"
              onClick={() => handleSuggestionClick(node.id)} // Call handleSuggestionClick on suggestion click
            >
              {node.id}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Function to configure the search node component
export const configureSearchNode = ({
  graphData,
  setHighlightedNode,
  setSelectedNode,
  findNodeDetails,
}) => {
  const nodes = [
    ...Object.keys(graphData?.entity || {}).map((key) => ({
      id: key,
      group: "entity",
    })),
    ...Object.keys(graphData?.activity || {}).map((key) => ({
      id: key,
      group: "activity",
    })),
    ...Object.keys(graphData?.agent || {}).map((key) => ({
      id: key,
      group: "agent",
    })),
  ];

  return (
    <SearchNode
      placeholder="Search any node on the graph" // Placeholder text for the search input field
      onSearch={(nodeId) => {
        // Update the URL with the node id
        window.history.pushState(null, "", `#${nodeId}`);
        // Highlight the node on the graph
        setHighlightedNode(nodeId);
        // Find the node details
        const nodeDetails = findNodeDetails(nodeId, graphData);
        if (nodeDetails) setSelectedNode(nodeDetails);
      }}
      nodes={nodes}
    />
  );
};

export default SearchNode;
