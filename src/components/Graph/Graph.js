// Graph.js
/*
Graph.js: The Graph.js file leverages the D3.js library to create an interactive graph based on 
JSON data. This graph displays nodes, representing entities and activities, and connections 
between them, with three types of relationships. Users can interact with nodes by clicking 
on them or dragging them, and they can zoom in on the entire graph. In addition, nodes can be 
highlighted and focused in response to external events (link label clicks).
*/

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import "./graph.css";


const Graph = ({
  showUsedLinks, // State for showing or hiding the 'used' links
  showWasDerivedFromLinks, // State for showing or hiding the 'wasDerivedFrom' links
  showWasGeneratedByLinks, // State for showing or hiding the 'wasGeneratedBy' links
  showWasInformedByLinks, // State for showing or hiding the 'wasInformedBy' links
  showWasAssociatedWithLinks, // State for showing or hiding the 'wasAssociatedWith' links
  showWasStartedByLinks, // State for showing or hiding the 'wasStartedBy' links
  showWasAttributedTo, // State for showing or hiding the 'wasAttributedTo' links
  showHadMemberLinks, // State for showing or hiding the 'hadMember' links
  onNodeClick, // Callback function for node click events from the graph
  highlightedNode, // ID of the node to highlight and focus on
  showNodeLabels, // State for showing or hiding the node labels
  showLinkLabels, // State for showing or hiding the link labels
  graphData, // JSON data for the graph
  onGraphStats, // Callback function for graph statistics
  nodeDistance, // Force for the distance between nodes
  nodeRepulsion, // Force for the repulsion between nodes
  nodeCollision, // Force for the collision between nodes
  alphaDecay, // Alpha decay for the simulation
}) => {
  let svg; // SVG variable to draw and manipulate the graph with D3.js
  const width = 1200; // Width of the graph
  const height = 800; // Height of the graph
  let nodes = []; // Array to store nodes ()
  const svgRef = useRef(null); // React reference to access and manipulate the SVG element 
  const zoomBehaviorRef = useRef(null); // Stores the zoom configuration for the graph

  // Function to create a rounded rectangle path for the nodes (entities)
  function roundedRectPath(width, height, radius) {
    // Define the corner points of the rectangle with rounded corners
    const x0 = -width / 2;
    const x1 = width / 2;
    const y0 = -height / 2;
    const y1 = height / 2;

    // Return the path for the rounded rectangle
    return `
      M ${x0 + radius},${y0}
      H ${x1 - radius}
      A ${radius},${radius} 0 0 1 ${x1},${y0 + radius}
      V ${y1 - radius}
      A ${radius},${radius} 0 0 1 ${x1 - radius},${y1}
      H ${x0 + radius}
      A ${radius},${radius} 0 0 1 ${x0},${y1 - radius}
      V ${y0 + radius}
      A ${radius},${radius} 0 0 1 ${x0 + radius},${y0}
      Z
    `;
  }

  // Function to create a self-loop path for the nodes that are connected to themselves
  function createSelfLoopPath(d) {
    const nodeRadius = 30; 
    const loopRadiusX = 90; 
    const loopRadiusY = 40;

    const start = {
      x: d.source.x,
      y: d.source.y - nodeRadius,
    };

    
    return `M ${start.x},${start.y}
            A ${loopRadiusX},${loopRadiusY} 0 1,1 ${start.x},${start.y + 1}`;
  }


  // Function to create a rectangle path for the nodes (activities)
  function rectPath(width, height) {
    const x0 = -width / 2;
    const x1 = width / 2;
    const y0 = -height / 2;
    const y1 = height / 2;

    // Return the path for the rectangle
    return `
      M ${x0},${y0}
      L ${x1},${y0}
      L ${x1},${y1}
      L ${x0},${y1}
      Z
    `;
  }

  // Function to create a house path for the nodes (agents)
  function housePath(size) {
    const half = size / 2;

    return `
      M ${-half},0
      L ${-half},${half}
      L ${half},${half}
      L ${half},0
      L 0,${-half}
      Z
    `;
  }

  // 1° useEffect to initialize the graph
  useEffect(() => {
    if (!graphData) return; // Exit if no graph data is provided

    // Function to initialize the graph
    const initializeGraph = () => {
      d3.select("#graphFrame").selectAll("svg").remove(); // Clear the container of any existing SVG
      // Create the zoom behavior for the graph (D3.js)
      zoomBehaviorRef.current = d3
        .zoom()
        .scaleExtent([0.1, 10]) // Set the zoom scale limits
        .on("zoom", (event) => g.attr("transform", event.transform)); // Apply the zoom to the SVG

      // Create the SVG element for the graph
      svg = d3
        .select("#graphFrame")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "graph-svg");

      svgRef.current = svg.node(); // Store the SVG element reference
      svg.call(zoomBehaviorRef.current); // Apply the zoom behavior to the SVG

      // Create a group element for the graph elements
      const g = svg.append("g");

      // Create the arrow markers for the links
      svg
        .append("defs")
        .selectAll("marker")
        .data([
          "used",
          "wasGeneratedBy",
          "wasDerivedFrom",
          "wasInformedBy",
          "hadMember",
          "wasStartedBy",
          "wasAssociatedWith",
          "wasAttributedTo",
        ])
        .join("marker")
        .attr("id", (d) => `arrow-${d}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", (d) => 20) 
        .attr("refY", 0)
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("orient", "auto-start-reverse")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", (d) =>
          d === "used"
            ? "#FDED00"
            : d === "wasGeneratedBy"
            ? "red"
            : d === "wasDerivedFrom"
            ? "#00E572"
            : d === "wasInformedBy"
            ? "#FFAA00"
            : d === "hadMember"
            ? "#00AAFF"
            : d === "wasStartedBy"
            ? "#AA00FF"
            : d === "wasAssociatedWith"
            ? "#FF00FF"
            : d === "wasAttributedTo"
            ? "#FF4500"
            : "#AAFF00"
        );

      // Create an array of nodes based on the graph data
      nodes = [
        ...Object.keys(graphData.entity).map((key) => ({
          id: key,
          group: "entity",
        })),
        ...Object.keys(graphData.activity).map((key) => ({
          id: key,
          group: "activity",
        })),
        ...Object.keys(graphData.agent || {}).map((key) => ({
          // Check if agents exist in the graph data
          id: key,
          group: "agent",
        })),
      ];

      // Update the statistics based on the nodes
      const activityCount = nodes.filter(
        (node) => node.group === "activity"
      ).length;
      const entityCount = nodes.filter(
        (node) => node.group === "entity"
      ).length;
      const agentCount = nodes.filter((node) => node.group === "agent").length;
      const totalNodes = nodes.length;

      // Call the callback function with the graph statistics
      if (onGraphStats) {
        onGraphStats({
          totalNodes,
          activityCount,
          entityCount,
          agentCount,
        });
      }

      // Randomly position the nodes within the graph area
      nodes.forEach((node) => {
        node.x = Math.random() * width;
        node.y = Math.random() * height;
      });

      // Create a map of nodes for easy access by ID
      const nodeMap = new Map(nodes.map((node) => [node.id, node]));

      // Create an array of links based on the graph data
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

      // Create the D3 force simulation for the graph
      const simulation = d3
        .forceSimulation(nodes)
        .force(
          "link",
          d3
            .forceLink(links)
            .id((d) => d.id)
            .distance(nodeDistance)
            .strength(2)
        )
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("charge", d3.forceManyBody().strength(nodeRepulsion))
        .force("collide", d3.forceCollide(nodeCollision))
        .alphaDecay(alphaDecay);

      // Add the links to the graph with arrow markers based on the relationship type (color-coded) 
      const link = g
        .append("g")
        .selectAll("path")
        .data(links)
        .join("path")
        .attr("stroke", (d) =>
          d.type === "used"
            ? "#FDED00"
            : d.type === "wasGeneratedBy"
            ? "red"
            : d.type === "wasDerivedFrom"
            ? "#00E572"
            : d.type === "wasInformedBy"
            ? "#FFAA00"
            : d.type === "hadMember"
            ? "#00AAFF"
            : d.type === "wasStartedBy"
            ? "#AA00FF"
            : d.type === "wasAssociatedWith"
            ? "#FF00FF"
            : d.type === "wasAttributedTo"
            ? "#FF4500"
            : "#AAFF00"
        )
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 1)
        .attr("fill", "none")
        .attr("marker-end", (d) => `url(#arrow-${d.type})`)
        .attr("data-type", (d) => d.type);

      // Add labels to the nodes (initially hidden)
      const nodeLabels = g
        .append("g")
        .attr("class", "node-labels")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("class", "node-label")
        .attr("font-size", 15)
        .attr("dy", -5)
        .attr("fill", "#fff")
        .attr("text-anchor", "middle")
        .text((d) => {
          const id = d.id;
          if (id.length <= 10) return id; // Show full ID if it's short
          return `${id.slice(0, 5)}...${id.slice(-5)}`; // Show a truncated ID if it's long
        })
        .style("display", "none");

      // Add labels to the links (initially hidden)
      const linkLabels = g
        .append("g")
        .attr("class", "link-labels")
        .selectAll("text")
        .data(links)
        .join("text")
        .attr("class", "link-label")
        .attr("font-size", 15)
        .attr("fill", "#fff")
        .attr("text-anchor", "middle")
        .text((d) => d.type)
        .style("display", "none");

      // Add the nodes to the graph with different shapes based on the group (entity, activity, agent)
      const node = g
        .append("g")
        .selectAll("path")
        .data(nodes)
        .join("path")
        .attr("id", (d) => `node-${d.id}`) 
        .attr("class", "node") 
        .attr("d", (d) => {
          if (d.group === "entity") {
            // Rounded rectangle for entities
            return roundedRectPath(40, 30, 15);
          } else if (d.group === "activity") {
            // Rectangle for activities
            return rectPath(40, 30);
          } else {
            // House shape for agents
            return housePath(40);
          }
        })
        .attr(
          "fill",
          (d) =>
            d.group === "entity"
              ? "#33FF57" // Color for entities
              : d.group === "activity"
              ? "#5733FF" // Color for activities
              : d.group === "agent"
              ? "#FF5733" // Color for agents
              : "#cccccc" // Default color
        )
        .attr("stroke", "#000") // Border color
        .attr("stroke-width", 1.5) // Border width

        .on("mouseover", function (event, d) {
          d3.select(this).attr("fill", "#002DF7"); // Change color on mouseover
        })
        .on("mouseout", function (event, d) {
          d3.select(this).attr(
            "fill",
            d.group === "entity"
              ? "#33FF57"
              : d.group === "activity"
              ? "#5733FF"
              : d.group === "agent"
              ? "#FF5733"
              : "#cccccc" // Default
          );
        })
        .on("click", (event, d) => {
          // Reset the style of all nodes (remove the border)
          d3.selectAll(".node")
            .style("stroke", null)
            .style("stroke-width", null);

          // Highlight the selected node (add a white border)
          d3.select(event.currentTarget)
            .style("stroke", "white")
            .style("stroke-width", 3);

          // Get the group (entity or activity) and type information for the node
          const group = d.group === "entity" ? "Entity" : "Activity";
          const typeInfo =
            d.group === "entity"
              ? graphData.entity[d.id]?.[0]?.["prov:type"] || "Unknown"
              : graphData.activity[d.id]?.["prov:type"] || "Unknown";

          // Filter the links based on the selected node
          const wasGeneratedByLinks = links.filter(
            (link) => link.type === "wasGeneratedBy" && link.target?.id === d.id
          );
          const usedLinks = links.filter(
            (link) => link.type === "used" && link.source?.id === d.id
          );
          const wasDerivedFromLinks = links.filter(
            (link) => link.type === "wasDerivedFrom" && link.source?.id === d.id
          );
          const wasInformedByLinks = links.filter(
            (link) => link.type === "wasInformedBy" && link.target?.id === d.id
          );
          const wasAssociatedWithLinks = links.filter(
            (link) =>
              link.type === "wasAssociatedWith" && link.target?.id === d.id
          );
          const wasStartedByLinks = links.filter(
            (link) => link.type === "wasStartedBy" && link.target?.id === d.id
          );
          const hadMemberLinks = links.filter(
            (link) =>
              link.type === "hadMember" &&
              (link.source?.id === d.id || link.target?.id === d.id)
          );
          const wasAttributedToLinks = links.filter(
            (link) =>
              link.type === "wasAttributedTo" &&
              (link.source?.id === d.id || link.target?.id === d.id)
          );

          // Format the relationships for display
          const generatedLinks = links.filter(
            (link) => link.type === "wasGeneratedBy" && link.source?.id === d.id
          );
          const wasUsedByLinks = links.filter(
            (link) => link.type === "used" && link.target?.id === d.id
          );
          const derivesLinks = links.filter(
            (link) => link.type === "wasDerivedFrom" && link.target?.id === d.id
          );

          // Format the relationship information for the selected node
          const wasGeneratedBy =
            wasGeneratedByLinks.map((link) => link.source.id).join(", ") ||
            "None";
          const used =
            usedLinks.map((link) => link.target.id).join(", ") || "None";
          const wasDerivedFrom =
            wasDerivedFromLinks.map((link) => link.target.id).join(", ") ||
            "None";
          const wasInformedBy =
            wasInformedByLinks.map((link) => link.source.id).join(", ") ||
            "None";
          const wasAssociatedWith =
            wasAssociatedWithLinks.map((link) => link.source.id).join(", ") ||
            "None";
          const wasStartedBy =
            wasStartedByLinks.map((link) => link.source.id).join(", ") ||
            "None";
          const hadMember =
            hadMemberLinks
              .map((link) =>
                link.source.id === d.id ? link.target.id : link.source.id
              )
              .join(", ") || "None";
          const wasAttributedTo =
            wasAttributedToLinks
              .map((link) =>
                link.source.id === d.id ? link.target.id : link.source.id
              )
              .join(", ") || "None";

          const generated =
            generatedLinks.map((link) => link.target.id).join(", ") || "None";
          const wasUsedBy =
            wasUsedByLinks.map((link) => link.source.id).join(", ") || "None";
          const derives =
            derivesLinks.map((link) => link.source.id).join(", ") || "None";

          // Call the node click callback function with the node information
          onNodeClick({
            id: d.id,
            group,
            type: typeInfo,
            wasGeneratedBy,
            used,
            wasDerivedFrom,
            wasInformedBy,
            wasAssociatedWith,
            wasStartedBy,
            hadMember,
            wasAttributedTo,
            generated,
            wasUsedBy,
            derives,
          });
        })

        // Drag behavior for the nodes (to move them around) 
        .call(
          d3
            .drag()
            .on("start", (event) => {
              if (!event.active) simulation.alphaTarget(0.3).restart();
              event.subject.fx = event.x;
              event.subject.fy = event.y;
            })
            .on("drag", (event) => {
              event.subject.fx = event.x;
              event.subject.fy = event.y;
            })
            .on("end", (event) => {
              if (!event.active) simulation.alphaTarget(0);
              event.subject.fx = null;
              event.subject.fy = null;
            })
        );

      node.append("title").text((d) => d.id);

      // Update the graph on each tick of the simulation
      simulation.on("tick", () => {
        link.attr("d", (d) => {
          if (d.source === d.target) {
            return createSelfLoopPath(d);
          }
          return `M ${d.source.x},${d.source.y} L ${d.target.x},${d.target.y}`;
        });

        // Update link label positions
        linkLabels
          .attr("x", (d) => {
            if (d.source === d.target) {
              return d.source.x;
            }
            return (d.source.x + d.target.x) / 2;
          })
          .attr("y", (d) => {
            if (d.source === d.target) {
              return d.source.y - 55; 
            }
            return (d.source.y + d.target.y) / 2 - 5;
          })
          .raise();

        
        node.attr("transform", (d) => `translate(${d.x},${d.y})`);

        nodeLabels
          .attr("x", (d) => d.x)
          .attr("y", (d) => d.y - 15)
          .raise();
      });
    };

    // Initialize the graph
    initializeGraph();

    return () => {
      d3.select("#graphFrame").selectAll("svg").remove(); // Pulisci tutto il contenitore
    };
  }, [graphData, nodeDistance, nodeRepulsion, nodeCollision, alphaDecay]);

  // 2° useEffect to manage interactions with the graph (show/hide labels and links)
  useEffect(() => {
    // Toggle node labels
    d3.selectAll(".node-label").style(
      "display",
      showNodeLabels ? "block" : "none"
    );

    // Toggle link labels
    d3.selectAll(".link-label").style(
      "display",
      showLinkLabels ? "block" : "none"
    );

    // Toggle link visibility based on the state
    d3.selectAll('path[data-type="used"]').style(
      "opacity",
      showUsedLinks ? 0 : 1
    );
    d3.selectAll('path[data-type="wasDerivedFrom"]').style(
      "opacity",
      showWasDerivedFromLinks ? 0 : 1
    );
    d3.selectAll('path[data-type="wasGeneratedBy"]').style(
      "opacity",
      showWasGeneratedByLinks ? 0 : 1
    );
    d3.selectAll('path[data-type="wasInformedBy"]').style(
      "opacity",
      showWasInformedByLinks ? 0 : 1
    );
    d3.selectAll('path[data-type="wasAssociatedWith"]').style(
      "opacity",
      showWasAssociatedWithLinks ? 0 : 1
    );
    d3.selectAll('path[data-type="wasStartedBy"]').style(
      "opacity",
      showWasStartedByLinks ? 0 : 1
    );
    d3.selectAll('path[data-type="hadMember"]').style(
      "opacity",
      showHadMemberLinks ? 0 : 1
    );
    d3.selectAll('path[data-type="wasAttributedTo"]').style(
      "opacity",
      showWasAttributedTo ? 0 : 1
    );
  }, [
    showNodeLabels,
    showLinkLabels,
    showUsedLinks,
    showWasDerivedFromLinks,
    showWasGeneratedByLinks,
    showWasInformedByLinks,
    showWasAssociatedWithLinks,
    showWasStartedByLinks,
    showHadMemberLinks,
    showWasAttributedTo,
  ]);

  // 3° useEffect to center the graph on the highlighted node
  useEffect(() => {
    // Function to focus on a specific node in the graph
    const focusOnNode = (nodeId) => {
      if (!nodeId) {
        console.warn("[focusOnNode] No nodeId provided.");
        return;
      }

      try {
        const safeNodeId = nodeId.replace(
          /([!#$%&()*+,./:;<=>?@[\\\]^`{|}~])/g,
          "\\$1"
        );
        const selectedNode = d3.select(`#node-${safeNodeId}`);

        if (selectedNode.empty()) {
          console.warn(
            `[focusOnNode] Node with ID "#node-${safeNodeId}" not found.`
          );
          return;
        }

        // Reset the style of all nodes (remove the border)
        d3.selectAll(".node").style("stroke", null).style("stroke-width", null);
        // Highlight the selected node (add a white border)
        selectedNode.style("stroke", "white").style("stroke-width", 5);

        const nodeData = selectedNode.datum(); // Get the data for the selected node
        // Function to focus on the selected node in the graph
        if (
          nodeData &&
          nodeData.x != null &&
          nodeData.y != null &&
          svgRef.current &&
          zoomBehaviorRef.current
        ) {
          // Get the current transformation and zoom level
          const currentTransform = d3.zoomTransform(svgRef.current);
          const currentZoom = currentTransform.k;

          // Calculate the target zoom level based on the current zoom
          let targetZoom;
          if (currentZoom < 0.5) {
            targetZoom = 1.5;
          } else if (currentZoom > 2) {
            targetZoom = currentZoom;
          } else {
            targetZoom = currentZoom * 1.2;
          }

          // Create a new transformation with the target zoom level
          const transform = d3.zoomIdentity
            .translate(
              width / 2 - nodeData.x * targetZoom,
              height / 2 - nodeData.y * targetZoom
            )
            .scale(targetZoom); // Zoom level

          // Apply the transformation with a smooth transition
          d3.select(svgRef.current)
            .transition()
            .duration(750)
            .call(zoomBehaviorRef.current.transform, transform);
        } else {
          console.error(
            "[focusOnNode] Required references or node data are missing."
          );
        }
      } catch (error) {
        console.error("[focusOnNode] Error:", error);
      }
    };

    // Focus on the highlighted node
    if (highlightedNode) {
      focusOnNode(highlightedNode);
    }
  }, [highlightedNode, svgRef, zoomBehaviorRef]);

  return null;
};

export default Graph;
