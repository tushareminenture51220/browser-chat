"use client";

import React from "react";
import { Icon } from "@iconify/react";
import AudioPlayer from "../filePreview/AudioPlayer";
import "./FilePreview.css";

const FilePreview = ({ attachment_name, is_deleted, id }) => {
  if (is_deleted || !attachment_name) return null;

  const fileIcons = {
    pdf: { icon: "mdi:file-pdf-outline", color: "#dc2626" },
    txt: { icon: "mdi:file-document-outline", color: "#ca8a04" },
    doc: { icon: "mdi:file-word-outline", color: "#2563eb" },
    docx: { icon: "mdi:file-word-outline", color: "#2563eb" },
    xls: { icon: "mdi:file-excel-outline", color: "#16a34a" },
    xlsx: { icon: "mdi:file-excel-outline", color: "#16a34a" },
    ppt: { icon: "mdi:file-powerpoint-outline", color: "#ef4444" },
    pptx: { icon: "mdi:file-powerpoint-outline", color: "#ef4444" },
    csv: { icon: "mdi:table-arrow-right", color: "#f97316" },
    json: { icon: "mdi:code-json", color: "#8b5cf6" },
    mp3: { icon: "mdi:music-note-outline", color: "#3b82f6" },
    wav: { icon: "mdi:music-note-outline", color: "#3b82f6" },
  };

  const getFileIcon = (filename) => {
    const ext = filename?.split(".").pop()?.toLowerCase();
    // Only return icon if the extension exists in fileIcons
    return ext && fileIcons[ext] ? fileIcons[ext] : null;
  };

  const fileIconData = getFileIcon(attachment_name);

  // If the extension is not in fileIcons, don't render this component
  if (!fileIconData) return null;

  const { icon, color } = fileIconData;

  return (
    <div className="file-preview-wrapper">
      <div className="file-preview-header">
        <Icon icon={icon} className="file-preview-icon" style={{ color }} />

        <a
          href={`https://eminenture.live/public/chatting-files/${attachment_name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="file-preview-name"
        >
          {attachment_name}
        </a>

        <div className="file-preview-extra">
          {/\.(mp3|wav)$/i.test(attachment_name) && (
            <AudioPlayer id={id} attachment_name={attachment_name} />
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreview;
