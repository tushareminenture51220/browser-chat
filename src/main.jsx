import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import ChatWidget from "./ChatWidget";

// Expose function globally
window.initChatWidget = function (containerId, props = {}) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id "${containerId}" not found`);
    return;
  }

  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <ChatWidget />
    </React.StrictMode>
  );
};

// Call it immediately for local testing
window.initChatWidget("root");

