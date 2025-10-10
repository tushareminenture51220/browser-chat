import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { ArrowRight } from "lucide-react";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
import useFormattedTime from "../../../customHooks/useFormattedTime";
import "./BrowserChatBubble.css";
import ImagePreview from "../filePreview/ImagePreview";
import VideoPreview from "../filePreview/VideoPreview";
import FilePreview from "../filePreview/FilePreview";
import CallMessageCard from "./CallMessageCard";
import "../floatMenu/menu.css";
import FloatingMenu from "../floatMenu/FloatingMenu";

const BrowserChatBubble = ({ msg }) => {
  const {
    id,
    message_text,
    created_at,
    is_forwarded,
    forwarded_by,
    is_deleted,
    attachment_name,
    meeting_link,
  } = msg;

  const [showTime, setShowTime] = useState(false);
  const [LoggedInUser, setLoggedInUser] = useState(null);
  const [forwardedUser, setForwardedUser] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const { usersData = [] } = useSelector((store) => store.usersData);
  const formattedTime = useFormattedTime(created_at);

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const userData = Cookies.get("HRMS_LoggedIn_UserData")
      ? JSON.parse(Cookies.get("HRMS_LoggedIn_UserData"))
      : null;
    setLoggedInUser(userData);
  }, []);

  useEffect(() => {
    if (!forwarded_by) return;
    if (String(forwarded_by) === String(LoggedInUser?.id)) {
      setForwardedUser(LoggedInUser);
    } else {
      const user = usersData.find((u) => String(u.id) === String(forwarded_by));
      setForwardedUser(user || null);
    }
  }, [forwarded_by, LoggedInUser, usersData]);

  const toggleShowTime = () => setShowTime((prev) => !prev);

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 180;
    const menuWidth = 160;

    let top = rect.bottom + 4;
    let left = rect.left + 20;

    if (top + menuHeight > window.innerHeight) top = rect.top - menuHeight - 6;
    if (left + menuWidth > window.innerWidth) left = window.innerWidth - menuWidth - 10;
    if (left < 0) left = 10;

    setMenuPosition({ top, left });
    setOpenMenuId((prev) => (prev === id ? null : id));
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

  const isMenuOpen = openMenuId === id;

  const renderMessageWithMentions = (text) => {
    if (!text) return null;
    const sortedUsers = [...usersData].sort(
      (a, b) => b.first_name.length - a.first_name.length
    );
    let rendered = [text];
    sortedUsers.forEach((user) => {
      const name = user.first_name;
      rendered = rendered.flatMap((segment) => {
        if (typeof segment !== "string") return [segment];
        const parts = segment.split(new RegExp(`(@${name})`, "g"));
        return parts.map((part, idx) =>
          part === `@${name}` ? (
            <span key={name + idx} className="text-blue-500 font-medium">
              {part}
            </span>
          ) : (
            part
          )
        );
      });
    });
    return rendered;
  };

  const shouldRenderBubble = is_deleted || message_text || attachment_name;

  return (
    <div className="chat-bubble-row user">
      {shouldRenderBubble && (
        <div className="chat-bubble-container group" onClick={toggleShowTime}>
          {/* Always render menu button if message not deleted */}
          {!is_deleted && (
            <button
              ref={buttonRef}
              className="menu-button-right"
              onClick={handleMenuToggle}
            >
              <Icon icon="mdi:dots-vertical" width="20" height="20" />
            </button>
          )}

          {is_forwarded === 1 && (
            <div className="chat-forwarded">
              <ArrowRight size={14} />
              Forwarded {forwardedUser ? `by ${forwardedUser.first_name}` : ""}
            </div>
          )}

          {message_text && (
            <span className={`chat-message-text ${is_deleted ? "deleted" : ""}`}>
              {is_deleted
                ? "This message was deleted"
                : renderMessageWithMentions(message_text)}
            </span>
          )}

          {attachment_name && (
            <>
              <ImagePreview attachment_name={attachment_name} is_deleted={is_deleted} />
              <VideoPreview attachment_name={attachment_name} is_deleted={is_deleted} />
              <FilePreview id={id} attachment_name={attachment_name} is_deleted={is_deleted} />
            </>
          )}
        </div>
      )}

      {meeting_link && <CallMessageCard msg={msg} />}

      {showTime && <div className="chat-timestamp">{formattedTime}</div>}

      {isMenuOpen && (
        <FloatingMenu
          show="fromUser"
          message_text={message_text}
          closeMenu={() => setOpenMenuId(null)}
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
            position: "fixed",
          }}
          ref={menuRef}
        />
      )}
    </div>
  );
};

export default BrowserChatBubble;
