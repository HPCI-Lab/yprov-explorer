/*
NavigationButton.js: This component is responsible for rendering the navigation buttons. 
It uses the window.navigation API to check if the user can go back or forward in the browser history. 
If the API is not supported, it falls back to using the window.history API. The component listens for navigate events and popstate 
events to update the navigation state accordingly. It also provides event handlers for the back and forward buttons to navigate 
the user back and forward in the browser history.
*/

import React, { useState, useEffect } from "react";
import "./navigationButton.css";
import backIcon from "./Back Arrow.png";
import nextIcon from "./Forward Arrow.png";

const NavigationButtons = () => {
  // State for tracking if the user can go back or forward
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  // Use effect to update the navigation state and add event listeners
  useEffect(() => {
    // Function to update the navigation state based on window.navigation or window.history
    const updateNavigationState = () => {
      // Check if window.navigation is supported
      if (typeof window !== "undefined" && "navigation" in window) {
        setCanGoBack(window.navigation.canGoBack);
        setCanGoForward(window.navigation.canGoForward);
      } else {
        // Fallback to using window.history
        setCanGoBack(window.history.length > 1);
        setCanGoForward(false);
      }
    };

    // Initial update of navigation state
    updateNavigationState();

    // Add event listeners for navigate and popstate events
    if (typeof window !== "undefined" && "navigation" in window) {
      window.addEventListener("navigate", updateNavigationState);
    }
    window.addEventListener("popstate", updateNavigationState);

    return () => {
      // Clean up event listeners on unmount
      if (typeof window !== "undefined" && "navigation" in window) {
        window.removeEventListener("navigate", updateNavigationState);
      }
      window.removeEventListener("popstate", updateNavigationState);
    };
  }, []);

  // Event handler for the back button
  const handleBack = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  // Event handler for the forward button
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
