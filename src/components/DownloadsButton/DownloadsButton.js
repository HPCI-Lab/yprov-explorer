import React from "react";
import "./downloadsButton.css";
import downloadIcon from "./download.png";

const DownloadsButton = ({ graphContainerId = "graphFrame", fileName = "graph" }) => {
  // Funzione per scaricare uno screenshot del grafo
  const handleDownload = () => {
    const graphElement = document.getElementById(graphContainerId); // Seleziona il contenitore del grafo
  
    if (graphElement) {
      const svgElement = graphElement.querySelector("svg");
  
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);
  
        img.onload = () => {
          canvas.width = svgElement.clientWidth;
          canvas.height = svgElement.clientHeight;
  
          ctx.fillStyle = "#181424"; // Colore dello sfondo del grafo
          ctx.fillRect(0, 0, canvas.width, canvas.height); // Disegna il rettangolo di sfondo
  
          // Disegna il grafo sopra lo sfondo
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
  
          // Scarica il file PNG
          const link = document.createElement("a");
          link.download = `${fileName}_screenshot.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
        };
  
        img.src = url;
      } else {
        console.error("SVG element not found inside the graph container.");
      }
    } else {
      console.error("Graph container not found.");
    }
  };
  

  // Funzione per scaricare il grafo in formato SVG 
  const handleDownloadSVG = () => {
    const graphElement = document.getElementById(graphContainerId);
    if (graphElement) {
      const svgElement = graphElement.querySelector("svg").cloneNode(true);
  
      if (svgElement) {
        // Aggiunge un rettangolo di sfondo all'inizio dell'SVG
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("width", "100%");
        rect.setAttribute("height", "100%");
        rect.setAttribute("fill", "#181424"); // Imposta il colore dello sfondo
  
        svgElement.insertBefore(rect, svgElement.firstChild); // Inserisce il rettangolo come primo elemento
  
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);
  
        // Scarica il file SVG
        const link = document.createElement("a");
        link.download = `${fileName}_graph.svg`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        console.error("SVG element not found inside the graph container.");
      }
    } else {
      console.error("Graph container not found.");
    }
  };
  

  return (
    <div className="button-container">
      <button className="download-button" onClick={handleDownload}>
        <img src={downloadIcon} alt="Download Icon" className="download-icon" />
        Download PNG
      </button>
      <button className="download-button" onClick={handleDownloadSVG}>
        <img src={downloadIcon} alt="Download Icon" className="download-icon" />
        Download SVG
      </button>
    </div>
  );
};

export default DownloadsButton;
