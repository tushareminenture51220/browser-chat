"use client";

import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import useFormattedTime from "../../../customHooks/useFormattedTime";
import ImagePreview from "../filePreview/ImagePreview";
import VideoPreview from "../filePreview/VideoPreview";
import FilePreview from "../filePreview/FilePreview";
import CallMessageCard from "./CallMessageCard";
import "./BrowserChatFrom.css";
import "../floatMenu/menu.css";
import FloatingMenu from "../floatMenu/FloatingMenu";

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

  const formattedTime = useFormattedTime(created_at);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleShowTime = () => setShowTime((prev) => !prev);

  const shouldRenderBubble = is_deleted || message_text;

  const handleMenuToggle = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 180; // approximate height of your menu
    const menuWidth = 160;

    let top = rect.bottom + 2;
    let left = rect.left - 150;

    // Adjust top if it goes beyond viewport
    if (top + menuHeight > window.innerHeight) {
      top = rect.top - menuHeight - 6; // show above the button instead
    }

    // Adjust left if it goes beyond viewport width
    if (left + menuWidth > window.innerWidth) {
      left = window.innerWidth - menuWidth - 10; // shift left inside viewport
    }
    if (left < 0) left = 10; // minimum left margin

    setMenuPosition({ top, left });
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const isMenuOpen = openMenuId === id;

  useEffect(() => {
    const handleClickOutside = (e) => {
      // If click is NOT inside the menu AND NOT on the menu button
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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="chat-bubble-row self relative">
      {shouldRenderBubble && (
        <div
          className="chat-bubble-container from group"
          onClick={toggleShowTime}
        >
          {!is_deleted && message_text && (
            <button
              ref={buttonRef}
              className="menu-button-left"
              onClick={handleMenuToggle}
            >
              <Icon icon="mdi:dots-vertical" width="20" height="20" />
            </button>
          )}

          <span className={`chat-message-text ${is_deleted ? "deleted" : ""}`}>
            {is_deleted ? "This message was deleted" : message_text}
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

      {isMenuOpen && (
        <FloatingMenu
          ref={menuRef}
          message_text={message_text}
          closeMenu={() => setOpenMenuId(null)}
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
            position: "fixed",
          }}
        />
      )}
    </div>
  );
};

export default BrowserChatFrom;
