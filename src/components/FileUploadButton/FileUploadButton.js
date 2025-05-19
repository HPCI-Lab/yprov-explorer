/*
FileUploadButton.js: Component that allows the user to upload JSON files in various ways: by direct upload from the computer, 
by providing a URL, or by specifying an API endpoint. Handles reading, validation, and parsing of JSON content.
*/

import React, { useState, useRef } from "react";
import "./fileUploadButton.css";
import attachIcon from "./Attach.png";

const FileUploadButton = ({ onFileUpload }) => {
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [error, setError] = useState(null);
  const [apiInput, setApiInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Refs to store the current input values
  const linkInputRef = useRef("");
  const apiInputRef = useRef("");

  // Handler for showing/hiding the upload section
  const handleButtonClick = () => {
    setShowUploadSection(!showUploadSection);
    setError(null);
  };

  // Function to parse JSON content, handling both objects and strings
  const parseJsonContent = (content) => {
    if (typeof content === "object" && content !== null) {
      return content;
    }
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error("Error parsing JSON content:", error);
      throw new Error("Invalid JSON format");
    }
  };

  // Function to process the JSON data, handling a potential 'result' field
  const processJsonData = (jsonData) => {
    try {
      if (jsonData.result && typeof jsonData.result === "string") {
        return parseJsonContent(jsonData.result);
      }
      return jsonData;
    } catch (error) {
      console.error("Error processing JSON data:", error);
      throw new Error("Error processing JSON structure");
    }
  };

  // Handler for file upload from the computer
  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile && uploadedFile.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const initialContent = parseJsonContent(event.target.result);
          const processedContent = processJsonData(initialContent);
          onFileUpload(uploadedFile.name, processedContent);
          setError(null);
        } catch (error) {
          setError(error.message);
        }
      };
      reader.readAsText(uploadedFile);
    } else {
      setError("Please upload a valid JSON file.");
    }
  };

  // Handler for uploading JSON via URL
  const handleLinkUpload = async () => {
    // Use the value from the ref, which always contains the updated value
    const currentLinkInput = linkInputRef.current.trim();
    if (currentLinkInput === "") {
      setError("Please enter a valid URL.");
      return;
    }
    console.log("URL upload initiated, linkInput:", currentLinkInput);
    setLoading(true);
    setError(null);
    try {
      const fullUrl = currentLinkInput.startsWith("http")
        ? currentLinkInput
        : `https://${currentLinkInput}`;
      const response = await fetch(fullUrl, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const initialContent = await response.json();
      const processedContent = processJsonData(initialContent);
      onFileUpload(fullUrl, processedContent);
      const encodedUrl = encodeURIComponent(fullUrl);
      window.history.replaceState(null, "", `?file=${encodedUrl}`);
      setLinkInput("");
      setShowUploadSection(false);
    } catch (error) {
      console.error("Error fetching or processing JSON:", error);
      setError("Failed to load or process JSON from URL. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handler for uploading JSON via API endpoint
  const handleApiUpload = async () => {
    // Use the value from the ref, which always contains the updated value
    const currentApiInput = apiInputRef.current.trim();
    if (currentApiInput === "") {
      setError("Please enter a valid API endpoint.");
      return;
    }
    console.log("API upload initiated, apiInput:", currentApiInput);
    setLoading(true);
    setError(null);
    try {
      const fullApiUrl = currentApiInput.startsWith("http")
        ? currentApiInput
        : `https://${currentApiInput}`;
      console.log("Fetching from API URL:", fullApiUrl);
      const proxyUrl = `./proxy?url=${encodeURIComponent(fullApiUrl)}`;
      console.log("Using proxy URL:", proxyUrl);
      const response = await fetch(proxyUrl, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const initialContent = await response.json();
      const parsedContent =
        initialContent.result && typeof initialContent.result === "string"
          ? JSON.parse(initialContent.result)
          : initialContent;
      onFileUpload(fullApiUrl, parsedContent);
      const encodedUrl = encodeURIComponent(fullApiUrl);
      window.history.replaceState(null, "", `?file=${encodedUrl}`);
      setApiInput("");
      setShowUploadSection(false);
    } catch (error) {
      console.error("Error:", error);
      setError(
        `Failed to load or process JSON from API: ${error.message}. Please check the endpoint and try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="file-upload-container" style={{ position: "relative" }}>
      <button className="upload-button" onClick={handleButtonClick}>
        <img src={attachIcon} alt="Attach Icon" className="attach-icon" />
      </button>

      {showUploadSection && (
        <div className="upload-section">
          <h3>Upload a JSON file</h3>

          {/* File Upload Section */}
          <div className="upload-method">
            <h4>Upload from Computer</h4>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="file-input"
            />
          </div>

          {/* URL Upload Section */}
          <div className="upload-method">
            <h4>Upload from URL</h4>
            <input
              type="text"
              value={linkInput}
              onChange={(e) => {
                const newValue = e.target.value;
                console.log("URL changed to:", newValue);
                setLinkInput(newValue);
                // Aggiorna anche il ref
                linkInputRef.current = newValue;
              }}
              onBlur={(e) => {
                // Assicurati che il ref sia aggiornato quando l'input perde il focus
                linkInputRef.current = e.target.value;
              }}
              placeholder="Enter JSON file URL"
              className="link-input"
            />
            <button
              onClick={handleLinkUpload}
              disabled={loading}
              className="upload-btn"
            >
              {loading ? "Loading..." : "Upload from URL"}
            </button>
          </div>

          {/* API Upload Section */}
          <div className="upload-method">
            <h4>Enter from API</h4>
            <input
              type="text"
              value={apiInput}
              onChange={(e) => {
                const newValue = e.target.value;
                console.log("API endpoint changed to:", newValue);
                setApiInput(newValue);
                // Aggiorna anche il ref
                apiInputRef.current = newValue;
              }}
              onBlur={(e) => {
                // Assicurati che il ref sia aggiornato quando l'input perde il focus
                apiInputRef.current = e.target.value;
              }}
              placeholder="Enter API endpoint"
              className="link-input"
            />
            <button
              onClick={handleApiUpload}
              disabled={loading}
              className="upload-btn"
            >
              {loading ? "Loading..." : "Upload from API"}
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default FileUploadButton;