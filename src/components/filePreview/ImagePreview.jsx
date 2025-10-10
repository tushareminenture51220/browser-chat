import React from "react";
import { fileTypeIdentifier } from "../../../redux/fileUploader/action";
import { Download } from "lucide-react";
import "./imagePreview.css";
import { handleDownload } from "../../../utils/download";

const ImagePreview = ({ attachment_name, is_deleted }) => {
  if (is_deleted || !attachment_name || !fileTypeIdentifier(attachment_name)) {
    return null;
  }

  const fileUrl = `https://eminenture.live/public/chatting-files/${attachment_name}`;

  return (
    <div className="file-preview-container">
      <a href={fileUrl} target="_blank" rel="noopener noreferrer">
        <img src={fileUrl} alt="Preview" className="file-preview-image" />
      </a>

      {/* Download Button */}
      <button className="download-btn" onClick={() => handleDownload(fileUrl, attachment_name)}>
        <Download size={18} />
      </button>
    </div>
  );
};

export default ImagePreview;
