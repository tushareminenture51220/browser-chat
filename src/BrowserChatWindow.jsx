"use client";

import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";
import Cookies from "js-cookie";
import { useSelector, useDispatch } from "react-redux";
import { useSocket } from "../context/SocketContext";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { getUsersData } from "../redux/users/action";
import "./BrowserChatWindow.css";
import "./image.css";
import "./send.css";
import BrowserChatFrom from "./components/bubble/BrowserChatFrom";
import BrowserChatBubble from "./components/bubble/BrowserChatBubble";
import FilePreviewPopup from "./components/file/FilePreviewPopup";

const BrowserChatWindow = ({ chatUser, onClose, index }) => {
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [LoggedInUser, setLoggedInUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [fileResData, setFileResData] = useState(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [mentionDropdown, setMentionDropdown] = useState({
    visible: false,
    query: "",
    users: [],
  });
  const [cursorPosition, setCursorPosition] = useState(0);
  const [userIsOnline, setUserIsOnline] = useState(false);

  const { usersData = [], onlineUsersData = [] } = useSelector(
    (store) => store.usersData
  );
  const isGroup = chatUser.type === "group";

  // Utility: format time
  const toMySQLFormat = (date) => {
    const pad = (n) => (n < 10 ? `0${n}` : n);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )} 
            ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds()
    )}`;
  };

  // Fetch user and users list
  useEffect(() => {
    const userData = JSON.parse(Cookies.get("HRMS_LoggedIn_UserData"));
    setLoggedInUser(userData);
    dispatch(getUsersData());
  }, [dispatch]);

  // Handle typing events
  useEffect(() => {
    if (!socket.current) return;
    const handleTyping = (data) => {
      if (Number(data.sender_id) === Number(chatUser.id))
        setIsOtherTyping(data.isTyping);
    };
    socket.current.on("typing", handleTyping);
    return () => socket.current.off("typing", handleTyping);
  }, [socket, chatUser.id]);

  // Scroll on typing or new messages
  useEffect(() => {
    if (isOtherTyping && messagesEndRef.current?.parentElement) {
      messagesEndRef.current.parentElement.scrollTop =
        messagesEndRef.current.parentElement.scrollHeight + 30;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOtherTyping, messages]);

  // Fetch chat messages
  useEffect(() => {
    if (!LoggedInUser?.id) return;
    const fetchMessages = async () => {
      try {
        const url = isGroup
          ? `${import.meta.env.VITE_HRMS_MA_API}/api/get-group-msgs/${
              chatUser.id
            }?userId=${LoggedInUser.id}`
          : `${import.meta.env.VITE_HRMS_MA_API}/api/get-msgs/${chatUser.id}/${
              LoggedInUser.id
            }`;
        const { data } = await axios.get(url);
        setMessages(data?.data || []);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();
  }, [chatUser, LoggedInUser, isGroup]);

  // Online status
  useEffect(
    () => setUserIsOnline(onlineUsersData.includes(String(chatUser.id))),
    [onlineUsersData, chatUser]
  );

  // Socket listeners for messages
  useEffect(() => {
    if (!socket.current || !LoggedInUser) return;
    const handlePrivateMsg = (data) => {
      const relevant =
        (Number(data.sender_id) === chatUser.id &&
          Number(data.receiver_id) === LoggedInUser.id) ||
        (Number(data.receiver_id) === chatUser.id &&
          Number(data.sender_id) === LoggedInUser.id);
      if (relevant) setMessages((prev) => [...prev, data]);
    };
    const handleGroupMsg = (data) => {
      if (
        isGroup &&
        chatUser.id === data.group_id &&
        Number(data.sender_id) !== Number(LoggedInUser.id)
      ) {
        setMessages((prev) => [...prev, data]);
      }
    };
    socket.current.on("receive-msg", handlePrivateMsg);
    socket.current.on("receive-group-msg", handleGroupMsg);
    return () => {
      socket.current.off("receive-msg", handlePrivateMsg);
      socket.current.off("receive-group-msg", handleGroupMsg);
    };
  }, [socket.current, chatUser?.id, LoggedInUser?.id, isGroup]);

  // Handle input change with mentions + typing status
  const handleTextChange = (e) => {
    const value = e.target.value;
    const pos = e.target.selectionStart;
    setCursorPosition(pos);
    setNewMessage(value);

    // Mentions
    const lastAt = value.lastIndexOf("@", pos - 1);
    if (lastAt >= 0) {
      const query = value.slice(lastAt + 1, pos);
      const filtered = usersData.filter((u) =>
        `${u.first_name} ${u.last_name}`
          .toLowerCase()
          .includes(query.toLowerCase())
      );
      setMentionDropdown({ visible: true, query, users: filtered });
    } else setMentionDropdown({ visible: false, query: "", users: [] });

    // Typing event
    if (socket.current) {
      socket.current.emit("typing", {
        sender_id: LoggedInUser.id,
        receiver_id: chatUser.id,
        isTyping: value.length > 0,
      });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.current?.emit("typing", {
        sender_id: LoggedInUser.id,
        receiver_id: chatUser.id,
        isTyping: false,
      });
    }, 1500);
  };

  const selectUser = (user) => {
    const before = newMessage.slice(0, cursorPosition);
    const after = newMessage.slice(cursorPosition);
    const lastAt = before.lastIndexOf("@");
    const updated = before.slice(0, lastAt) + `@${user.first_name} ` + after;
    setNewMessage(updated);
    setMentionDropdown({ visible: false, query: "", users: [] });
    setTimeout(() => {
      textareaRef.current.focus();
      const pos = lastAt + user.first_name.length + 2;
      textareaRef.current.setSelectionRange(pos, pos);
    }, 0);
  };

  // Emoji
  const handleEmojis = (emoji) => insertAtCursor(emoji.native);
  const insertAtCursor = (text) => {
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    setNewMessage(
      newMessage.substring(0, start) + text + newMessage.substring(end)
    );
    setTimeout(() => {
      textareaRef.current.focus();
      const pos = start + text.length;
      textareaRef.current.setSelectionRange(pos, pos);
    }, 0);
    setEmojiPickerOpen(false);
  };

  useEffect(() => {
    const clickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target))
        setEmojiPickerOpen(false);
    };
    if (emojiPickerOpen) document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, [emojiPickerOpen]);

  // File handling
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileResData({
        file,
        attachment_name: file.name,
        attachment_size: file.size,
        uniqueId: Date.now(),
      });
      setShowPreview(true);
      e.target.value = "";
    }
  };

  // Send message
  const handleSend = () => {
    if (!newMessage.trim() && !fileResData) return;
    const now = new Date();
    const tempId = Date.now();
    const msg = {
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
    setMessages((prev) => [...prev, msg]);
    socket.current?.emit("send-msg", msg);
    setNewMessage("");
    setShowPreview(false);
    setFileResData(null);
  };

  const rightOffset = 336 + index * 336;

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
        <button className="chat-phone-btn" aria-label="Call" title="Audio Call">
          <Icon icon="ic:round-phone" width={18} height={18} />
        </button>
        <button
          onClick={onClose}
          className="chat-close-btn"
          aria-label="Close"
          title="Close"
        >
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
        {isOtherTyping && (
          <div className="chat-bubble-row">
            <div className="chat-bubble-container typing">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <div className="chat-left-icons">
          <button
            type="button"
            onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
            className="chat-icon-btn"
          >
            <Icon icon="mdi:emoticon-outline" width={22} height={22} />
          </button>
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
        <button className="chat-icon" onClick={handleSend}>
          <Icon icon="mdi:send" />
        </button>
      </div>

      {/* Emoji */}
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

      {/* Mentions */}
      {mentionDropdown.visible && mentionDropdown.users.length > 0 && (
        <div className="absolute bottom-[60px] left-0 mb-2 w-80 max-h-72 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
          {mentionDropdown.users.map((user) => (
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

      {/* File Preview */}
      {showPreview && (
        <FilePreviewPopup
          key={fileResData.uniqueId}
          attachment_file={fileResData?.file}
          attachment_name={fileResData?.attachment_name}
          attachment_size={fileResData?.attachment_size}
          userName={chatUser.name}
          dispatch={dispatch}
          handleSubmit={handleSend}
          setTextMessage={setNewMessage}
          setShowPreview={setShowPreview}
          chatId={chatUser.id}
          setFileResData={setFileResData}
          groupName={isGroup ? chatUser.name : null}
        />
      )}
    </div>
  );
};

export default BrowserChatWindow;
