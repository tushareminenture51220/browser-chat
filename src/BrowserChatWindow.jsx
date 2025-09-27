"use client";

import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";
import Cookies from "js-cookie";
import { useSelector, useDispatch } from "react-redux";
import "./BrowserChatWindow.css";
import "./image.css";
import { useSocket } from "../context/SocketContext";
import BrowserChatBubble from "./components/BrowserChatBubble";
import BrowserChatFrom from "./components/BrowserChatFrom";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { getUsersData } from "../redux/users/action";

const BrowserChatWindow = ({ chatUser, onClose, index }) => {
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const [LoggedInUser, setLoggedInUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [fileResData, setFileResData] = useState(null);
  const [mentionDropdownVisible, setMentionDropdownVisible] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [userIsOnline, setUserIsOnline] = useState(false);

  const isGroup = chatUser.type === "group";

  const { usersData = [], onlineUsersData = [] } = useSelector(
    (store) => store.usersData
  );

  // -------------------- Fetch logged-in user --------------------
  useEffect(() => {
    const LoggedInUserData = JSON.parse(Cookies.get("HRMS_LoggedIn_UserData"));
    setLoggedInUser(LoggedInUserData);
    dispatch(getUsersData());
  }, [dispatch]);

  // -------------------- Fetch chat messages --------------------
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
  }, [chatUser, LoggedInUser, isGroup]);

  // -------------------- Scroll to bottom --------------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // -------------------- Online status --------------------
  useEffect(() => {
    setUserIsOnline(onlineUsersData.includes(String(chatUser.id)));
  }, [onlineUsersData, chatUser]);

  // -------------------- Socket listeners --------------------
  useEffect(() => {
    if (!socket.current || !LoggedInUser || !chatUser) return;

    // Handler for incoming messages
    const handleReceiveMsg = (data) => {
      const isRelevantChat =
        (Number(data.sender_id) === chatUser.id &&
          Number(data.receiver_id) === LoggedInUser.id) ||
        (Number(data.receiver_id) === chatUser.id &&
          Number(data.sender_id) === LoggedInUser.id);

      if (isRelevantChat) {
        setMessages((prev) => [...prev, data]);
      }
    };

    // Listen for incoming messages
    socket.current.on("receive-msg", handleReceiveMsg);

    // Clean up listener on unmount or dependency change
    return () => {
      socket.current.off("receive-msg", handleReceiveMsg);
    };
  }, [socket.current, chatUser?.id, LoggedInUser?.id]);

  // ✅ Receive group msg
  useEffect(() => {
    if (!LoggedInUser || !socket.current) return;

    const handleGroupMsg = (data) => {
      if (
        chatUser?.type === "group" &&
        chatUser.id === data.group_id &&
        Number(data.sender_id) !== Number(LoggedInUser.id)
      ) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.current.on("receive-group-msg", handleGroupMsg);
    return () => socket?.current?.off("receive-group-msg", handleGroupMsg);
  }, [socket.current, chatUser?.id, LoggedInUser?.id]);

  // -------------------- Mentions --------------------
  const handleTextChange = (e) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    setCursorPosition(cursorPos);
    setNewMessage(value);

    // Detect @ and filter users
    const lastAt = value.lastIndexOf("@", cursorPos - 1);
    if (lastAt >= 0) {
      const query = value.slice(lastAt + 1, cursorPos);
      setMentionQuery(query);
      setMentionDropdownVisible(true);

      const filtered = usersData.filter((user) =>
        `${user.first_name} ${user.last_name}`
          .toLowerCase()
          .includes(query.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setMentionDropdownVisible(false);
      setMentionQuery("");
      setFilteredUsers([]);
    }
  };

  const selectUser = (user) => {
    const textBefore = newMessage.slice(0, cursorPosition);
    const textAfter = newMessage.slice(cursorPosition);
    const lastAt = textBefore.lastIndexOf("@");
    const updatedText =
      textBefore.slice(0, lastAt) + `@${user.first_name} ` + textAfter;

    setNewMessage(updatedText);
    setMentionDropdownVisible(false);
    setMentionQuery("");

    setTimeout(() => {
      textareaRef.current.focus();
      const pos = lastAt + user.first_name.length + 2;
      textareaRef.current.setSelectionRange(pos, pos);
    }, 0);
  };

  // -------------------- Emoji Picker --------------------
  const handleEmojis = (emoji) => {
    insertAtCursor(emoji.native);
    setEmojiPickerOpen(false);
  };

  const insertAtCursor = (insertedText) => {
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const newText =
      newMessage.substring(0, start) + insertedText + newMessage.substring(end);
    setNewMessage(newText);

    setTimeout(() => {
      textareaRef.current.focus();
      const pos = start + insertedText.length;
      textareaRef.current.setSelectionRange(pos, pos);
    }, 0);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setEmojiPickerOpen(false);
      }
    };
    if (emojiPickerOpen)
      document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [emojiPickerOpen]);

  // -------------------- File Selection --------------------
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileResData({
        file,
        attachment_name: file.name,
        attachment_size: file.size,
        uniqueId: Date.now(),
      });
      setShowPreview(true);
      event.target.value = "";
    }
  };

  // -------------------- Send Message --------------------
  const handleSend = () => {
    if (!newMessage.trim() && !fileResData) return;

    const now = new Date();
    const toMySQLFormat = (date) => {
      const pad = (n) => (n < 10 ? "0" + n : n);
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate()
      )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
        date.getSeconds()
      )}`;
    };

    const tempId = Date.now();
    const msgData = {
      tempId,
      sender_id: LoggedInUser.id,
      receiver_id: chatUser.id,
      message_text: newMessage,
      attachment_name: fileResData?.attachment_name || null,
      attachment_size: fileResData?.attachment_size || null,
      myself: true,
      sender_name: LoggedInUser?.first_name,
      isGroup,
      created_at: toMySQLFormat(now),
      updated_at: toMySQLFormat(now),
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, msgData]);

    // Emit socket event
    if (socket.current) {
      socket.current.emit("send-msg", msgData);
    }

    setNewMessage("");
    setShowPreview(false);
    setFileResData(null);
  };

  // -------------------- Right offset for multiple windows --------------------
  const rightOffset = 320 + 16 + index * (320 + 16);

  return (
    <div className="chat-window" style={{ right: `${rightOffset}px` }}>
      {/* Header */}
      <div className="chat-header">
        <div className="chat-user-info">
          <div className="chat-avatar">
            {chatUser.image ? (
              <img
                src={`https://eminenture.live/public/chatting-files/${chatUser.image}`}
                alt={chatUser.name}
              />
            ) : (
              <span>
                {chatUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </span>
            )}
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
            <BrowserChatFrom key={msg.tempId || msg.id} msg={msg} />
          ) : (
            <BrowserChatBubble key={msg.tempId || msg.id} msg={msg} />
          )
        )}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <div className="chat-left-icons">
          {/* Emoji button */}
          <button
            type="button"
            onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
            className="chat-icon-btn"
          >
            <Icon icon="mdi:emoticon-outline" width={22} height={22} />
          </button>

          {/* File icon only */}
          <div className="chat-icon-btn">
            {/* File icon only */}
            <label
              htmlFor={`fileInput${chatUser.id}`}
              className="chat-icon-btn cursor-pointer"
            >
              <input
                type="file"
                id={`fileInput${chatUser.id}`}
                className="file-input-hidden"
                onChange={handleFileSelect}
              />
              <Icon icon="ic:round-attach-file" width={22} height={22} />
            </label>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          placeholder="Type a message..."
          className="chat-textarea"
          rows={1}
          value={newMessage}
          onChange={handleTextChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />

        {/* Send button */}
        <button onClick={handleSend}>
          <Icon className="chat-icon" icon="mdi:send" width={20} height={20} />
        </button>
      </div>

      {/* Emoji Picker */}
      {emojiPickerOpen && (
        <div className="absolute bottom-[78px] left-0" ref={emojiPickerRef}>
          <Picker
            data={data}
            emojiSize={20}
            onEmojiSelect={handleEmojis}
            maxFrequentRows={0}
            perLine={8}
            previewPosition="none"
          />
        </div>
      )}

      {/* Mentions Dropdown */}
      {mentionDropdownVisible && filteredUsers.length > 0 && (
        <div className="absolute bottom-[60px] left-0 mb-2 w-80 max-h-72 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
              onClick={() => selectUser(user)}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.first_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                    {user.first_name[0]}
                  </div>
                )}
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-gray-900 dark:text-white text-sm truncate">
                  {user.first_name} {user.last_name}
                </span>
                <span className="text-gray-500 dark:text-gray-300 text-xs truncate mt-0.5">
                  {user.email}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowserChatWindow;
