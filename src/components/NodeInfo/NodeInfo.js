//NodeInfo.js
/* 
mostra informazioni dettagliate su un nodo selezionato in un grafo. Ogni sezione visualizza dati come gruppo, 
ID, tipo e relazioni del nodo (es. "Used", "Generated", "wasDerivedFrom"), con collegamenti cliccabili per 
navigare tra nodi correlati e aggiornare la vista del grafo. Include una barra di ricerca per trovare e 
evidenziare il testo corrispondente all'interno delle informazioni mostrate nella label di NodeInfo. Le parole 
cercate vengono evidenziate dinamicamente tramite la funzione highlightMatches. 
*/

import React from "react";
import SearchBar from "../SearchBar/SearchBar";
import NavigationButton from "../NavigationButton/NavigationButton";
import "./nodeInfo.css";
import { highlightMatches } from "../SearchBar/SearchBar";


/*
 - nodeInfo: oggetto contenente le informazioni del nodo selezionato
 - searchQuery: stringa di ricerca per evidenziare i match all'interno delle informazioni del nodo
 - onHighlightNode: funzione per evidenziare un nodo selezionato nel grafo
 - onSearch: funzione per aggiornare la query di ricerca
*/
const NodeInfo = ({ nodeInfo, searchQuery, onHighlightNode, onSearch }) => {
  return (
    <div id="nodeInfo">
      <h3>NODE INFORMATION</h3>

      {/* Barra di ricerca per evidenziare testo nelle informazioni del nodo */}
      <div className="node-info-search-container">
        <SearchBar onSearch={onSearch} />
      </div>

      {/* Pulsanti di navigazione per spostarsi tra i nodi correlati */}
      <NavigationButton />
      <div id="searchResult"></div>

      {/* Se le informazioni del nodo sono disponibili, le visualizza */}
      {nodeInfo ? (
        <div>
          {/* Gruppo del nodo */}
          <div className="node-info-section">
            <strong className="node-info-title">Group:</strong>
            <span
              className="node-info-value"
              // dangerouslySetInnerHTML permette l'inserimento diretto di HTML. trattato come HTML effettivo
              dangerouslySetInnerHTML={{
                __html: highlightMatches(nodeInfo.group, searchQuery),
              }}
            ></span>
          </div>

          {/* ID del nodo */}
          <div className="node-info-section">
            <strong className="node-info-title">ID:</strong>
            <span
              className="node-info-value"
              dangerouslySetInnerHTML={{
                __html: highlightMatches(nodeInfo.id, searchQuery),
              }}
            ></span>
          </div>

          {/* Tipo del nodo */}
          <div className="node-info-section">
            <strong className="node-info-title">Type:</strong>
            <span
              className="node-info-value"
              dangerouslySetInnerHTML={{
                __html: highlightMatches(nodeInfo.type, searchQuery),
              }}
            ></span>
          </div>

          {/* Relazioni del nodo */}
          <div className="node-info-section">
            <strong className="node-info-title">Used:</strong>
            <span className="node-info-value">
              {nodeInfo.used.split(", ").map((link) => (
                <div key={link}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault(); // Evita il comportamento di default del link.
                      window.history.pushState(
                        { idNodo: link },
                        "",
                        `#${link}`
                      ); // Aggiorna la cronologia.
                      onHighlightNode(link); // Chiama la funzione onHighlightNode passando l'ID del nodo cliccato, per evidenziarlo graficamente nel grafo.
                    }}
                    dangerouslySetInnerHTML={{
                      __html: highlightMatches(link, searchQuery),
                    }}
                    className="node-info-link"
                  ></a>
                </div>
              ))}
            </span>
          </div>

          <div className="node-info-section">
            <strong className="node-info-title">wasGeneratedBy:</strong>
            <span className="node-info-value">
              {nodeInfo.wasGeneratedBy.split(", ").map((link) => (
                <div key={link}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.pushState(
                        { idNodo: link },
                        "",
                        `#${link}`
                      );
                      onHighlightNode(link);
                    }}
                    dangerouslySetInnerHTML={{
                      __html: highlightMatches(link, searchQuery),
                    }}
                    className="node-info-link"
                  ></a>
                </div>
              ))}
            </span>
          </div>

          <div className="node-info-section">
            <strong className="node-info-title">wasDerivedFrom:</strong>
            <span className="node-info-value">
              {nodeInfo.wasDerivedFrom.split(", ").map((link) => (
                <div key={link}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.pushState(
                        { idNodo: link },
                        "",
                        `#${link}`
                      );
                      onHighlightNode(link);
                    }}
                    dangerouslySetInnerHTML={{
                      __html: highlightMatches(link, searchQuery),
                    }}
                    className="node-info-link"
                  ></a>
                </div>
              ))}
            </span>
          </div>

          <div className="node-info-section">
            <strong className="node-info-title">Generated:</strong>
            <span className="node-info-value">
              {(nodeInfo.generated || "None").split(", ").map((link) => (
                <div key={link}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.pushState(
                        { idNodo: link },
                        "",
                        `#${link}`
                      );
                      onHighlightNode(link);
                    }}
                    dangerouslySetInnerHTML={{
                      __html: highlightMatches(link, searchQuery),
                    }}
                    className="node-info-link"
                  ></a>
                </div>
              ))}
            </span>
          </div>

          <div className="node-info-section">
            <strong className="node-info-title">wasUsedBy:</strong>
            <span className="node-info-value">
              {(nodeInfo.wasUsedBy || "None").split(", ").map((link) => (
                <div key={link}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.pushState(
                        { idNodo: link },
                        "",
                        `#${link}`
                      );
                      onHighlightNode(link);
                    }}
                    dangerouslySetInnerHTML={{
                      __html: highlightMatches(link, searchQuery),
                    }}
                    className="node-info-link"
                  ></a>
                </div>
              ))}
            </span>
          </div>

          <div className="node-info-section">
            <strong className="node-info-title">Derives:</strong>
            <span className="node-info-value">
              {(nodeInfo.derives || "None").split(", ").map((link) => (
                <div key={link}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.pushState(
                        { idNodo: link },
                        "",
                        `#${link}`
                      );
                      onHighlightNode(link);
                    }}
                    dangerouslySetInnerHTML={{
                      __html: highlightMatches(link, searchQuery),
                    }}
                    className="node-info-link"
                  ></a>
                </div>
              ))}
            </span>
          </div>
          <div className="node-info-section">
            <strong className="node-info-title">wasInformedBy:</strong>
            <span className="node-info-value">
              {(nodeInfo.wasInformedBy || "None").split(", ").map((link) => (
                <div key={link}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.pushState({ idNodo: link }, "", `#${link}`);
                      onHighlightNode(link);
                    }}
                    dangerouslySetInnerHTML={{
                      __html: highlightMatches(link, searchQuery),
                    }}
                    className="node-info-link"
                  ></a>
                </div>
              ))}
            </span>
          </div>

          <div className="node-info-section">
            <strong className="node-info-title">wasAssociatedWith:</strong>
            <span className="node-info-value">
              {(nodeInfo.wasAssociatedWith || "None").split(", ").map((link) => (
                <div key={link}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.pushState({ idNodo: link }, "", `#${link}`);
                      onHighlightNode(link);
                    }}
                    dangerouslySetInnerHTML={{
                      __html: highlightMatches(link, searchQuery),
                    }}
                    className="node-info-link"
                  ></a>
                </div>
              ))}
            </span>
          </div>

          <div className="node-info-section">
            <strong className="node-info-title">hadMember:</strong>
            <span className="node-info-value">
              {(nodeInfo.hadMember || "None").split(", ").map((link) => (
                <div key={link}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.pushState({ idNodo: link }, "", `#${link}`);
                      onHighlightNode(link);
                    }}
                    dangerouslySetInnerHTML={{
                      __html: highlightMatches(link, searchQuery),
                    }}
                    className="node-info-link"
                  ></a>
                </div>
              ))}
            </span>
          </div>

          <div className="node-info-section">
            <strong className="node-info-title">wasStartedBy:</strong>
            <span className="node-info-value">
              {(nodeInfo.wasStartedBy || "None").split(", ").map((link) => (
                <div key={link}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.pushState({ idNodo: link }, "", `#${link}`);
                      onHighlightNode(link);
                    }}
                    dangerouslySetInnerHTML={{
                      __html: highlightMatches(link, searchQuery),
                    }}
                    className="node-info-link"
                  ></a>
                </div>
              ))}
            </span>
          </div>

        </div>
      ) : (
        <p id="infoContent">Click on a node to see details.</p>
      )}
    </div>
  );
};

export default NodeInfo;
