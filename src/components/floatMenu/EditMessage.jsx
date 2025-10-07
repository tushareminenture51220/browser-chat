"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { useSocket } from "../../../context/SocketContext";
import "./EditMessage.css";

const EditMessage = ({ message, onClose, onMessageUpdated }) => {
  const [text, setText] = useState(message.message_text);
  const [loading, setLoading] = useState(false);
  const [LoggedInUser, setLoggedInUser] = useState(null);
  const { socket } = useSocket();

  useEffect(() => {
    const LoggedInUserData = Cookies.get("HRMS_LoggedIn_UserData")
      ? JSON.parse(Cookies.get("HRMS_LoggedIn_UserData"))
      : null;
    setLoggedInUser(LoggedInUserData);
  }, []);

  const handleSave = async () => {
    console.log("message", message)
    setLoading(true);
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_HRMS_MA_API}/api/edit-msg/${message.tempId}`,
        {
          userId: LoggedInUser.id,
          newText: text,
          isGroup: !!message.group_id,
        }
      );

      if (res.data.success) {
        toast.success("Message updated");

        // Emit socket event
        socket.current.emit("edit-msg", res.data.data);

        onMessageUpdated(res.data.data);
        onClose();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update message ❌");
    }
    setLoading(false);
  };

  return (
    <div className="edit-message-overlay">
      <div className="edit-message-container">
        {/* Header */}
        <div className="edit-message-header">
          <div className="edit-message-icon">
            <svg
              className="icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <h2>Edit Message</h2>
        </div>

        {/* Textarea */}
        <div className="edit-message-textarea-wrapper">
          <textarea
            className="edit-message-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
          />
          <div className="char-count">{text.length}/500</div>
        </div>
        <p className="edit-message-note">
          Make your changes and press save to update
        </p>

        {/* Buttons */}
        <div className="edit-message-buttons">
          <button onClick={onClose} className="btn-cancel">
            <svg
              className="btn-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading} className="btn-save">
            {loading ? (
              <>
                <svg
                  className="spinner"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg
                  className="btn-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMessage;
