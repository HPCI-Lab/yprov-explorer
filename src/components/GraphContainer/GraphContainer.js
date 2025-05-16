// GraphContainer.js
/*
GraphContainer.js: Main component that contains the graph and its 
related components. Such as Graph (graph), GraphSettings (make labels visible or not), 
FullscreenButton (set fullscreen) and GraphInfo (graph information). Behaves 
as a container for all these components.
*/

import React, { useState } from "react";
import "./graphContainer.css";
import Graph from "../Graph/Graph";
import FullscreenButton from "../FullscreenButton/FullscreenButton";
import GraphSettings from "../GraphSettings/GraphSettings";
import GraphInfo from "../GraphInfo/GraphInfo";

/*
 - onNodeClick: Function to handle node click.
 - highlightedNode: Selected node.
 - graphData: Graph data to be displayed.
*/
const GraphContainer = ({ onNodeClick, highlightedNode, graphData }) => {
  // State to control the visibility of node labels, initially not visible (false).
  const [showNodeLabelsState, setShowNodeLabelsState] = useState(true);
  // State to control the visibility of link labels, initially not visible (false).
  const [showLinkLabels, setShowLinkLabels] = useState(true);
  // State to control the visibility of "used" links, initially not visible (false).
  const [showUsedLinks, setShowUsedLinks] = useState(false);
  // State to control the visibility of "wasDerivedFrom" links, initially not visible (false).
  const [showWasDerivedFromLinks, setShowWasDerivedFromLinks] = useState(false);
  // State to control the visibility of "wasGeneratedBy" links, initially not visible (false).
  const [showWasGeneratedByLinks, setShowWasGeneratedByLinks] = useState(false);
  // State to control the visibility of "wasInformedBy" links, initially not visible (false).
  const [showWasInformedByLinks, setShowWasInformedByLinks] = useState(false);
  // State to control the visibility of "wasAssociatedWith" links, initially not visible (false).
  const [showWasAssociatedWithLinks, setShowWasAssociatedWithLinks] =
    useState(false);
  // State to control the visibility of "wasStartedBy" links, initially not visible (false).
  const [showWasStartedByLinks, setShowWasStartedByLinks] = useState(false);
  // State to control the visibility of "hadMember" links, initially not visible (false).
  const [showHadMemberLinks, setShowHadMemberLinks] = useState(false);
  // State to control the visibility of "wasAttributedTo" links, initially not visible (false).
  const [showWasAttributedToLinks, setShowWasAttributedToLinks] =
    useState(false);
  // State for the distance between nodes
  const [nodeDistance, setNodeDistance] = useState(180);
  // State for the repulsion between nodes
  const [nodeRepulsion, setNodeRepulsion] = useState(-300);
  // State for the node collision
  const [nodeCollision, setNodeCollision] = useState(40);
  // State for the alpha decay
  const [alphaDecay, setAlphaDecay] = useState(0.005);

  // State to store the graph statistics (total nodes, activity count, entity count).
  const [graphStats, setGraphStats] = useState({
    totalNodes: 0,
    activityCount: 0,
    entityCount: 0,
  });

  return (
    <div className="graph-container">
      <div className="frame" id="graphFrame">
        {/* Graph Settings nell'angolo in alto a sinistra */}
        <div className="graph-settings-wrapper">
          <GraphSettings
            showNodeLabels={showNodeLabelsState}
            setShowNodeLabels={setShowNodeLabelsState}
            showLinkLabels={showLinkLabels}
            setShowLinkLabels={setShowLinkLabels}
            showUsedLinks={showUsedLinks}
            setShowUsedLinks={setShowUsedLinks}
            showWasDerivedFromLinks={showWasDerivedFromLinks}
            setShowWasDerivedFromLinks={setShowWasDerivedFromLinks}
            showWasGeneratedByLinks={showWasGeneratedByLinks}
            setShowWasGeneratedByLinks={setShowWasGeneratedByLinks}
            showWasInformedByLinks={showWasInformedByLinks}
            setShowWasInformedByLinks={setShowWasInformedByLinks}
            showWasAssociatedWithLinks={showWasAssociatedWithLinks}
            setShowWasAssociatedWithLinks={setShowWasAssociatedWithLinks}
            showWasStartedByLinks={showWasStartedByLinks}
            setShowWasStartedByLinks={setShowWasStartedByLinks}
            showHadMemberLinks={showHadMemberLinks}
            setShowHadMemberLinks={setShowHadMemberLinks}
            setShowWasAttributedToLinks={setShowWasAttributedToLinks}
            nodeDistance={nodeDistance}
            setNodeDistance={setNodeDistance}
            nodeRepulsion={nodeRepulsion}
            setNodeRepulsion={setNodeRepulsion}
            nodeCollision={nodeCollision}
            setNodeCollision={setNodeCollision}
            alphaDecay={alphaDecay}
            setAlphaDecay={setAlphaDecay}
          />
        </div>

        {/* Fullscreen button in the right corner */}
        <div className="fullscreen-button-wrapper">
          <FullscreenButton />
        </div>

        {/* Info Graph button in the left down corner */}
        <div className="graph-info-wrapper">
          <GraphInfo graphData={graphStats} />{" "}
        </div>

        <div id="graphCanvas" className="graph-canvas">
          <Graph
            onNodeClick={onNodeClick}
            highlightedNode={highlightedNode}
            showNodeLabels={showNodeLabelsState}
            showLinkLabels={showLinkLabels}
            graphData={graphData}
            onGraphStats={setGraphStats}
            showUsedLinks={showUsedLinks}
            showWasDerivedFromLinks={showWasDerivedFromLinks}
            showWasGeneratedByLinks={showWasGeneratedByLinks}
            showWasInformedByLinks={showWasInformedByLinks}
            showWasAssociatedWithLinks={showWasAssociatedWithLinks}
            showWasStartedByLinks={showWasStartedByLinks}
            showHadMemberLinks={showHadMemberLinks}
            showWasAttributedToLinks={showWasAttributedToLinks}
            nodeDistance={nodeDistance}
            nodeRepulsion={nodeRepulsion}
            nodeCollision={nodeCollision}
            alphaDecay={alphaDecay}
          />
        </div>
      </div>
    </div>
  );
};

export default GraphContainer;
