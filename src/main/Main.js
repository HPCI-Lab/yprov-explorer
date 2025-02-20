// Main.js
/*
Questo file definisce il componente principale dell'applicazione, che gestisce la visualizzazione e l'interazione tra il grafo, 
i dettagli dei nodi e gli strumenti di ricerca. Utilizza stati per tracciare i nodi selezionati, evidenziati e i dati del grafo.
Include funzionalità per sincronizzare i nodi con la cronologia del browser e supporta la navigazione tramite URL.
*/

import React, { useState, useEffect } from "react";
import "./main.css";
import GraphContainer from '../components/GraphContainer/GraphContainer.js';
import NodeInfo from '../components/NodeInfo/NodeInfo.js';
import JsonLabel from '../components/JsonLabel/JsonLabel.js';
import SearchNode from '../components/SearchNode/SearchNode.js';
import DownloadsButton from '../components/DownloadsButton/DownloadsButton.js';
import { configureSearchNode } from '../components/SearchNode/SearchNode';
import { unifiedFileLoader } from '../unified-loader';

const Main = ({}) => {
    // Stato per il nodo selezionato
    const [selectedNode, setSelectedNode] = useState(null);
    // Stato per il nodo evidenziato
    const [highlightedNode, setHighlightedNode] = useState(null);
    // Stato per la query di ricerca
    const [searchQuery, setSearchQuery] = useState("");
    // Stato per i dati del grafo caricati
    const [graphData, setGraphData] = useState(null);
    // Stato per l'URL del file JSON
    const [fileUrl, setFileUrl] = useState(null); 
    


    // Gestisce il click su un nodo nel grafo
    const handleNodeClick = (nodeInfo) => {
      setSelectedNode(nodeInfo); // Imposta il nodo selezionato
      setHighlightedNode(nodeInfo.id); // Evidenzia il nodo cliccato
    
      // Aggiorna l'URL con file e nodo
      const currentUrl = fileUrl 
        ? `?file=${encodeURIComponent(fileUrl)}#${nodeInfo.id}` 
        : `#${nodeInfo.id}`;
      
      const currentState = window.history.state || {};
      if (currentState.idNodo !== nodeInfo.id) {
        window.history.pushState({ idNodo: nodeInfo.id }, "", currentUrl);
      }
    };
    
    
    // Gestisce la ricerca di un nodo tramite la barra di ricerca
    const handleSearch = (query) => {
        setSearchQuery(query); // Aggiorna lo stato con la query di ricerca
    };


    useEffect(() => {
      const loadFromUrl = async () => {
        const params = new URLSearchParams(window.location.search);
        const fileParam = params.get("file");
        const nodeId = window.location.hash.substring(1);
    
        if (fileParam) {
          try {
            const result = await unifiedFileLoader(fileParam);
            
            setFileUrl(fileParam);
            setGraphData(result.data);
    
            if (nodeId) {
              const nodeDetails = findNodeDetails(nodeId, result.data);
              if (nodeDetails) {
                setSelectedNode(nodeDetails);
                setHighlightedNode(nodeId);
              }
            }
          } catch (error) {
            console.error("Error loading file:", error);
            // Implement error handling UI here
          }
        }
      };
    
      loadFromUrl();
    }, []); // Effect runs only on mount
    
    
    // useEffect per sincronizzare i nodi con la cronologia del browser
    useEffect(() => {
        // Funzione per sincronizzare il nodo con la cronologia del browser
        const syncNodeWithHistory = (event) => {
            const nodeId = event?.state?.idNodo || window.location.hash.substring(1); // Ottiene l'ID del nodo dall'URL o dallo stato della cronologia

            // Se l'ID del nodo è presente e ci sono dati del grafo
            if (nodeId && graphData) {
                const nodeDetails = findNodeDetails(nodeId, graphData); // Trova i dettagli del nodo
                if (nodeDetails) {
                    setSelectedNode(nodeDetails); // Imposta il nodo selezionato
                    setHighlightedNode(nodeId); // Evidenzia il nodo selezionato
                }
            }
        };

        // Sincronizza il nodo iniziale al caricamento della pagina
        const syncInitialNode = () => {
            const initialNodeId = window.location.hash.substring(1); // Ottiene l'ID del nodo dall'URL
            if (initialNodeId && graphData) {
                const initialNodeDetails = findNodeDetails(initialNodeId, graphData); // Trova i dettagli del nodo iniziale
                if (initialNodeDetails) {
                    setSelectedNode(initialNodeDetails); // Imposta il nodo selezionato
                    setHighlightedNode(initialNodeId); // Evidenzia il nodo selezionato
                    // Aggiorna lo stato della cronologia con l'ID del nodo iniziale
                    window.history.replaceState(
                        { idNodo: initialNodeId },
                        "",
                        `#${initialNodeId}`
                    );
                }
            }
        };

        // Aggiunge un listener per gli eventi di navigazione nella cronologia
        window.addEventListener("popstate", syncNodeWithHistory);

        // Sincronizza il nodo iniziale al caricamento della pagina
        syncInitialNode();

        // Rimuove il listener alla pulizia del componente
        return () => {
            window.removeEventListener("popstate", syncNodeWithHistory);
        };
    }, [graphData]); // Esegue il codice quando i dati del grafo cambiano

    
    // Funzione per trovare i dettagli di un nodo nel grafo
    const findNodeDetails = (nodeId, graphData) => {
      if (!graphData) return null;

      // Recupera i dettagli del nodo
      const entityNode = graphData.entity[nodeId];
      const activityNode = graphData.activity[nodeId];
      const agentNode = graphData.agent ? graphData.agent[nodeId] : null;

      // Crea i nodi e la mappa dei nodi
      const nodes = [
        ...Object.keys(graphData.entity).map((key) => ({
          id: key,
          group: "entity",
        })),
        ...Object.keys(graphData.activity).map((key) => ({
          id: key,
          group: "activity",
        })),
        ...Object.keys(graphData.agent || {}).map((key) => ({
          id: key,
          group: "agent",
        })),
      ];
      const nodeMap = new Map(nodes.map((node) => [node.id, node]));

      // Crea i collegamenti tra i nodi
      const links = [
        ...Object.values(graphData.wasDerivedFrom || {}).map((rel) => ({
          source: nodeMap.get(rel["prov:usedEntity"]),
          target: nodeMap.get(rel["prov:generatedEntity"]),
          type: "wasDerivedFrom",
        })),
        ...Object.values(graphData.wasGeneratedBy || {}).map((rel) => ({
          source: nodeMap.get(rel["prov:activity"]),
          target: nodeMap.get(rel["prov:entity"]),
          type: "wasGeneratedBy",
        })),
        ...Object.values(graphData.used || {}).map((rel) => ({
          source: nodeMap.get(rel["prov:entity"]),
          target: nodeMap.get(rel["prov:activity"]),
          type: "used",
        })),
        ...Object.values(graphData.wasInformedBy || {}).map((rel) => ({
          source: nodeMap.get(rel["prov:informant"]),
          target: nodeMap.get(rel["prov:informed"]),
          type: "wasInformedBy",
        })),
        ...Object.values(graphData.hadMember || {}).map((rel) => ({
          source: nodeMap.get(rel["prov:collection"]),
          target: nodeMap.get(rel["prov:entity"]),
          type: "hadMember",
        })),
        ...Object.values(graphData.wasStartedBy || {}).map((rel) => ({
          source: nodeMap.get(rel["prov:trigger"]),
          target: nodeMap.get(rel["prov:activity"]),
          type: "wasStartedBy",
        })),
        ...Object.values(graphData.wasAssociatedWith || {}).map((rel) => ({
          source: nodeMap.get(rel["prov:activity"]),
          target: nodeMap.get(rel["prov:agent"]),
          type: "wasAssociatedWith",
        })),
        ...Object.values(graphData.wasAttributedTo || {}).map((rel) => ({
          source: nodeMap.get(rel["prov:entity"]),
          target: nodeMap.get(rel["prov:agent"]),
          type: "wasAttributedTo",
        })),
      ].filter((link) => link.source && link.target);

      // Filtra i collegamenti per tipo in base al nodo in esame
      const wasGeneratedByLinks = links.filter(
        (link) => link.type === "wasGeneratedBy" && link.target?.id === nodeId
      );
      const usedLinks = links.filter(
        (link) => link.type === "used" && link.source?.id === nodeId
      );
      const wasDerivedFromLinks = links.filter(
        (link) => link.type === "wasDerivedFrom" && link.source?.id === nodeId
      );
      const wasInformedByLinks = links.filter(
        (link) => link.type === "wasInformedBy" && link.target?.id === nodeId
      );
      const wasAssociatedWithLinks = links.filter(
        (link) => link.type === "wasAssociatedWith" && link.target?.id === nodeId
      );
      const hadMemberLinks = links.filter(
        (link) =>
          link.type === "hadMember" &&
          (link.source?.id === nodeId || link.target?.id === nodeId)
      );
      const wasStartedByLinks = links.filter(
        (link) => link.type === "wasStartedBy" && link.target?.id === nodeId
      );
      const wasAttributedToLinks = links.filter(
        (link) =>
          link.type === "wasAttributedTo" &&
          (link.source?.id === nodeId || link.target?.id === nodeId)
      );

      // Relazioni inverse
      const generatedLinks = links.filter(
        (link) => link.type === "wasGeneratedBy" && link.source?.id === nodeId
      );
      const wasUsedByLinks = links.filter(
        (link) => link.type === "used" && link.target?.id === nodeId
      );
      const derivesLinks = links.filter(
        (link) => link.type === "wasDerivedFrom" && link.target?.id === nodeId
      );

      // Formatto le relazioni per la visualizzazione
      const wasGeneratedBy =
        wasGeneratedByLinks.map((link) => link.source.id).join(", ") || "None";
      const used =
        usedLinks.map((link) => link.target.id).join(", ") || "None";
      const wasDerivedFrom =
        wasDerivedFromLinks.map((link) => link.target.id).join(", ") || "None";
      const wasInformedBy =
        wasInformedByLinks.map((link) => link.source.id).join(", ") || "None";
      const wasAssociatedWith =
        wasAssociatedWithLinks.map((link) => link.source.id).join(", ") || "None";
      const hadMember =
        hadMemberLinks
          .map((link) =>
            link.source?.id === nodeId ? link.target.id : link.source.id
          )
          .join(", ") || "None";
      const wasStartedBy =
        wasStartedByLinks.map((link) => link.source.id).join(", ") || "None";
      const wasAttributedTo =
        wasAttributedToLinks
          .map((link) =>
            link.source?.id === nodeId ? link.target.id : link.source.id
          )
          .join(", ") || "None";

      const generated =
        generatedLinks.map((link) => link.target.id).join(", ") || "None";
      const wasUsedBy =
        wasUsedByLinks.map((link) => link.source.id).join(", ") || "None";
      const derives =
        derivesLinks.map((link) => link.source.id).join(", ") || "None";

      // Restituisco i dettagli del nodo in base alla sua categoria
      if (entityNode) {
        return {
          id: nodeId,
          group: "Entity",
          type: entityNode[0]?.["prov:type"] || "Unknown",
          used,
          wasGeneratedBy,
          wasDerivedFrom,
          wasInformedBy,
          wasAssociatedWith,
          wasStartedBy,
          hadMember,
          wasAttributedTo,
          generated,
          wasUsedBy,
          derives,
        };
      }

      if (activityNode) {
        return {
          id: nodeId,
          group: "Activity",
          type: activityNode["prov:type"] || "Unknown",
          used,
          wasGeneratedBy,
          wasDerivedFrom,
          wasInformedBy,
          wasAssociatedWith,
          wasStartedBy,
          hadMember,
          wasAttributedTo,
          generated,
          wasUsedBy,
          derives,
        };
      }

      if (agentNode) {
        return {
          id: nodeId,
          group: "Agent",
          type: agentNode["prov:type"] || "Unknown",
          used,
          wasGeneratedBy,
          wasDerivedFrom,
          wasInformedBy,
          wasAssociatedWith,
          wasStartedBy,
          hadMember,
          wasAttributedTo,
          generated,
          wasUsedBy,
          derives,
        };
      }

      return null; // Nodo non trovato
    };


    
    return (
        <div className="main-container">
                    <div className="high-row">
                      {configureSearchNode({
                        graphData,
                        setHighlightedNode,
                        setSelectedNode,
                        findNodeDetails,
                      })}
                    </div>

                    <div className="central-row">
                      <JsonLabel setGraphData={setGraphData} />
                      <GraphContainer
                          onNodeClick={handleNodeClick}
                          highlightedNode={highlightedNode}
                          graphData={graphData}
                      />
                      <NodeInfo
                        nodeInfo={selectedNode}
                        searchQuery={searchQuery}
                        onHighlightNode={(nodeId) => {
                          setHighlightedNode(nodeId);

                          // Fetch updated node details for the label
                          const nodeDetails = findNodeDetails(nodeId, graphData);
                          if (nodeDetails) setSelectedNode(nodeDetails);
                        }}
                        onSearch={handleSearch}
                      />   
                    </div>   

                    <div className="low-row">
                    <DownloadsButton />
                    </div>         
        </div>
    );
};

export default Main;