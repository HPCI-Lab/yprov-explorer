import React, { useState } from "react";
import "./graphInfo.css";
import infoIcon from "./info.png";

const GraphInfo = ({ graphData }) => {
    const [isInfoVisible, setIsInfoVisible] = useState(false);

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
                    <p><strong>Nodes Number:</strong> {graphData.totalNodes}</p>
                    <p><strong>Activity Number:</strong> {graphData.activityCount}</p>
                    <p><strong>Entities Number:</strong> {graphData.entityCount}</p>
                    <p><strong>Agent Number:</strong> {graphData.agentCount}</p>
                </div>
            )}
        </div>
    );
};

export default GraphInfo;
