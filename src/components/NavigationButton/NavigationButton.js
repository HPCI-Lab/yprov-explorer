import React, { useState, useEffect } from "react";
import "./navigationButton.css";
import backIcon from "./Back Arrow.png";
import nextIcon from "./Forward Arrow.png";

const NavigationButtons = () => {
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  useEffect(() => {
    const updateNavigationState = () => {
      if (typeof window !== "undefined" && "navigation" in window) {
        // Se l'API `window.navigation` è supportata
        setCanGoBack(window.navigation.canGoBack);
        setCanGoForward(window.navigation.canGoForward);
      } else {
        // Fallback per browser che non supportano window.navigation
        setCanGoBack(window.history.length > 1);
        setCanGoForward(false);
      }
    };

    // Aggiorna lo stato iniziale
    updateNavigationState();

    // Aggiunge un event listener SOLO SE window.navigation esiste
    if (typeof window !== "undefined" && "navigation" in window) {
      window.addEventListener("navigate", updateNavigationState);
    }
    window.addEventListener("popstate", updateNavigationState);

    return () => {
      // Rimuove gli event listener quando il componente si smonta
      if (typeof window !== "undefined" && "navigation" in window) {
        window.removeEventListener("navigate", updateNavigationState);
      }
      window.removeEventListener("popstate", updateNavigationState);
    };
  }, []);

  const handleBack = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  const handleNext = () => {
    if (typeof window !== "undefined") {
      window.history.forward();
    }
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
