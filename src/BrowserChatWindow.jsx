// BrowserChatWindow.jsx
import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import "./BrowserChatWindow.css";

const BrowserChatWindow = ({ chatUser, onClose, index }) => {
  const [messages, setMessages] = useState([
    { id: 1, sender: "self", text: "Hi there!" },
    { id: 2, sender: "user", text: `Hello! I'm ${chatUser.name}` },
  ]);
  
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "self", text: newMessage.trim() },
    ]);
    setNewMessage("");
  };

  // Calculate right offset based on index
  const rightOffset = 320 + 16 + index * (320 + 16); 

  return (
     <div className="chat-window" style={{ right: `${rightOffset}px` }}>
      {/* Header */}
      <div className="chat-header">
        <div className="chat-user-info">
          <div className="chat-avatar">
            {chatUser.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </div>
          <div>
            <h2 className="chat-username">{chatUser.name}</h2>
            <p className="chat-status">Online</p>
          </div>
        </div>

        <button onClick={onClose} className="chat-close-btn" aria-label="Close">
          <Icon icon="ic:round-close" width={18} height={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message-row ${
              msg.sender === "self" ? "self" : "user"
            }`}
          >
            <div
              className={`chat-bubble ${
                msg.sender === "self" ? "self-bubble" : "user-bubble"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <div className="chat-left-icons">
          <button className="chat-icon-btn">
            <Icon icon="mdi:emoticon-outline" width={22} height={22} />
          </button>
          <button className="chat-icon-btn">
            <Icon icon="ic:round-attach-file" width={22} height={22} />
          </button>
        </div>

        <textarea
          placeholder="Type a message..."
          className="chat-textarea"
          rows={1}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />

        <button onClick={handleSend}>
          <Icon className="chat-icon" icon="mdi:send" width={20} height={20} />
        </button>
      </div>
    </div>
  );
};

export default BrowserChatWindow;
