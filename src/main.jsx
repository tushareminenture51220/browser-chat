// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import ChatWidget from "./ChatWidget";
import Providers from "../redux/Providers";
import store from "../redux/store";
import GlobalGroupAudioCallPopup from "./components/global/GlobalGroupAudioCallPopup";
import GlobalAudioCallPopup from "./components/global/individual/GlobalAudioCallPopup";
import { CallFunctionProvider } from "../context/CallFunctionContext";
import GlobalSocketListener from "../socket/GlobalSocketListener";

// Track the chat widget root to prevent multiple renders
let chatWidgetRoot = null;

function initChatWidget(containerId = "chat-container", props = {}) {
  let container = document.getElementById(containerId);

  // Create container if it doesn't exist
  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    document.body.appendChild(container);
  }

  // Only create root if not already mounted
  if (!chatWidgetRoot) {
    chatWidgetRoot = ReactDOM.createRoot(container);
    chatWidgetRoot.render(
      <React.StrictMode>
        <Providers store={store}>
          <CallFunctionProvider>
            <ChatWidget {...props} />
            <GlobalGroupAudioCallPopup />
            <GlobalAudioCallPopup />
            <GlobalSocketListener />
          </CallFunctionProvider>
        </Providers>
      </React.StrictMode>
    );
  }
}

// Optional destroy function to safely unmount the widget
function destroyChatWidget() {
  if (chatWidgetRoot) {
    chatWidgetRoot.unmount();
    chatWidgetRoot = null;
  }
}

if (typeof window !== "undefined") {
  // Expose widget methods globally
  window.ChatWidget = { initChatWidget, destroyChatWidget };

  // Initialize on DOMContentLoaded if not already initialized
  window.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("chat-container") || !chatWidgetRoot) {
      initChatWidget("chat-container", {
        initialUser: "Guest User",
        theme: "light",
      });
    }
  });
}

export { initChatWidget, destroyChatWidget };
