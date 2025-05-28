// Main.js
/*
Main.js: This file defines the main component of the application, which manages the visualization and interaction between the graph, 
Node details and search tools. Uses states to plot selected, highlighted nodes and graph data.
Includes functionality to synchronize nodes with browser history and supports URL browsing. 
*/

import React, { useState, useEffect } from "react";
import "./main.css";
import GraphContainer from "../components/GraphContainer/GraphContainer.js";
import NodeInfo from "../components/NodeInfo/NodeInfo.js";
import JsonLabel from "../components/JsonLabel/JsonLabel.js";
import DownloadsButton from "../components/DownloadsButton/DownloadsButton.js";
import { configureSearchNode } from "../components/SearchNode/SearchNode";
import { unifiedFileLoader } from "../server/unified-loader.js";

const Main = () => {
  // State for the selected node
  const [selectedNode, setSelectedNode] = useState(null);
  // State for the highlighted node
  const [highlightedNode, setHighlightedNode] = useState(null);
  // State for the search query
  const [searchQuery, setSearchQuery] = useState("");
  // State for the graph data
  const [graphData, setGraphData] = useState(null);
  // State for the file URL
  const [fileUrl, setFileUrl] = useState(null);

  // Function to handle node click
  const handleNodeClick = (nodeInfo) => {
    setSelectedNode(nodeInfo); // Set the selected node
    setHighlightedNode(nodeInfo.id); // Highlight the selected node

    // Update the browser history with the node ID
    const currentUrl = fileUrl
      ? `?file=${encodeURIComponent(fileUrl)}#${nodeInfo.id}`
      : `#${nodeInfo.id}`;

    const currentState = window.history.state || {};
    if (currentState.idNodo !== nodeInfo.id) {
      window.history.pushState({ idNodo: nodeInfo.id }, "", currentUrl);
    }
  };

  // Function to handle search
  const handleSearch = (query) => {
    setSearchQuery(query); // Set the search query
  };

  // Function to find node details in the graph data
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
        }
      }
    };

    loadFromUrl();
  }, []); // Effect runs only on mount

  
  // Function to synchronize the node with the browser history
  useEffect(() => {
    // Function to sync node with history
    const syncNodeWithHistory = (event) => {
      const nodeId = event?.state?.idNodo || window.location.hash.substring(1); // Get the node ID from the URL

      // If the node ID and graph data are available 
      if (nodeId && graphData) {
        const nodeDetails = findNodeDetails(nodeId, graphData); // Find the node details
        if (nodeDetails) {
          setSelectedNode(nodeDetails); // Set the selected node
          setHighlightedNode(nodeId); // Highlight the selected node
        }
      }
    };

    // Function to sync initial node 
    const syncInitialNode = () => {
      const initialNodeId = window.location.hash.substring(1); // Get the initial node ID from the URL
      if (initialNodeId && graphData) {
        const initialNodeDetails = findNodeDetails(initialNodeId, graphData); // Find the initial node details
        if (initialNodeDetails) {
          setSelectedNode(initialNodeDetails); // Set the selected node
          setHighlightedNode(initialNodeId); // Highlight the selected node
          // Update the browser history with the initial node ID
          window.history.replaceState(
            { idNodo: initialNodeId },
            "",
            `#${initialNodeId}`
          );
        }
      }
    };

    // Add listener to sync node with history
    window.addEventListener("popstate", syncNodeWithHistory);

    // Sync initial node
    syncInitialNode();

    // Cleanup function to remove the listener when the component is unmounted
    return () => {
      window.removeEventListener("popstate", syncNodeWithHistory);
    };
  }, [graphData]); // Effect runs when the graph data changes

  // Function to find node details in the graph data
  const findNodeDetails = (nodeId, graphData) => {
    if (!graphData) return null;

    // Obtain the node details from the graph data
    const entityNode = graphData.entity[nodeId];
    const activityNode = graphData.activity[nodeId];
    const agentNode = graphData.agent ? graphData.agent[nodeId] : null;

    // Create a map of nodes for easy access
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

    // Create an array of links based on the graph data
      const links = [
        /**
         * The wasDerivedFrom relationship can be splitted into three: wasDerivedFrom, wasGeneratedBy and used
         * "wasDerivedFrom": {
         *  "": {
         *    "prov:generatedEntity": "",
         *    "prov:usedEntity": "",
         *    "prov:activity": ""
         * },
         */
        ...Object.values(graphData.wasDerivedFrom || {}).map((rel) => ({
          source: nodeMap.get(rel["prov:generatedEntity"]),
          target: nodeMap.get(rel["prov:usedEntity"]),
          type: "wasDerivedFrom",
        })),
        ...Object.values(graphData.wasDerivedFrom || {}).map((rel) => ({
          source: nodeMap.get(rel["prov:generatedEntity"]),
          target: nodeMap.get(rel["prov:activity"]),
          type: "wasGeneratedBy",
        })),
        ...Object.values(graphData.wasDerivedFrom || {}).map((rel) => ({
          source: nodeMap.get(rel["prov:activity"]),
          target: nodeMap.get(rel["prov:usedEntity"]),
          type: "used",
        })),
        ...Object.values(graphData.wasGeneratedBy || {}).map((rel) => ({
          source: nodeMap.get(rel["prov:entity"]),
          target: nodeMap.get(rel["prov:activity"]),
          type: "wasGeneratedBy",
        })),
        ...Object.values(graphData.used || {}).map((rel) => ({
          source: nodeMap.get(rel["prov:activity"]),
          target: nodeMap.get(rel["prov:entity"]),
          type: "used",
        })),
        ...Object.values(graphData.wasInformedBy || {}).map((rel) => ({
          source: nodeMap.get(rel["prov:informed"]),
          target: nodeMap.get(rel["prov:informant"]),
          type: "wasInformedBy",
        })),
        ...Object.values(graphData.hadMember || {}).map((rel) => ({
          source: nodeMap.get(rel["prov:collection"]),
          target: nodeMap.get(rel["prov:entity"]),
          type: "hadMember",
        })),
        ...Object.values(graphData.wasStartedBy || {}).map((rel) => ({
          source: nodeMap.get(rel["prov:activity"]),
          target: nodeMap.get(rel["prov:trigger"]),
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

    // Filter the links based on the selected node

    const wasGeneratedBy = links.filter(
      (link) => link.type === "wasGeneratedBy" && link.source?.id === nodeId
    ).map(
      (link) => link.target.id
    ).join(", ") || "None";
    
    const used = links.filter(
      (link) => link.type === "used" && link.source?.id === nodeId
    ).map(
      (link) => link.target.id
    ).join(", ") || "None";
    
    const wasDerivedFrom = links.filter(
      (link) => link.type === "wasDerivedFrom" && link.source?.id === nodeId
    ).map(
      (link) => link.target.id
    ).join(", ") || "None";

    const wasInformedBy = links.filter(
      (link) => link.type === "wasInformedBy" && link.source?.id === nodeId
    ).map(
      (link) => link.target.id
    ).join(", ") || "None";

    const wasAssociatedWith = links.filter(
      (link) => link.type === "wasAssociatedWith" && link.source?.id === nodeId
    ).map(
      (link) => link.target.id
    ).join(", ") || "None";

    const wasStartedBy = links.filter(
      (link) => link.type === "wasStartedBy" && link.source?.id === nodeId
    ).map(
      (link) => link.target.id
    ).join(", ") || "None";
    
    const hadMember = links.filter(
      (link) => link.type === "hadMember" && link.source?.id === nodeId
    ).map(
      (link) => link.target.id
    ).join(", ") || "None";

    const wasAttributedTo = links.filter(
      (link) => link.type === "wasAttributedTo" && link.source?.id === nodeId
    ).map(
      (link) => link.target.id
    ).join(", ") || "None";

    // Inverse relationships links
    const generated = links.filter(
      (link) => link.type === "wasGeneratedBy" && link.target?.id === nodeId
    ).map(
      (link) => link.source.id
    ).join(", ") || "None";
    
    const wasUsedBy = links.filter(
      (link) => link.type === "used" && link.target?.id === nodeId
    ).map(
      (link) => link.source.id
    ).join(", ") || "None";
    
    const derives = links.filter(
      (link) => link.type === "wasDerivedFrom" && link.target?.id === nodeId
    ).map(
      (link) => link.source.id
    ).join(", ") || "None";

    // Return the node details based on the node type (Entity, Activity, Agent)
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

    return null; // Return null if the node details are not found
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
