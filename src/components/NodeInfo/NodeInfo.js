//NodeInfo.js
/* 
NodeInfo.js: shows detailed information about a selected node in a graph. Each section displays data as a group, 
Node ID, type and relationships (e.g. "Used", "Generated", "wasDerivedFrom"), with clickable links to 
Navigate between related nodes and update the graph view. Includes a search bar to find and 
Highlight the corresponding text within the information shown in the NodeInfo label. Words 
searches are highlighted dynamically via the highlightMatches function. 
*/

import React from "react";
import SearchBar from "../SearchBar/SearchBar";
import NavigationButton from "../NavigationButton/NavigationButton";
import "./nodeInfo.css";
import { highlightMatches } from "../SearchBar/SearchBar";

/*
 -nodeInfo: object containing information of the selected node
 - searchQuery: search string to highlight matches within node information
 - onHighlightNode: function to highlight a selected node in the graph
 - onSearch: function to update the search query
*/
const NodeInfo = ({ nodeInfo, searchQuery, onHighlightNode, onSearch }) => {
  return (
    <div id="nodeInfo">
      <h3>NODE INFORMATION</h3>

      {/* Search bar to find and highlight text within the node information */}
      <div className="node-info-search-container">
        <SearchBar onSearch={onSearch} />
      </div>

      {/* Navigation button to return to the graph view */}
      <NavigationButton />
      <div id="searchResult"></div>

      {/* Node information displayed in sections */}
      {nodeInfo ? (
        <div>
          {/* Group of the node */}
          <div className="node-info-section">
            <strong className="node-info-title">Group:</strong>
            <span
              className="node-info-value"
              // dangerouslySetInnerHTML allows direct insertion of HTML. treated as actual HTML
              dangerouslySetInnerHTML={{
                __html: highlightMatches(nodeInfo.group, searchQuery),
              }}
            ></span>
          </div>

          {/* ID of the node */}
          <div className="node-info-section">
            <strong className="node-info-title">ID:</strong>
            <span
              className="node-info-value"
              dangerouslySetInnerHTML={{
                __html: highlightMatches(nodeInfo.id, searchQuery),
              }}
            ></span>
          </div>

          {/* Type of the node */}
          <div className="node-info-section">
            <strong className="node-info-title">Type:</strong>
            <span
              className="node-info-value"
              dangerouslySetInnerHTML={{
                __html: highlightMatches(nodeInfo.type, searchQuery),
              }}
            ></span>
          </div>

          {/* Relationships of the node */}
          <div className="node-info-section">
            <strong className="node-info-title">Used:</strong>
            <span className="node-info-value">
              {nodeInfo.used.split(", ").map((link) => (
                <div key={link}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault(); // Avoids the default behavior of the browser.
                      window.history.pushState(
                        { idNodo: link },
                        "",
                        `#${link}`
                      );
                      onHighlightNode(link); // Highlights the selected node in the graph.
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
            <strong className="node-info-title">wasAssociatedWith:</strong>
            <span className="node-info-value">
              {(nodeInfo.wasAssociatedWith || "None")
                .split(", ")
                .map((link) => (
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
            <strong className="node-info-title">hadMember:</strong>
            <span className="node-info-value">
              {(nodeInfo.hadMember || "None").split(", ").map((link) => (
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
            <strong className="node-info-title">wasStartedBy:</strong>
            <span className="node-info-value">
              {(nodeInfo.wasStartedBy || "None").split(", ").map((link) => (
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
        </div>
      ) : (
        <p id="infoContent">Click on a node to see details.</p>
      )}
    </div>
  );
};

export default NodeInfo;
