import React, { useState } from "react";
import "./fullscreenButton.css";
import fullscreenMax from "../../assets/images/fullscreen-max.png";
import fullscreenMin from "../../assets/images/fullscreen-min.png";

const FullscreenButton = () => {
  // Stato per tenere traccia se siamo in modalità fullscreen o no
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Funzione per attivare/disattivare la modalità fullscreen
  const toggleFullscreen = () => {
    console.log("FullscreenButton rendered"); // Debug: verifica il rendering
    const frame = document.getElementById("graphFrame"); // Seleziona il contenitore del grafo

    if (!isFullscreen) {
      // Entra in modalità fullscreen
      if (frame.requestFullscreen) {
        frame.requestFullscreen(); // Standard moderno
      } else if (frame.webkitRequestFullscreen) {
        frame.webkitRequestFullscreen(); // Supporto per Safari
      } else if (frame.msRequestFullscreen) {
        frame.msRequestFullscreen(); // Supporto per IE/Edge
      }
    } else {
      // Esci dalla modalità fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen(); // Standard moderno
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen(); // Supporto per Safari
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen(); // Supporto per IE/Edge
      }
    }

    setIsFullscreen(!isFullscreen); // Aggiorna lo stato per riflettere il cambio
  };

  return (
    <button
      className="fullscreen-btn" // Classe per il bottone, per styling personalizzato
      onClick={toggleFullscreen} // Aggiunge il comportamento al click
      style={{
        backgroundImage: `url(${isFullscreen ? fullscreenMin : fullscreenMax})`, // Cambia l'icona in base allo stato
        backgroundRepeat: "no-repeat", // Evita la ripetizione dell'immagine
        backgroundPosition: "center", // Posiziona l'immagine al centro
        backgroundSize: "contain", // Adatta l'immagine al contenitore
      }}
    />
  );
};

export default FullscreenButton;
