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
// import React from "react";
// import ReactDOM from "react-dom/client";
// import ChatWidget from "./ChatWidget";

// function initChatWidget(containerId, props = {}) {
//   const container = document.getElementById(containerId);
//   if (!container) {
//     console.error(`Container with id "${containerId}" not found`);
//     return;
//   }

//   ReactDOM.createRoot(container).render(
//     <React.StrictMode>
//       <ChatWidget {...props} />
//     </React.StrictMode>
//   );
// }

// // Only attach when running in browser
// if (typeof window !== "undefined") {
//   window.ChatWidget = { initChatWidget };
// }

// // Export for module usage
// export { initChatWidget };



import React from "react";
import ReactDOM from "react-dom/client";
import ChatWidget from "./ChatWidget";

function initChatWidget(containerId = "chat-container", props = {}) {
  let container = document.getElementById(containerId);

  // If no container exists, create one at the end of <body>
  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    // container.style.width = "400px";
    // container.style.height = "600px";
    // container.style.border = "1px solid #ccc";
    document.body.appendChild(container);
  }

  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <ChatWidget {...props} />
    </React.StrictMode>
  );
}

if (typeof window !== "undefined") {
  window.ChatWidget = { initChatWidget };

  // Auto initialize if script is added directly
  window.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("chat-container")) {
      const container = document.createElement("div");
      container.id = "chat-container";
      // container.style.position = "fixed";
      // container.style.bottom = "20px";
      // container.style.right = "20px";
      // container.style.width = "400px";
      // container.style.height = "600px";
      // container.style.border = "1px solid #ccc";
      document.body.appendChild(container);
    }

    // Mount widget automatically
    initChatWidget("chat-container", {
      initialUser: "Guest User",
      theme: "light",
    });
  });
}


export { initChatWidget };

