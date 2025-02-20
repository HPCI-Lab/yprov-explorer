// NavigationButton.js
/*
Questo file gestisce la navigazione avanti e indietro nella cronologia del browser. Utilizza stati interni per verificare se è 
possibile navigare in entrambe le direzioni e aggiorna questi stati dinamicamente tramite un listener sugli eventi di cronologia (popstate). 
Fornisce due pulsanti, uno per tornare indietro e uno per andare avanti, entrambi abilitati o disabilitati in base alla disponibilità della navigazione. 
Gli eventi onClick sui pulsanti attivano le funzioni window.history.back() e window.history.forward() per spostarsi nella cronologia.
*/

import React, { useState, useEffect } from "react";
import "./navigationButton.css";
import backIcon from "./Back Arrow.png";
import nextIcon from "./Forward Arrow.png";

const NavigationButtons = () => {
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  useEffect(() => {
    // Funzione per aggiornare lo stato dei pulsanti
    const updateNavigationState = () => {
      // Usa window.navigation per verificare se è possibile navigare
      setCanGoBack(window.navigation.canGoBack);
      setCanGoForward(window.navigation.canGoForward);
    };

    // Aggiorna lo stato iniziale
    updateNavigationState();

    // Ascolta i cambiamenti nella cronologia
    window.addEventListener('popstate', updateNavigationState);
    window.addEventListener('navigate', updateNavigationState);

    return () => {
      window.removeEventListener('popstate', updateNavigationState);
      window.removeEventListener('navigate', updateNavigationState);
    };
  }, []);

  const handleBack = () => {
    window.history.back();
  };

  const handleNext = () => {
    window.history.forward();
  };

  return (
    <div className="navigation-container">
      <button
        className="navigation-button back"
        onClick={handleBack}
        disabled={!canGoBack}
      >
        <img src={backIcon} alt="Back Icon" className="nav-icon" />
        <span className="nav-label">back</span>
      </button>

      <button
        className="navigation-button next"
        onClick={handleNext}
        disabled={!canGoForward}
      >
        <span className="nav-label">next</span>
        <img src={nextIcon} alt="Next Icon" className="nav-icon" />
      </button>
    </div>
  );
};

export default NavigationButtons;