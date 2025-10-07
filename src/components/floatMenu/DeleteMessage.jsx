"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { useSocket } from "../../../context/SocketContext";
import "./DeleteMessage.css";

const DeleteMessage = ({ message, onClose, onMessageDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [LoggedInUser, setLoggedInUser] = useState(null);
  const { socket } = useSocket();

  useEffect(() => {
    const LoggedInUserData = Cookies.get("HRMS_LoggedIn_UserData")
      ? JSON.parse(Cookies.get("HRMS_LoggedIn_UserData"))
      : null;
    setLoggedInUser(LoggedInUserData);
  }, []);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_HRMS_MA_API}/api/delete-msg/${message.id}`,
        {
          data: {
            userId: LoggedInUser.id,
            isGroup: !!message.group_id,
          },
        }
      );
      if (res.data.success) {
        toast.success("Message deleted");
        socket.current.emit("delete-msg", res.data.data);
        onMessageDeleted(message.id);
        onClose();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete message ❌");
    }
    setLoading(false);
  };

  return (
    <div className="delete-message-overlay">
      <div className="delete-message-container">
        {/* Header */}
        <div className="delete-message-header">
          <div className="delete-message-icon">
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <h2>Delete Message</h2>
        </div>

        {/* Warning */}
        <div className="delete-message-warning">
          <p className="warning-title">
            <svg
              className="warning-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            This action cannot be undone
          </p>
          <p className="warning-text">
            Are you sure you want to delete this message? This will permanently remove the message from the system.
          </p>
        </div>

        {/* Buttons */}
        <div className="delete-message-buttons">
          <button onClick={onClose} disabled={loading} className="btn-cancel">
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

          <button onClick={handleDelete} disabled={loading} className="btn-delete">
            {loading ? (
              <>
                <svg
                  className="spinner"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="spinner-circle"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="spinner-path"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Deleting...
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteMessage;
