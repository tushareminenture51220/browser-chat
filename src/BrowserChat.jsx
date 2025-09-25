// src/BrowserChat.jsx
import React, { useState } from "react";
import BrowserChatWindow from "./BrowserChatWindow";
import { Icon } from "@iconify/react";
import "./BrowserChat.css";

const BrowserChat = ({ onClose: externalOnClose, initialUser }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openChats, setOpenChats] = useState([]); // Max 3 open chats
  const [activeTab, setActiveTab] = useState("people"); // "people" or "groups"

  // your demo data (you can replace it with props or API later)
  const demoUsers = [
    {
      id: 1,
      name: "Mike",
      message: "Hey, are we still on for tonight?",
      time: "10:30 AM",
      unread: false,
    },
    {
      id: 2,
      name: "Sophia",
      message: "Just sent you the files.",
      time: "9:45 AM",
      unread: true,
    },
    {
      id: 3,
      name: "Alex",
      message: "You: Got it, thanks!",
      time: "Yesterday",
      unread: false,
    },
    {
      id: 4,
      name: "Emma",
      message: "I’m feeling unwell today...",
      time: "Yesterday",
      unread: false,
    },
    {
      id: 5,
      name: "David",
      message: "See you tomorrow morning.",
      time: "Aug 25",
      unread: false,
    },
    {
      id: 6,
      name: "Olivia",
      message: "Shared a photo with you.",
      time: "Aug 24",
      unread: true,
    },
    {
      id: 7,
      name: "Liam",
      message: "No worries, take your time.",
      time: "Aug 23",
      unread: false,
    },
    {
      id: 8,
      name: "Noah",
      message: "Available",
      time: "Aug 22",
      unread: false,
    },
  ];

  const demoGroups = [
    {
      id: 101,
      name: "Project Alpha",
      message: "Meeting at 5 PM",
      time: "Today",
      unread: true,
    },
    {
      id: 102,
      name: "Design Team",
      message: "New mockups uploaded",
      time: "Yesterday",
      unread: false,
    },
    {
      id: 103,
      name: "Marketing",
      message: "Campaign review tomorrow",
      time: "Aug 25",
      unread: true,
    },
    {
      id: 104,
      name: "Friends Chat",
      message: "Dinner plans?",
      time: "Aug 24",
      unread: false,
    },
    {
      id: 105,
      name: "HR Updates",
      message: "Policy changes announced",
      time: "Aug 23",
      unread: true,
    },
    {
      id: 106,
      name: "Developers",
      message: "Code review pending",
      time: "Aug 22",
      unread: false,
    },
    {
      id: 107,
      name: "QA Team",
      message: "Bug fixes released",
      time: "Aug 21",
      unread: true,
    },
    {
      id: 108,
      name: "Event Planning",
      message: "Venue confirmed",
      time: "Aug 20",
      unread: false,
    },
    {
      id: 109,
      name: "Book Club",
      message: "Next meeting on Friday",
      time: "Aug 19",
      unread: true,
    },
  ];

  const filteredUsers = demoUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = demoGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenChat = (chat) => {
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
    <div className="chat-wrapper">
      <div className="chat-sidebar">
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
            {initialUser ? initialUser[0].toUpperCase() : "T"}
          </div>
          <div>
            <h2 className="chat-username">{initialUser || "tushar1968"}</h2>
            <p className="chat-status">Available</p>
          </div>
        </div>

        <div className="chat-search">
          <input
            type="text"
            placeholder="Search Contacts, Chats & Channels"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="chat-list">
          {(activeTab === "people" ? filteredUsers : filteredGroups).map(
            (item) => (
              <div
                key={item.id}
                className="chat-list-item"
                onClick={() => handleOpenChat(item)}
              >
                <div className="chat-list-avatar">
                  {item.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div className="chat-list-details">
                  <div className="chat-list-header">
                    <h3>{item.name}</h3>
                    <span>{item.time}</span>
                  </div>
                  <div className="chat-list-message">
                    <p>{item.message}</p>
                    {item.unread && <span className="chat-unread"></span>}
                  </div>
                </div>
              </div>
            )
          )}
        </div>

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

      <div className="chat-windows">
        {openChats.map((user) => (
          <BrowserChatWindow
            key={user.id}
            chatUser={user}
            onClose={() => handleCloseChat(user.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default BrowserChat;
