// import React from "react";
// import ReactDOM from "react-dom/client";
// import ChatWidget from "./ChatWidget";
// import "./index.css";

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <ChatWidget />
//   </React.StrictMode>
// );


// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import ChatWidget from "./ChatWidget";

function initChatWidget(containerId, props = {}) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id "${containerId}" not found`);
    return;
  }

  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <ChatWidget {...props} />
    </React.StrictMode>
  );
}

// Only attach when running in browser
if (typeof window !== "undefined") {
  window.ChatWidget = { initChatWidget };
}

// Export for module usage
export { initChatWidget };
