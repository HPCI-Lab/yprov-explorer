/* 
DownloadsButton.js: Component that provides two buttons that allow downloading the graph.
Specifically, it allows the graph to be exported either as a PNG image or an SVG file.
It is useful in contexts where you want to offer users the option of saving the displayed data in image or vector format.

*/

import React from "react";
import "./downloadsButton.css";
import downloadIcon from "./download.png";

const DownloadsButton = ({
  graphContainerId = "graphFrame", 
  fileName = "graph",
}) => {

  // Function to download a screenshot of the graph in PNG format
  const handleDownload = () => {
    const graphElement = document.getElementById(graphContainerId); // Seleziona il contenitore del grafo

    if (graphElement) {
      // Search for the SVG element within the container
      const svgElement = graphElement.querySelector("svg");

      if (svgElement) {
        // Serialize the SVG element to a string
        const svgData = new XMLSerializer().serializeToString(svgElement);
        // Create a canvas element for drawing the graph and a 2D context
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        // Create an image element to load the SVG data
        const img = new Image();
        // Convert the SVG data to a Blob object (binary data for the image)
        const svgBlob = new Blob([svgData], {
          type: "image/svg+xml;charset=utf-8",
        });
        // Create a URL for the Blob object
        const url = URL.createObjectURL(svgBlob);

        // Load the SVG data into the image element
        img.onload = () => {
          canvas.width = svgElement.clientWidth; // Set the canvas width to the SVG width
          canvas.height = svgElement.clientHeight; // Set the canvas height to the SVG height

          ctx.fillStyle = "#f9f9f9"; // Set the background color
          ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the canvas with the background color

          // Draw the SVG image on the canvas
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);

          // Download the canvas as a PNG image
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


  // Function to download the graph in SVG format
  const handleDownloadSVG = () => {
    const graphElement = document.getElementById(graphContainerId);
    if (graphElement) {
      const svgElement = graphElement.querySelector("svg").cloneNode(true);

      if (svgElement) {
        // Add a white background to the SVG image
        const rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        rect.setAttribute("width", "100%"); // Set the width to 100%
        rect.setAttribute("height", "100%"); // Set the height to 100%
        rect.setAttribute("fill", "#f9f9f9"); // Set the background color

        // Insert the white background rectangle at the beginning of the SVG element
        svgElement.insertBefore(rect, svgElement.firstChild);

        // Serialize the SVG element to a string
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], {
          type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(svgBlob);

        // Download the SVG file
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

  // Render the component with two buttons for downloading the graph
  return (
    <div className="button-container">
      {/* Button to download the graph as a PNG image */}
      <button className="download-button" onClick={handleDownload}>
        <img src={downloadIcon} alt="Download Icon" className="download-icon" />
        Download PNG
      </button>
      {/* Button to download the graph as an SVG file */}
      <button className="download-button" onClick={handleDownloadSVG}>
        <img src={downloadIcon} alt="Download Icon" className="download-icon" />
        Download SVG
      </button>
    </div>
  );
};

export default DownloadsButton;
