/*
GraphSettings.js: This component, GraphSettings, allows the user to customize the graph view,
offering options to show or hide specific types of links and nodes. It also allows you to
Modify parameters related to the physical forces of the graph (distance, repulsion, collision and alpha decay).
Each change made updates the graph status in real time, adapting to the user’s preferences.
It is particularly useful in scenarios where a high level of layout configurability is required.
*/

import React, { useState } from "react";
import "./graphSettings.css";
import settingsIcon from "./Settings.png";

const GraphSettings = ({ 
  showNodeLabels, setShowNodeLabels,
  showLinkLabels, setShowLinkLabels,
  showUsedLinks, setShowUsedLinks,
  showWasDerivedFromLinks, setShowWasDerivedFromLinks,
  showWasGeneratedByLinks, setShowWasGeneratedByLinks,
  showWasInformedByLinks, setShowWasInformedByLinks,  
  showWasAssociatedWithLinks, setShowWasAssociatedWithLinks, 
  showWasStartedByLinks, setShowWasStartedByLinks, 
  showHadMemberLinks, setShowHadMemberLinks,  
  showWasAttributedToLinks, setShowWasAttributedToLinks,
  nodeDistance, setNodeDistance,
  nodeRepulsion, setNodeRepulsion,
  nodeCollision, setNodeCollision,
  alphaDecay, setAlphaDecay
}) => {
  const [showSettings, setShowSettings] = useState(false);

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <div className="graph-settings-container">
      {/* Button with settings icon */}
      <button
        className={`settings-button ${showSettings ? "rotated" : ""}`}
        onClick={toggleSettings}
      >
        <img src={settingsIcon} alt="Settings Icon" className="settings-icon" />
      </button>

      {/* Settings Label */}
      {showSettings && (
        <div className="settings-label">
        <div className="settings-item">
          <label>
            <span>Nodes Name</span>
            <input 
              type="checkbox" 
              checked={showNodeLabels}
              onChange={(e) => setShowNodeLabels(e.target.checked)}
            />
          </label>
        </div>
        <div className="settings-item">
          <label>
            <span>Links Name</span>
            <input 
              type="checkbox" 
              checked={showLinkLabels}
              onChange={(e) => setShowLinkLabels(e.target.checked)}
            />
          </label>
        </div>

        <hr className="separator" />

        <div className="settings-item">
          <label>
            <span>Hide Used</span>
            <input
              type="checkbox"
              checked={showUsedLinks}
              onChange={(e) => setShowUsedLinks(e.target.checked)}
            />
          </label>
        </div>
        <div className="settings-item">
          <label>
            <span>Hide wasDerivedFrom</span>
            <input
              type="checkbox"
              checked={showWasDerivedFromLinks}
              onChange={(e) => setShowWasDerivedFromLinks(e.target.checked)}
            />
          </label>
        </div>
        <div className="settings-item">
          <label>
            <span>Hide wasGeneratedBy</span>
            <input
              type="checkbox"
              checked={showWasGeneratedByLinks}
              onChange={(e) => setShowWasGeneratedByLinks(e.target.checked)}
            />
          </label>
        </div>
        <div className="settings-item">
          <label>
            <span>Hide wasInformedBy</span>
            <input
              type="checkbox"
              checked={showWasInformedByLinks}
              onChange={(e) => setShowWasInformedByLinks(e.target.checked)}
            />
          </label>
        </div>

        <div className="settings-item">
          <label>
            <span>Hide wasAssociatedWith</span>
            <input
              type="checkbox"
              checked={showWasAssociatedWithLinks}
              onChange={(e) => setShowWasAssociatedWithLinks(e.target.checked)}
            />
          </label>
        </div>

        <div className="settings-item">
          <label>
            <span>Hide wasStartedBy</span>
            <input
              type="checkbox"
              checked={showWasStartedByLinks}
              onChange={(e) => setShowWasStartedByLinks(e.target.checked)}
            />
          </label>
        </div>

        <div className="settings-item">
          <label>
            <span>Hide hadMember</span>
            <input
              type="checkbox"
              checked={showHadMemberLinks}
              onChange={(e) => setShowHadMemberLinks(e.target.checked)}
            />
          </label>
        </div>

        <div className="settings-item">
          <label>
            <span>Hide wasAttributedTo</span>
            <input
              type="checkbox"
              checked={showWasAttributedToLinks}
              onChange={(e) => setShowWasAttributedToLinks(e.target.checked)}
            />
          </label>
        </div>

        <hr className="separator" />

        <div className="settings-item">
          <label>
            <span>Node Distance</span>
            <input
              type="range"
              min="50"
              max="500"
              value={nodeDistance}
              onChange={(e) => setNodeDistance(Number(e.target.value))}
            />
            <span>{nodeDistance}px</span>
          </label>
        </div>
        <div className="settings-item">
          <label>
            <span>Node Repulsion</span>
            <input
              type="range"
              min="-1000"
              max="0"
              step="50"
              value={nodeRepulsion}
              onChange={(e) => setNodeRepulsion(Number(e.target.value))}
            />
            <span>{nodeRepulsion}px</span>
          </label>
        </div>
        <div className="settings-item">
          <label>
            <span>Node Collision</span>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={nodeCollision}
              onChange={(e) => setNodeCollision(Number(e.target.value))}
            />
            <span>{nodeCollision}px</span>
          </label>
        </div>
        <div className="settings-item">
          <label>
            <span>Alpha Decay</span>
            <input
              type="range"
              min="0.001"
              max="0.1"
              step="0.001"
              value={alphaDecay}
              onChange={(e) => setAlphaDecay(Number(e.target.value))}
            />
            <span>{alphaDecay}px</span>
          </label>
        </div>
      </div>
      )}
    </div>
  );
};

export default GraphSettings;
