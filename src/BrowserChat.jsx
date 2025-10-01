// src/BrowserChat.jsx
import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useSelector } from "react-redux";
import UserSection from "./UserSection";
import GroupSection from "./GroupSection";
import BrowserChatWindow from "./BrowserChatWindow";
import "./BrowserChat.css";
import "./image.css";
import "./search.css";

const BrowserChat = ({ onClose: externalOnClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openChats, setOpenChats] = useState([]);
  const [activeTab, setActiveTab] = useState("people");

  const { usersData, loggedInUser } = useSelector((store) => store.usersData);
  // console.log("loggedInUser", loggedInUser);

  const handleOpenChat = (chat) => {
    // console.log("chat", chat)
    setOpenChats((prev) => {
      const exists = prev.find((c) => c.id === chat.id);
      if (exists) return prev;
      if (prev.length < 3) return [...prev, chat];
      return [prev[1], prev[2], chat];
    });
  };

  const handleCloseChat = (id) => {
    setOpenChats((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="chat-wrapper" >
      <div className="chat-sidebar">
        {/* Close button */}
        <button
          onClick={() => {
            if (externalOnClose) externalOnClose();
          }}
          className="chat-close-btn"
          aria-label="Close"
        >
          <Icon icon="ic:round-close" className="chat-close-icon" />
        </button>

        <div className="chat-current-user">
          <div className="chat-avatar">
            <img
              src={
                loggedInUser?.image
                  ? `https://eminenture.live/public/chatting-files/${loggedInUser.image}`
                  : "/default-user.png"
              }
              alt={loggedInUser?.first_name || "User"}
            />
          </div>
          <div>
            <h2 className="chat-username">
              {loggedInUser?.first_name || "Tushar"}
            </h2>
            <p className="chat-status">Available</p>
          </div>
        </div>

        <div className="chat-search">
          <Icon icon="mdi:magnify" className="chat-search-icon" />
          <input
            type="text"
            placeholder="Search People and Groups"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Render People / Groups */}
        {activeTab === "people" ? (
          <UserSection
            searchTerm={searchTerm}
            handleOpenChat={handleOpenChat}
          />
        ) : (
          <GroupSection
            searchTerm={searchTerm}
            handleOpenChat={handleOpenChat}
          />
        )}

        {/* Tabs */}
        <div className="chat-tabs">
          <button
            className={activeTab === "people" ? "active" : ""}
            onClick={() => setActiveTab("people")}
          >
            People
          </button>
          <button
            className={activeTab === "groups" ? "active" : ""}
            onClick={() => setActiveTab("groups")}
          >
            Groups
          </button>
        </div>
      </div>

      {/* Open Chat Windows */}
      <div className="chat-windows">
        {openChats.map((chat, index) => (
          <BrowserChatWindow
            key={chat.id}
            chatUser={chat}
            onClose={() => handleCloseChat(chat.id)}
            index={index}
            loggedInUser={loggedInUser}
          />
        ))}
      </div>
    </div>
  );
};

export default BrowserChat;
