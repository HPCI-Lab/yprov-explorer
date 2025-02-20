// GraphContainer.js
/*
Il file GraphContainer.js è il componente principale che contiene il grafo e i suoi 
componenti correlati.Come Graph (grafo), GraphSettings (rendere visibili o meno etichette), 
FullscreenButton (impostare il fullscreen) e GraphInfo (Informaizoni sul grafo). Si comporta 
come un contenitore per tutti questi componenti.
*/

import React, { useState } from "react";
import "./graphContainer.css";
import Graph from "../Graph/Graph";
import FullscreenButton from "../FullscreenButton/FullscreenButton";
import GraphSettings from "../GraphSettings/GraphSettings";
import GraphInfo from "../GraphInfo/GraphInfo";

/*
 - onNodeClick: Funzione che viene chiamata quando un nodo viene cliccato.
 - highlightedNode: Nodo selezionato.
 - graphData: Dati del grafo.
*/
const GraphContainer = ({ onNodeClick, highlightedNode, graphData }) => {
  // Stato per controllare la visibilità delle etichette dei nodi, inizialmente non visibili (false).
  const [showNodeLabelsState, setShowNodeLabelsState] = useState(false);
  // Stato per controllare la visibilità delle etichette dei collegamenti, inizialmente non visibili (false).
  const [showLinkLabels, setShowLinkLabels] = useState(false);
  const [showUsedLinks, setShowUsedLinks] = useState(false); // Stato per i collegamenti "Used"
  const [showWasDerivedFromLinks, setShowWasDerivedFromLinks] = useState(false); // Stato per i collegamenti "wasDerivedFrom"
  const [showWasGeneratedByLinks, setShowWasGeneratedByLinks] = useState(false); // Stato per i collegamenti "wasGeneratedBy"
  const [showWasInformedByLinks, setShowWasInformedByLinks] = useState(false);
  const [showWasAssociatedWithLinks, setShowWasAssociatedWithLinks] = useState(false);
  const [showWasStartedByLinks, setShowWasStartedByLinks] = useState(false);
  const [showHadMemberLinks, setShowHadMemberLinks] = useState(false);
  const [showWasAttributedToLinks, setShowWasAttributedToLinks] = useState(false);


  // Stato per la distanza tra i nodi
  const [nodeDistance, setNodeDistance] = useState(180);
  // Stato per la distanza tra i nodi
  const [nodeRepulsion, setNodeRepulsion] = useState(-300);
  // Stato per la collisione tra i nodi
  const [nodeCollision, setNodeCollision] = useState(40);
  // Stato per il decadimento alpha
  const [alphaDecay, setAlphaDecay] = useState(0.005);



  // Stato che memorizza le statistiche del grafo (nodi totali, attività, entità), inizialmente impostate a zero.
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
            showNodeLabels={showNodeLabelsState} // Passa lo stato attuale per la visibilità delle etichette dei nodi.
            setShowNodeLabels={setShowNodeLabelsState} // Passa la funzione per aggiornare la visibilità delle etichette dei nodi.
            showLinkLabels={showLinkLabels} // Passa lo stato attuale per la visibilità delle etichette dei collegamenti.
            setShowLinkLabels={setShowLinkLabels} // Passa la funzione per aggiornare la visibilità delle etichette dei collegamenti.
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

        {/* Fullscreen nell'angolo in alto a destra */}
        <div className="fullscreen-button-wrapper">
          <FullscreenButton />
        </div>

        {/* Info Graph nell'angolo in basso a sinistra */}
        <div className="graph-info-wrapper">
          <GraphInfo graphData={graphStats} />{" "}
          {/* Passa le statistiche del grafo al componente GraphInfo. */}
        </div>

        <div id="graphCanvas" className="graph-canvas">
          <Graph
            onNodeClick={onNodeClick} // Passa la funzione per gestire il click sui nodi.
            highlightedNode={highlightedNode} // Passa il nodo selezionato.
            showNodeLabels={showNodeLabelsState} // Passa lo stato attuale per la visibilità delle etichette dei nodi.
            showLinkLabels={showLinkLabels} // Passa lo stato attuale per la visibilità delle etichette dei collegamenti.
            graphData={graphData} // Passa i dati del grafo.
            onGraphStats={setGraphStats} // Passa la funzione per aggiornare le statistiche del grafo.
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
