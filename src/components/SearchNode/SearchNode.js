// SearchNode.js
/*
Questo file consente di cercare un nodo all'interno del grafo. Include un campo di input per inserire il nome del nodo da cercare
e un pulsante di ricerca per avviare la ricerca. Mostra anche le corrispondenze possibili mentre l'utente digita il nome del nodo.
*/

import React, { useState } from 'react';
import './searchNode.css';
import searchIcon from './search.png';

/*
 - placeholder: testo visualizzato all'interno del campo di input
 - onSearch: funzione di callback chiamata quando si preme il pulsante di ricerca o si preme invio
 - nodes: array di nodi da cui cercare i corrispondenti
*/
const SearchNode = ({ placeholder, onSearch, nodes }) => {
  const [searchTerm, setSearchTerm] = useState(''); // Stato per memorizzare il termine di ricerca
  const [suggestions, setSuggestions] = useState([]); // Stato per memorizzare le corrispondenze possibili (suggerimenti)

  // Funzione per gestire la ricerca
  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchTerm); // Chiamare la funzione di callback con il termine di ricerca
      setSuggestions([]); // Nascondere i suggerimenti perché la ricerca è stata avviata
    }
  };

  // Funzione per gestire il cambiamento dell'input
  const handleInputChange = (e) => {
    const value = e.target.value; // Ottenere il valore dell'input
    setSearchTerm(value); // Aggiornare il termine di ricerca

    // Se il valore è vuoto, nascondere i suggerimenti
    if (value.trim() === '') {
      setSuggestions([]);
    } else {
      const filtered = nodes.filter((node) => {
        // Filtrare i nodi in base al termine di ricerca
        const nodeId = node?.id?.toString() || '';
        return nodeId.toLowerCase().includes(value.toLowerCase());
      });
      setSuggestions(filtered);
    }
  };

  // Funzione per gestire il clic su un suggerimento
  const handleSuggestionClick = (nodeId) => {
    setSearchTerm(nodeId); // Impostare il termine di ricerca sul nodo selezionato
    setSuggestions([]); // Nascondere i suggerimenti
    if (onSearch) onSearch(nodeId);
  };

  return (
    <div className="search-bar-container">
      <div className="search-Bar">
        <input
          type="text"
          className="search-input"
          placeholder={placeholder || 'Search any node on the graph'}
          value={searchTerm}
          onChange={handleInputChange} // Aggiorna il valore del termine di ricerca a ogni modifica dell'input
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()} // Avvia la ricerca quando l'utente preme il tasto Invio
        />
        <button className="search-button" onClick={handleSearch}>
          <img src={searchIcon} alt="Search Icon" className="search-icon" />
        </button>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && ( // Mostra i suggerimenti solo se ci sono risultati corrispondenti
        <div className="suggestions-container">
          {suggestions.map((node) => (
            <div
              key={node.id} // Chiave unica per ogni elemento suggerito
              className="suggestion-item"
              onClick={() => handleSuggestionClick(node.id)} // Gestire il clic su un suggerimento
            >
              {node.id}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Funzione per configurare SearchNode con i dati e le funzionalità personalizzate
export const configureSearchNode = ({ graphData, setHighlightedNode, setSelectedNode, findNodeDetails }) => {
  const nodes = [
    ...Object.keys(graphData?.entity || {}).map((key) => ({
      id: key,
      group: 'entity',
    })),
    ...Object.keys(graphData?.activity || {}).map((key) => ({
      id: key,
      group: 'activity',
    })),
    ...Object.keys(graphData?.agent || {}).map((key) => ({
      id: key,
      group: 'agent',
    })),
  ];

  return (
    <SearchNode
      placeholder="Search any node on the graph" // Placeholder per l'input di ricerca
      onSearch={(nodeId) => {
        // Aggiorna URL
        window.history.pushState(null, '', `#${nodeId}`);
        // Evidenzia e zooma sul nodo
        setHighlightedNode(nodeId);
        // Aggiorna i dettagli del nodo selezionato
        const nodeDetails = findNodeDetails(nodeId, graphData);
        if (nodeDetails) setSelectedNode(nodeDetails);
      }}
      nodes={nodes}
    />
  );
};

export default SearchNode;
