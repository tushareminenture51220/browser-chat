"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useSelector } from "react-redux";
import { useSocket } from "../context/SocketContext";
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
  const [updatedUsersData, setUpdatedUsersData] = useState([]);

  const { usersData, loggedInUser, onlineUsersData } = useSelector(
    (store) => store.usersData
  );

  const { socket, unReadMessageCount } = useSocket();

  // Merge unread count and online status into users data
  useEffect(() => {
    if (usersData) {
      const newUsersData = usersData.map((user) => ({
        ...user,
        unreadMessageCount: unReadMessageCount?.[user.id] ?? 0,
        user_status: onlineUsersData?.includes(user.id) ?? false,
      }));
      setUpdatedUsersData(newUsersData);
    }
  }, [usersData, unReadMessageCount, onlineUsersData]);

  // Notify server of open chat windows whenever openChats changes
  useEffect(() => {
    if (socket.current && loggedInUser) {
      const openChatIds = openChats.map((chat) => chat.id);
      if (openChatIds.length > 0) {
        const payload = {
          [loggedInUser.id]: openChatIds,
        };
        socket.current.emit("addChatWindowWidget", payload);
      }
    }
  }, [openChats, socket, loggedInUser]);

  const handleOpenChat = (chat) => {
    setOpenChats((prev) => {
      const exists = prev.find((c) => c.id === chat.id);
      if (exists) return prev;
      if (prev.length < 2) return [...prev, chat];
      return [prev[1], chat];
    });
  };

  const handleCloseChat = (id) => {
    setOpenChats((prev) => prev.filter((c) => c.id !== id));

    if (socket.current && loggedInUser) {
      const payload = { [loggedInUser.id]: [id] };
      socket.current.emit("removeChatWindowWidget", payload);
    }
  };

  console.log("loggedInUser", loggedInUser)

  return (
    <div className="chat-wrapper">
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

        {/* Current User */}
        <div className="chat-current-user">
          <div className="chat-avatar">
            {loggedInUser?.image ? (
              <img
                src={`https://api.eminenture.cloud/uploads/files/${loggedInUser.image}`}
                alt={loggedInUser?.first_name || "User"}
              />
            ) : (
              <span>
                {loggedInUser.first_name
                  ? loggedInUser.first_name[0].toUpperCase()
                  : "U"}
              </span>
            )}
          </div>
          <div>
            <h2 className="chat-username">{loggedInUser?.first_name || "T"}</h2>
            <p className="chat-status">Available</p>
          </div>
        </div>

        {/* Search */}
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
            usersData={updatedUsersData}
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
