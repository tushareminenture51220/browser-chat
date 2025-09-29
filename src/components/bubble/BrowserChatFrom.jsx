"use client";

import React, { useState } from "react";
import useFormattedTime from "../../../customHooks/useFormattedTime";
import "./BrowserChatFrom.css";
import ImagePreview from "../filePreview/ImagePreview";
import VideoPreview from "../filePreview/VideoPreview";
import FilePreview from "../filePreview/FilePreview";

const BrowserChatFrom = ({ msg }) => {
  const { message_text, created_at, is_deleted, attachment_name, id } = msg;

  const [showTime, setShowTime] = useState(false);
  const formattedTime = useFormattedTime(created_at);

  const toggleShowTime = () => setShowTime((prev) => !prev);

  // Decide whether to render a text bubble
  const shouldRenderBubble = is_deleted || message_text;

  return (
    <div className="chat-bubble-row self">
      {/* Only render bubble if there is text or message is deleted */}
      {shouldRenderBubble && (
        <div className="chat-bubble-container from" onClick={toggleShowTime}>
          <span className={`chat-message-text ${is_deleted ? "deleted" : ""}`}>
            {is_deleted ? "This message was deleted" : message_text}
          </span>
        </div>
      )}

      {/* Timestamp */}
      {showTime && <div className="chat-timestamp">{formattedTime}</div>}

      {/* Attachments */}
      {attachment_name && (
        <>
          <ImagePreview attachment_name={attachment_name} is_deleted={is_deleted} />
          <VideoPreview attachment_name={attachment_name} is_deleted={is_deleted} />
          <FilePreview
            id={id}
            attachment_name={attachment_name}
            is_deleted={is_deleted}
          />
        </>
      )}
    </div>
  );
};

export default BrowserChatFrom;
