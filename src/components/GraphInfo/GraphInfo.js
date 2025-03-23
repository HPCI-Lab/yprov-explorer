/*
GraphInfo.js: This component, GraphInfo, is used to display detailed information about the current graph.
Through an icon button, the user can show or hide an information panel.
The panel displays statistics such as the total number of nodes, activities, entities.
*/

import React, { useState } from "react";
import "./graphInfo.css";
import infoIcon from "./info.png";

const GraphInfo = ({ graphData }) => {
  const [isInfoVisible, setIsInfoVisible] = useState(false); // State to control the visibility of the info panel

  // Function to toggle the visibility of the info panel
  const toggleInfoVisibility = () => {
    setIsInfoVisible(!isInfoVisible);
  };

  return (
    <div className="graph-info-container">
      {/* Info Button */}
      <button className="info-button" onClick={toggleInfoVisibility}>
        <img src={infoIcon} alt="Info Icon" className="info-icon" />
      </button>

      {/* Info Label */}
      {isInfoVisible && (
        <div className="info-label">
          <p>
            <strong>Nodes Number:</strong> {graphData.totalNodes}
          </p>
          <p>
            <strong>Activity Number:</strong> {graphData.activityCount}
          </p>
          <p>
            <strong>Entities Number:</strong> {graphData.entityCount}
          </p>
          <p>
            <strong>Agent Number:</strong> {graphData.agentCount}
          </p>
        </div>
      )}
    </div>
  );
};

export default GraphInfo;
