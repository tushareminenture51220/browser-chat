"use client";

import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import "./BrowserChatWindow.css";
import { useSocket } from "../context/SocketContext";
import BrowserChatBubble from "./components/BrowserChatBubble";
import BrowserChatFrom from "./components/BrowserChatFrom";

const BrowserChatWindow = ({ chatUser, onClose, index }) => {
  const [LoggedInUser, setLoggedInUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const { onlineUsersData } = useSelector((store) => store.usersData);
  const [userIsOnline, setUserIsOnline] = useState(false);
  const { socket } = useSocket();
  const messagesEndRef = useRef(null);

  const isGroup = chatUser.type === "Group";

  // Fetch logged-in user
  useEffect(() => {
    const LoggedInUserData = JSON.parse(Cookies.get("HRMS_LoggedIn_UserData"));
    setLoggedInUser(LoggedInUserData);
  }, []);

  // Fetch chat messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!LoggedInUser?.id) return;
      try {
        let response;
        if (isGroup) {
          response = await axios.get(
            `${import.meta.env.VITE_HRMS_MA_API}/api/get-group-msgs/${
              chatUser.id
            }?userId=${LoggedInUser.id}`
          );
        } else {
          response = await axios.get(
            `${import.meta.env.VITE_HRMS_MA_API}/api/get-msgs/${chatUser.id}/${
              LoggedInUser.id
            }`
          );
        }
        setMessages(response?.data?.data || []);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [chatUser, LoggedInUser]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check online status
  useEffect(() => {
    if (onlineUsersData.length > 0) {
      setUserIsOnline(onlineUsersData.includes(String(chatUser.id)));
    }
  }, [onlineUsersData, chatUser]);

  // Socket listeners
  useEffect(() => {
    if (!socket.current || !LoggedInUser) return;

    const handleReceiveMsg = (data) => {
      if (isGroup) {
        if (
          data.group_id === chatUser.id &&
          Number(data.sender_id) !== LoggedInUser.id
        ) {
          setMessages((prev) => [...prev, data]);
        }
      } else {
        const isRelevantChat =
          (Number(data.sender_id) === chatUser.id &&
            Number(data.receiver_id) === LoggedInUser.id) ||
          (Number(data.receiver_id) === chatUser.id &&
            Number(data.sender_id) === LoggedInUser.id);
        if (isRelevantChat) setMessages((prev) => [...prev, data]);
      }
    };

    socket.current.on("receive-msg", handleReceiveMsg);
    socket.current.on("receive-group-msg", handleReceiveMsg);

    return () => {
      socket.current.off("receive-msg", handleReceiveMsg);
      socket.current.off("receive-group-msg", handleReceiveMsg);
    };
  }, [socket, chatUser, LoggedInUser, isGroup]);

  // Send message
  const [newMessage, setNewMessage] = useState("");
  const handleSend = () => {
    if (!newMessage.trim() || !LoggedInUser) return;

    const tempId = Date.now(); // temporary id
    const msgData = {
      id: tempId,
      tempId,
      sender_id: LoggedInUser.id,
      message_text: newMessage.trim(),
      myself: true,
      created_at: new Date(),
      ...(isGroup ? { group_id: chatUser.id } : { receiver_id: chatUser.id }),
    };

    setMessages((prev) => [...prev, msgData]);
    setNewMessage("");

    // Emit socket event
    if (isGroup) {
      socket.current.emit("send-group-msg", msgData);
    } else {
      socket.current.emit("send-msg", msgData);
    }
  };

  // Calculate right offset for multiple windows
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
            <p className="chat-status">{userIsOnline ? "Online" : "Offline"}</p>
          </div>
        </div>

        <button onClick={onClose} className="chat-close-btn" aria-label="Close">
          <Icon icon="ic:round-close" width={18} height={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg) =>
          msg?.myself ? (
            <BrowserChatFrom key={msg.id} msg={msg} />
          ) : (
            <BrowserChatBubble key={msg.id} msg={msg} />
          )
        )}
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
