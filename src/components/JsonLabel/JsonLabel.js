// JsonLabel.js
/*
Questo file consente agli utenti di caricare e visualizzare un file JSON. Utilizza stati interni per gestire il nome del file 
caricato, il contenuto JSON e la visibilità di una finestra di caricamento. L'utente può selezionare un file JSON tramite un 
pulsante di upload, che legge e analizza il contenuto del file, aggiornando lo stato e passando i dati al componente genitore 
tramite setGraphData. Il contenuto JSON viene mostrato in un formato leggibile all'interno di una finestra scorrevole, con ogni 
riga visualizzata separatamente. Se non è stato caricato alcun file, mostra un messaggio predefinito.
*/

import React, { useState, useEffect} from "react";
import "./jsonLabel.css";
import FileUploadButton from "../FileUploadButton/FileUploadButton";
import { unifiedFileLoader } from '../../unified-loader';

/*
 - setGraphData: funzione per passare i dati JSON al componente Graph.js per la visualizzazione del grafo
*/
const JsonLabel = ({ setGraphData }) => {
  const [fileName, setFileName] = useState(null); // Stato per il nome del file caricato
  const [jsonContent, setJsonContent] = useState(null); // Stato per il contenuto JSON del file caricato
  const [showUploadBox, setShowUploadBox] = useState(false); // Stato per la visibilità della finestra di caricamento

  const getQueryParam = (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  };

  // Funzione per gestire il caricamento del file JSON
  const handleFileUpload = (name, content) => {
    let parsedContent = content;

    // Verifica se esiste la proprietà "result" e se è una stringa
    if (content.result && typeof content.result === "string") {
      try {
        parsedContent = JSON.parse(content.result);
      } catch (error) {
        console.error("Error parsing 'result' field:", error);
        alert("Invalid 'result' field in JSON file.");
        return;
      }
    }
    setFileName(name); // Salva il nome del file caricato nello stato
    setJsonContent(content); // Salva il contenuto JSON originale nello stato
    setShowUploadBox(false); // Nasconde la finestra di caricamento    
    setJsonContent(JSON.stringify(content, null, 2).split("\n")); // Formatta il JSON con indentazione e lo divide in righe
    setGraphData(content); // Passa il contenuto JSON al componente genitore tramite setGraphData
    const encodedUrl = encodeURIComponent(name); // Codifica l'URL del file
    window.history.replaceState(null, "", `?file=${encodedUrl}`); // Aggiorna l'URL
  };

  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return `${text.substring(0, maxLength)}...`; // Trunca il testo e aggiunge "..."
    }
    return text;
  };

  // Carica il contenuto del file JSON all'avvio
  useEffect(() => {
    const loadContent = async () => {
      const fileUrl = getQueryParam("file");
      if (!fileUrl) return;
  
      try {
        // Decodifica l'URL per gestire caratteri speciali
        const decodedUrl = decodeURIComponent(fileUrl);
        
        // Verifica se è un URL completo o un nome file
        const isFullUrl = decodedUrl.startsWith('http://') || decodedUrl.startsWith('https://');
        
        let result;
        if (isFullUrl) {
          // Per URL completi, passa l'URL decodificato direttamente
          result = await unifiedFileLoader(decodedUrl);
        } else {
          // Per file locali/API, passa l'URL come ricevuto
          result = await unifiedFileLoader(fileUrl);
        }
  
        // Verifica che result.data esista
        if (!result || !result.data) {
          throw new Error('Invalid data format received');
        }
  
        // Aggiorna il nome del file
        setFileName(decodedUrl);
        
        // Formatta e imposta il contenuto JSON
        const formattedContent = JSON.stringify(result.data, null, 2).split("\n");
        setJsonContent(formattedContent);
        
        // Aggiorna i dati del grafo
        setGraphData(result.data);
        
      } catch (error) {
        console.error("Error loading JSON content:", error);
        setJsonContent(["Error loading JSON content. Please try again."]);
        setFileName("Error loading file");
      }
    };
  
    loadContent();
  }, [setGraphData]);
  
  
  return (
    <div className="json-label-container">
      {/* Intestazione con il nome del file e pulsante di upload */}
      <div className="json-label-header">
      <span>
        <strong>My File:</strong> {fileName ? truncateText(fileName, 30) : "Nessun file caricato"}
      </span>

        <div className="upload-button-container">
        <FileUploadButton onFileUpload={(fileNameOrUrl, content) => handleFileUpload(fileNameOrUrl, content)} /> {/* Componente per gestire il caricamento del file */}
        </div>
      </div>

      {/* Finestra di overlay per il caricamento del file JSON */}
      {showUploadBox && (
        <div className="upload-overlay">
          <div className="upload-box">
            <h3>Upload a JSON file</h3>
            {/* Input per selezionare un file JSON */}
            <input
              type="file"
              accept=".json" // Accetta solo file JSON
              onChange={(e) => {
                const file = e.target.files[0]; // Recupera il primo file selezionato
                if (file && file.type === "application/json") { // Verifica che sia un file JSON valido
                  const reader = new FileReader(); // Crea un oggetto FileReader
                  reader.onload = (event) => {
                    try {
                      const content = JSON.parse(event.target.result); // Effettua il parsing del JSON
                      handleFileUpload(file.name, content); // Aggiorna lo stato con nome e contenuto del file
                    } catch (error) {
                      console.error("Errore nel parsing del file JSON", error); // Logga errori di parsing
                    }
                  };
                  reader.readAsText(file); // Legge il contenuto del file come testo
                }
              }}
            />
            <button onClick={() => setShowUploadBox(false)}>Chiudi</button> {/* Pulsante per chiudere la finestra di caricamento */}
          </div>
        </div>
      )}

      {/* Contenitore per visualizzare il contenuto JSON */}
      <div
        className="json-content-container"
        dangerouslySetInnerHTML={{
          __html: jsonContent
            ? jsonContent.map((line) => `<pre>${line}</pre>`).join("") // Mostra il JSON formattato riga per riga
            : "Carica un file JSON per visualizzarlo qui.", // Messaggio predefinito se nessun file è caricato
        }}
      ></div>
    </div>
  );
};

export default JsonLabel;
