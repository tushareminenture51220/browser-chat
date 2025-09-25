import React from "react";
import ReactDOM from "react-dom/client";
import ChatWidget from "./ChatWidget";
import "./index.css";

// Expose a function to initialize the widget on any page
window.initChatWidget = (elementId, props = {}) => {
  const el = document.getElementById(elementId);
  if (!el) {
    console.error(`Element #${elementId} not found`);
    return;
  }

  ReactDOM.createRoot(el).render(<ChatWidget {...props} />);
};
