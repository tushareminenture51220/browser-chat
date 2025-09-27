// src/index.js (or wherever you mount widget)
import React from "react";
import ReactDOM from "react-dom/client";
import ChatWidget from "./ChatWidget";
import Providers from "../redux/Providers";
import store from "../redux/store";

function initChatWidget(containerId = "chat-container", props = {}) {
  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    document.body.appendChild(container);
  }

  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <Providers store={store}>   {/* ✅ wrap here */}
        <ChatWidget {...props} />
      </Providers>
    </React.StrictMode>
  );
}

if (typeof window !== "undefined") {
  window.ChatWidget = { initChatWidget };

  window.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("chat-container")) {
      const container = document.createElement("div");
      container.id = "chat-container";
      document.body.appendChild(container);
    }

    initChatWidget("chat-container", {
      initialUser: "Guest User",
      theme: "light",
    });
  });
}

export { initChatWidget };
