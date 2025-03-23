/*
FullscreenButton.js: Component that enables or disables 
the fullscreen mode for the graph.
*/

import React, { useState } from "react";
import "./fullscreenButton.css";
import fullscreenMax from "../../assets/images/fullscreen-max.png";
import fullscreenMin from "../../assets/images/fullscreen-min.png";

const FullscreenButton = () => {
  // State for the fullscreen mode (true if active, false otherwise)
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Function to toggle the fullscreen mode
  const toggleFullscreen = () => {
    console.log("FullscreenButton rendered"); 
    const frame = document.getElementById("graphFrame");

    if (!isFullscreen) {
      // Enter fullscreen mode
      if (frame.requestFullscreen) {
        frame.requestFullscreen();
      } else if (frame.webkitRequestFullscreen) {
        frame.webkitRequestFullscreen(); 
      } else if (frame.msRequestFullscreen) {
        frame.msRequestFullscreen();
      }
    } else {
      // Exit fullscreen mode
      if (document.exitFullscreen) {
        document.exitFullscreen(); 
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen(); 
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    // Update the state of the fullscreen
    setIsFullscreen(!isFullscreen);
  };

  return (
    <button
      className="fullscreen-btn" 
      onClick={toggleFullscreen} 
      style={{
        backgroundImage: `url(${isFullscreen ? fullscreenMin : fullscreenMax})`, 
        backgroundRepeat: "no-repeat", 
        backgroundPosition: "center", 
        backgroundSize: "contain",
      }}
    />
  );
};

export default FullscreenButton;
