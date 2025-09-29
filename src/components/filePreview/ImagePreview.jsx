"use client";

import React from "react";
import { fileTypeIdentifier } from "../../../redux/fileUploader/action";
import "./imagePreview.css";

const ImagePreview = ({ attachment_name, is_deleted }) => {
  if (is_deleted || !attachment_name || !fileTypeIdentifier(attachment_name)) {
    return null;
  }

  return (
    <div className="file-preview-container">
      <a
        href={`https://eminenture.live/public/chatting-files/${attachment_name}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src={`https://eminenture.live/public/chatting-files/${attachment_name}`}
          alt="Preview"
          className="file-preview-image"
        />
      </a>
    </div>
  );
};

export default ImagePreview;
