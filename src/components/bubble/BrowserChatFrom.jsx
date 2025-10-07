"use client";

import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import useFormattedTime from "../../../customHooks/useFormattedTime";
import ImagePreview from "../filePreview/ImagePreview";
import VideoPreview from "../filePreview/VideoPreview";
import FilePreview from "../filePreview/FilePreview";
import CallMessageCard from "./CallMessageCard";
import FloatingMenu from "../floatMenu/FloatingMenu";
import "./BrowserChatFrom.css";
import "../floatMenu/menu.css";
import EditMessage from "../floatMenu/EditMessage";
import DeleteMessage from "../floatMenu/DeleteMessage";

const BrowserChatFrom = ({ msg }) => {
  const {
    message_text,
    created_at,
    is_deleted,
    attachment_name,
    id,
    meeting_link,
  } = msg;

  const [showTime, setShowTime] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [editVisible, setEditVisible] = useState(false); // ✅ edit popup
  const [currentMessage, setCurrentMessage] = useState(msg); // track updated message
  const [deleteVisible, setDeleteVisible] = useState(false);

  const formattedTime = useFormattedTime(created_at);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleShowTime = () => setShowTime((prev) => !prev);

  const shouldRenderBubble = is_deleted || currentMessage.message_text;

  const handleMenuToggle = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 180;
    const menuWidth = 160;

    let top = rect.bottom + 2;
    let left = rect.left - 150;

    if (top + menuHeight > window.innerHeight) {
      top = rect.top - menuHeight - 6;
    }
    if (left + menuWidth > window.innerWidth) {
      left = window.innerWidth - menuWidth - 10;
    }
    if (left < 0) left = 10;

    setMenuPosition({ top, left });
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const handleEditClick = () => {
    setEditVisible(true);
    setOpenMenuId(null); // close menu
  };

  const handleMessageUpdate = (updatedMessage) => {
    setCurrentMessage(updatedMessage); // update message in UI
    setEditVisible(false); // close edit popup
  };

  const handleDeleteClick = () => {
    setDeleteVisible(true); // show delete popup
    setOpenMenuId(null); // close menu
  };

  // Callback after delete
  const handleMessageDeleted = (deletedMessageId) => {
    setCurrentMessage((prev) =>
      prev.id === deletedMessageId ? { ...prev, is_deleted: true } : prev
    );
    setDeleteVisible(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="chat-bubble-row self relative">
      {shouldRenderBubble && (
        <div
          className="chat-bubble-container from group"
          onClick={toggleShowTime}
        >
          {!is_deleted && currentMessage.message_text && (
            <button
              ref={buttonRef}
              className="menu-button-left"
              onClick={handleMenuToggle}
            >
              <Icon icon="mdi:dots-vertical" width="20" height="20" />
            </button>
          )}

          <span className={`chat-message-text ${is_deleted ? "chat-deleted" : ""}`}>
            {is_deleted
              ? "This message was deleted"
              : currentMessage.message_text}
          </span>
        </div>
      )}

      {meeting_link && <CallMessageCard msg={msg} />}

      {showTime && <div className="chat-timestamp">{formattedTime}</div>}

      {attachment_name && (
        <>
          <ImagePreview
            attachment_name={attachment_name}
            is_deleted={is_deleted}
          />
          <VideoPreview
            attachment_name={attachment_name}
            is_deleted={is_deleted}
          />
          <FilePreview
            id={id}
            attachment_name={attachment_name}
            is_deleted={is_deleted}
          />
        </>
      )}

      {openMenuId === id && (
        <FloatingMenu
          ref={menuRef}
          message_text={currentMessage.message_text}
          closeMenu={() => setOpenMenuId(null)}
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
            position: "fixed",
          }}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick} // ✅ pass delete callback
        />
      )}

      {editVisible && (
        <EditMessage
          message={currentMessage}
          onClose={() => setEditVisible(false)}
          onMessageUpdated={handleMessageUpdate} // ✅ update message
        />
      )}

      {deleteVisible && (
        <DeleteMessage
          message={currentMessage}
          onClose={() => setDeleteVisible(false)}
          onMessageDeleted={handleMessageDeleted} // update bubble UI
        />
      )}
    </div>
  );
};

export default BrowserChatFrom;
