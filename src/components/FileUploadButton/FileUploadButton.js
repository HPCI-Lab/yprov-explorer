import React, { useState } from "react";
import "./fileUploadButton.css";
import attachIcon from "./Attach.png";

const FileUploadButton = ({ onFileUpload }) => {
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [error, setError] = useState(null);
  const [apiInput, setApiInput] = useState("");
  const [loading, setLoading] = useState(false);


  const handleButtonClick = () => {
    setShowUploadSection(!showUploadSection);
  };

  const parseJsonContent = (content) => {
    // If content is already an object, return it
    if (typeof content === 'object' && content !== null) {
      return content;
    }

    try {
      // Try to parse if it's a string
      const parsed = JSON.parse(content);
      return parsed;
    } catch (error) {
      console.error("Error parsing JSON content:", error);
      throw new Error("Invalid JSON format");
    }
  };

  const processJsonData = (jsonData) => {
    try {
      // Check if the JSON has a 'result' property that needs parsing
      if (jsonData.result && typeof jsonData.result === 'string') {
        const parsedResult = parseJsonContent(jsonData.result);
        return parsedResult;
      }
      return jsonData;
    } catch (error) {
      console.error("Error processing JSON data:", error);
      throw new Error("Error processing JSON structure");
    }
  };

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

  // Funzione per gestire il caricamento del file dal link
  const handleLinkUpload = async () => {
    if (linkInput.trim() === "") {
      setError("Please enter a valid URL.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(linkInput, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const initialContent = await response.json();
      const processedContent = processJsonData(initialContent);
      
      onFileUpload(linkInput, processedContent);
      setLinkInput("");
      setShowUploadSection(false);
    } catch (error) {
      console.error("Error fetching or processing JSON:", error);
      setError("Failed to load or process JSON from URL. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };


  const handleApiUpload = async () => {
    if (apiInput.trim() === "") {
      setError("Please enter a valid API endpoint.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fullApiUrl = apiInput.startsWith('http')
        ? apiInput.trim()
        : `https://${apiInput.trim()}`;

      const proxyUrl = `http://localhost:3001/proxy?url=${encodeURIComponent(fullApiUrl)}`;
      const response = await fetch(proxyUrl, { headers: { 'Accept': 'application/json' } });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const initialContent = await response.json();
      const parsedContent = initialContent.result && typeof initialContent.result === 'string'
        ? JSON.parse(initialContent.result)
        : initialContent;

      // Passa i dati al genitore
      onFileUpload(fullApiUrl, parsedContent);

      // Aggiorna l'URL per supportare il caricamento diretto
      const encodedUrl = encodeURIComponent(fullApiUrl);
      window.history.replaceState(null, "", `?file=${encodedUrl}`);

      setApiInput("");
      setShowUploadSection(false);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to load or process JSON from API. Please check the endpoint and try again.");
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
              onChange={(e) => setLinkInput(e.target.value)}
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
                onChange={(e) => setApiInput(e.target.value)}
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
