// ChatWidget.jsx
import React, { useState } from "react";
import BrowserChat from "./BrowserChat";
import { Icon } from "@iconify/react";
import "./ChatWidget.css";

const ChatWidget = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Icon */}
      {!open && (
        <button
          className="chat-floating-btn"
          onClick={() => setOpen(true)}
          aria-label="Open Chat"
        >
          <Icon icon="mdi:chat" width={28} height={28} />
        </button>
      )}

      {/* Browser Chat Sidebar */}
      {open && <BrowserChat onClose={() => setOpen(false)} />}
    </>
  );
};

export default ChatWidget;
