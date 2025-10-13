"use client";

import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import useFormattedTime from "../../../customHooks/useFormattedTime";
import ImagePreview from "../filePreview/ImagePreview";
import VideoPreview from "../filePreview/VideoPreview";
import FilePreview from "../filePreview/FilePreview";
import CallMessageCard from "./CallMessageCard";
import FloatingMenu from "../floatMenu/FloatingMenu";
import EditMessage from "../floatMenu/EditMessage";
import DeleteMessage from "../floatMenu/DeleteMessage";
import ForwardMessageModal from "../floatMenu/ForwardMessageModal";
import "./BrowserChatFrom.css";
import "../floatMenu/menu.css";

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
  const [editVisible, setEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [forwardVisible, setForwardVisible] = useState(false);

  const [currentMessage, setCurrentMessage] = useState(msg);
  const formattedTime = useFormattedTime(created_at);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleShowTime = () => setShowTime((prev) => !prev);

  const handleMenuToggle = (e) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const handleEditClick = () => {
    setEditVisible(true);
    setOpenMenuId(null);
  };

  const handleDeleteClick = () => {
    setDeleteVisible(true);
    setOpenMenuId(null);
  };

  const handleForwardClick = () => {
    setForwardVisible(true);
    setOpenMenuId(null);
  };

  const handleMessageUpdate = (updatedMessage) => {
    setCurrentMessage(updatedMessage);
    setEditVisible(false);
  };

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
      {/* Bubble container for text and/or attachments */}
      {(currentMessage.message_text || attachment_name) && (
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

          {currentMessage.message_text && (
            <span
              className={`chat-message-text ${
                is_deleted ? "chat-deleted" : ""
              }`}
            >
              {is_deleted
                ? "This message was deleted"
                : currentMessage.message_text}
            </span>
          )}

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
        </div>
      )}

      {meeting_link && <CallMessageCard msg={msg} />}

      {showTime && <div className="chat-timestamp">{formattedTime}</div>}

      {/* ALWAYS render menu, control visibility with CSS class */}
      <FloatingMenu
        ref={menuRef}
        message_text={currentMessage.message_text}
        closeMenu={() => setOpenMenuId(null)}
        isVisible={openMenuId === id} // Pass visibility as prop
        style={{
          position: "fixed",
          top: "60%",
          left: "63.5%",
        }}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onForward={handleForwardClick}
      />

      {editVisible && (
        <EditMessage
          message={currentMessage}
          onClose={() => setEditVisible(false)}
          onMessageUpdated={handleMessageUpdate}
        />
      )}

      {deleteVisible && (
        <DeleteMessage
          message={currentMessage}
          onClose={() => setDeleteVisible(false)}
          onMessageDeleted={handleMessageDeleted}
        />
      )}

      {forwardVisible && (
        <ForwardMessageModal
          message={currentMessage}
          onClose={() => setForwardVisible(false)}
          onForwarded={() => setForwardVisible(false)}
        />
      )}
    </div>
  );
};

export default BrowserChatFrom;