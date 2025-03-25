// Graph.js
/*
Il file Graph.js sfrutta la libreria D3.js per creare un grafo interattivo basato su dati 
JSON. Questo grafo visualizza nodi, che rappresentano entità e attività, e le connessioni 
tra di loro, con tre tipi di relazioni. Gli utenti possono interagire con i nodi cliccandoci 
sopra o trascinandoli, e possono fare zoom sull'intero grafo. Inoltre, i nodi possono essere 
evidenziati e messi a fuoco in risposta a eventi esterni (click sulla label dei link).
*/

import React, { useEffect, useRef } from "react";
import * as d3 from "d3"; // Caricamento della libreria d3
import "./graph.css";

// Definizione del componente React Graph
/*
    - onNodeClick: funzione di callback per gestire il click sui nodi;
    - highlightedNode: ID del nodo da evidenziare, Quando cambia, il grafo si centra su quel nodo;
    - showNodeLabels: booleano per mostrare/nascondere le etichette dei nodi;
    - showLinkLabels: booleano per mostrare/nascondere le etichette dei collegamenti;
    - graphData: dati JSON per costruire il grafo;
    - onGraphStats: funzione di callback per passare le statistiche del grafo al componente infoGraph.
  */

const Graph = ({ showUsedLinks, showWasDerivedFromLinks, showWasGeneratedByLinks, showWasInformedByLinks, showWasAssociatedWithLinks, showWasStartedByLinks, showWasAttributedTo, showHadMemberLinks, onNodeClick, highlightedNode, showNodeLabels, showLinkLabels, graphData, onGraphStats, nodeDistance, nodeRepulsion, nodeCollision, alphaDecay }) => {

  let svg; // Variabile SVG per disegnare e manipolare il grafo con D3.js
  const width = 1200;
  const height = 800;
  let nodes = []; //Array per memorizzare i nodi ()
  const svgRef = useRef(null); // riferimento React per accedere e manipolare l'elemento SVG
  const zoomBehaviorRef = useRef(null); // memorizza la configurazione dello zoom per il grafo

  // Funzione per creare la forma di un rettangolo con angoli arrotondati
  function roundedRectPath(width, height, radius) {
    // Centriamo la forma su (0,0), quindi calcoliamo i "margini"
    const x0 = -width / 2;
    const x1 = width / 2;
    const y0 = -height / 2;
    const y1 = height / 2;

    // Creiamo il path con archi agli angoli (comando 'A' di SVG):
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

  // Funzione per creare un arco ellittico per i collegamenti self-loop (puntano a se stessi)
  function createSelfLoopPath(d) {
    const nodeRadius = 30; // Metà della larghezza del nodo
    const loopRadiusX = 90; // Raggio orizzontale dell'ellisse (aumentato per allungare)
    const loopRadiusY = 40; // Raggio verticale dell'ellisse

    // Calcola il punto di partenza sopra il nodo
    const start = {
      x: d.source.x,
      y: d.source.y - nodeRadius
    };

    // Crea un arco ellittico
    return `M ${start.x},${start.y}
            A ${loopRadiusX},${loopRadiusY} 0 1,1 ${start.x},${start.y + 1}`;
  }


  // Funzione per creare la forma di un rettangolo
  function rectPath(width, height) {
    const x0 = -width / 2;
    const x1 = width / 2;
    const y0 = -height / 2;
    const y1 = height / 2;

    // Classico path di un rettangolo
    return `
      M ${x0},${y0}
      L ${x1},${y0}
      L ${x1},${y1}
      L ${x0},${y1}
      Z
    `;
  }

  // Funzione per creare la forma di una casetta
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


  // 1° useEffect per inizializzare il grafo
  useEffect(() => {
    if (!graphData) return; // Se non ci sono dati, non fare nulla

    // Funzione principale per inizializzare il grafo
    const initializeGraph = () => {
      d3.select("#graphFrame").selectAll("svg").remove(); // Pulisci il contenitore SVG

      // definizione comportamento dello zoom
      zoomBehaviorRef.current = d3
        .zoom()
        .scaleExtent([0.1, 10]) // Limita il livello di zoom
        .on("zoom", (event) => g.attr("transform", event.transform)); // Applica la trasformazione allo zoom

      // Crea l'elemento SVG per il grafo (d3)
      svg = d3
        .select("#graphFrame")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "graph-svg");

      svgRef.current = svg.node(); // Salva il nodo SVG per accedervi direttamente
      svg.call(zoomBehaviorRef.current); // Applica lo zoom all'SVG

      // Crea il gruppo principale per il grafo (contiene tutti gli elementi)
      const g = svg.append("g");

      // Definisce le frecce per i collegamenti
      svg
        .append("defs")
        .selectAll("marker")
        .data(["used", "wasGeneratedBy", "wasDerivedFrom", "wasInformedBy", "hadMember", "wasStartedBy", "wasAssociatedWith", "wasAttributedTo"])
        .join("marker")
        .attr("id", (d) => `arrow-${d}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", (d) => 20) // Valore per collegamenti normali
        .attr("refY", 0)
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("orient", "auto-start-reverse") // Modifica qui per orientare correttamente la freccia
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", (d) =>
          d === "used" ? "#FDED00" :
            d === "wasGeneratedBy" ? "red" :
              d === "wasDerivedFrom" ? "#00E572" :
                d === "wasInformedBy" ? "#FFAA00" :
                  d === "hadMember" ? "#00AAFF" :
                    d === "wasStartedBy" ? "#AA00FF" :
                      d === "wasAssociatedWith" ? "#FF00FF" :
                        d === "wasAttributedTo" ? "#FF4500" :
                          "#AAFF00"
        );


      // Crea i nodi in base al file Json (Attivita e Entita)
      nodes = [
        ...Object.keys(graphData.entity).map((key) => ({
          id: key,
          group: "entity",
        })),
        ...Object.keys(graphData.activity).map((key) => ({
          id: key,
          group: "activity",
        })),
        ...Object.keys(graphData.agent || {}).map((key) => ({ // Controlla se 'agent' esiste
          id: key,
          group: "agent",
        })),
      ];

      // Calcola le statistiche del grafo
      const activityCount = nodes.filter((node) => node.group === "activity").length;
      const entityCount = nodes.filter((node) => node.group === "entity").length;
      const agentCount = nodes.filter((node) => node.group === "agent").length;
      const totalNodes = nodes.length;

      // Passa le statistiche aggiornate al componente InfoGraph
      if (onGraphStats) {
        onGraphStats({
          totalNodes,
          activityCount,
          entityCount,
          agentCount,
        });
      }

      // Aggiorna le posizioni iniziali dei nodi
      nodes.forEach((node) => {
        node.x = Math.random() * width;
        node.y = Math.random() * height;
      });

      // Crea una mappa chiave valore per trovare rapidamente i nodi usando il loro ID
      const nodeMap = new Map(nodes.map((node) => [node.id, node]));

      // Creazione dei collegamenti tra i nodi
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
          source: nodeMap.get(rel["prov:usedEntity"]),
          target: nodeMap.get(rel["prov:generatedEntity"]),
          type: "wasDerivedFrom",
        })),
        ...Object.values(graphData.wasDerivedFrom || {}).map((rel) => ({
          source: nodeMap.get(rel["prov:activity"]),
          target: nodeMap.get(rel["prov:generatedEntity"]),
          type: "wasGeneratedBy",
        })),
        ...Object.values(graphData.wasDerivedFrom || {}).map((rel) => ({
          source: nodeMap.get(rel["prov:activity"]),
          target: nodeMap.get(rel["prov:usedEntity"]),
          type: "used",
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



      // Configura la simulazione con le forze personalizzate
      const simulation = d3
        .forceSimulation(nodes)
        .force(
          "link",
          d3.forceLink(links).id((d) => d.id).distance(nodeDistance).strength(2)
        )
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("charge", d3.forceManyBody().strength(nodeRepulsion))
        .force("collide", d3.forceCollide(nodeCollision))
        .alphaDecay(alphaDecay);


      // Disegna i collegamenti
      const link = g
        .append("g")
        .selectAll("path")
        .data(links)
        .join("path")
        .attr("stroke", (d) =>
          d.type === "used" ? "#FDED00" :
            d.type === "wasGeneratedBy" ? "red" :
              d.type === "wasDerivedFrom" ? "#00E572" :
                d.type === "wasInformedBy" ? "#FFAA00" :
                  d.type === "hadMember" ? "#00AAFF" :
                    d.type === "wasStartedBy" ? "#AA00FF" :
                      d.type === "wasAssociatedWith" ? "#FF00FF" :
                        d.type === "wasAttributedTo" ? "#FF4500" :
                          "#AAFF00"
        )
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 1)
        .attr("fill", "none")
        .attr("marker-end", (d) => `url(#arrow-${d.type})`)
        .attr("data-type", (d) => d.type);



      // Aggiungi etichette ai collegamenti (inizialmente nascoste)
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
          if (id.length <= 10) return id; // se l'id è breve, mostra tutto
          return `${id.slice(0, 5)}...${id.slice(-5)}`; // altrimenti mostra solo l'inizio e la fine
        })
        .style("display", "none");

      // Aggiungi etichette ai collegamenti (inizialmente nascoste)
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

      // Disegna i nodi con forme diverse
      const node = g
        .append("g")
        .selectAll("path")
        .data(nodes)
        .join("path")
        .attr("id", (d) => `node-${d.id}`) // ID univoco
        .attr("class", "node") // Classe comune
        .attr("d", (d) => {
          if (d.group === "entity") {
            // Rettangolo con angoli arrotondati
            return roundedRectPath(40, 30, 15);
          } else if (d.group === "activity") {
            // Rettangolo normale
            return rectPath(40, 30);
          } else {
            // Casetta
            return housePath(40);
          }
        })
        .attr("fill", (d) =>
          d.group === "entity"
            ? "#33FF57"// Colore per entity
            : d.group === "activity"
              ? "#5733FF" // Colore per activity
              : d.group === "agent"
                ? "#FF5733"  // Colore per agent
                : "#cccccc" // Colore di default per gruppi sconosciuti
        )
        .attr("stroke", "#000") // Contorno nero
        .attr("stroke-width", 1.5) //spessore contorno

        .on("mouseover", function (event, d) {
          d3.select(this).attr("fill", "#002DF7"); // Cambia colore al passaggio del mouse
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
          // Resettare lo stile di tutti i nodi
          d3.selectAll(".node")
            .style("stroke", null)
            .style("stroke-width", null);
        
          // Evidenzia il nodo selezionato
          d3.select(event.currentTarget)
            .style("stroke", "white")
            .style("stroke-width", 3);
        
          // Estrai le informazioni del nodo selezionato
          const group = d.group === "entity" ? "Entity" : "Activity";
          const typeInfo =
            d.group === "entity"
              ? graphData.entity[d.id]?.[0]?.["prov:type"] || "Unknown"
              : graphData.activity[d.id]?.["prov:type"] || "Unknown";
        
          // Filtra i collegamenti per tipo e per ruolo (in base al lato in cui compare il nodo)
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
            (link) => link.type === "wasAssociatedWith" && link.target?.id === d.id
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
        
          // Relazioni inverse (quando il nodo compare sul lato opposto)
          const generatedLinks = links.filter(
            (link) => link.type === "wasGeneratedBy" && link.source?.id === d.id
          );
          const wasUsedByLinks = links.filter(
            (link) => link.type === "used" && link.target?.id === d.id
          );
          const derivesLinks = links.filter(
            (link) => link.type === "wasDerivedFrom" && link.target?.id === d.id
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
          const wasStartedBy =
            wasStartedByLinks.map((link) => link.source.id).join(", ") || "None";
          const hadMember =
            hadMemberLinks
              .map((link) => (link.source.id === d.id ? link.target.id : link.source.id))
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
        
          // Passa le informazioni del nodo selezionato alla callback
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
        

        // Aggiunge il comportamento di trascinamento ai nodi del grafo
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

      // Tooltip per i nodi
      node.append("title").text((d) => d.id);

      // Simulazione: aggiornamento delle posizioni
      simulation.on("tick", () => {
        // Aggiorna posizioni dei collegamenti
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
              return d.source.y - 55; // Aumentato per adattarsi all'ellisse più grande
            }
            return (d.source.y + d.target.y) / 2 - 5;
          })
          .raise();

        // Update node positions
        node.attr("transform", (d) => `translate(${d.x},${d.y})`);

        // Update node label positions
        nodeLabels.attr("x", (d) => d.x).attr("y", (d) => d.y - 15).raise();;
      });
    };

    // Inizializza il grafo
    initializeGraph();

    return () => {
      d3.select("#graphFrame").selectAll("svg").remove(); // Pulisci tutto il contenitore
    };
  }, [graphData, nodeDistance, nodeRepulsion, nodeCollision, alphaDecay]);


  // 2° useEffect per gestire le interazioni con il grafo (mostrare/nascondere etichette e collegamenti)
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

    // Aggiorna i selettori da 'line' a 'path'
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
    showWasAttributedTo
  ]);



  // 3° useEffect per centrare il grafo sul nodo evidenziato
  useEffect(() => {
    // Funzione per centrare il grafo sul nodo evidenziato
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

        // Resettare lo stile di tutti i nodi (rimuovere il bordo)
        d3.selectAll(".node").style("stroke", null).style("stroke-width", null);
        // Evidenzia il nodo selezionato (aggiungi bordo bianco)
        selectedNode.style("stroke", "white").style("stroke-width", 5);

        const nodeData = selectedNode.datum(); // Prende i dati del nodo selezionato
        // Se i dati del nodo sono validi e ci sono riferimenti SVG e zoomBehavior
        if (
          nodeData &&
          nodeData.x != null &&
          nodeData.y != null &&
          svgRef.current &&
          zoomBehaviorRef.current
        ) {
          // Calcola il livello di zoom corrente
          const currentTransform = d3.zoomTransform(svgRef.current);
          const currentZoom = currentTransform.k;

          // Definisci il livello di zoom target (in base al livello di zoom corrente)
          let targetZoom;
          if (currentZoom < 0.5) {
            targetZoom = 1.5;
          } else if (currentZoom > 2) {
            targetZoom = currentZoom;
          } else {
            targetZoom = currentZoom * 1.2;
          }

          // Calcola la trasformazione per centrarsi sul nodo selezionato
          const transform = d3.zoomIdentity
            .translate(
              width / 2 - nodeData.x * targetZoom,
              height / 2 - nodeData.y * targetZoom
            )
            .scale(targetZoom); // Applica il livello di zoom target

          // Applica la trasformazione con animazione
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

    // Se c'è un nodo evidenziato, centrati su di esso
    if (highlightedNode) {
      focusOnNode(highlightedNode);
    }
  }, [highlightedNode, svgRef, zoomBehaviorRef]);

  return null;
};

export default Graph;
