import React, { useCallback, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";
import "./filePreview.css";
import { fileTypeIdentifier } from "../../../redux/fileUploader/action";

const FilePreviewPopup = ({
  attachment_file,
  attachment_name = "",
  attachment_size,
  userName,
  dispatch,
  setTextMessage,
  handleSubmit,
  setShowPreview,
  chatId,
  setFileResData,
  groupName,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(true);

  useEffect(() => {
    setUploadProgress(0);
    setIsUploading(true);
  }, [attachment_file]);

  useEffect(() => {
    const uploadFile = async () => {
      if (!attachment_file) return;

      try {
        const formData = new FormData();
        formData.append("attachment_file", attachment_file);

        await axios.post(
          `${import.meta.env.VITE_HRMS_MA_API}/api/upload-file`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percent = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setUploadProgress(percent);
                if (percent === 100) setIsUploading(false);
              }
            },
          }
        );
      } catch (err) {
        console.error("Upload error:", err);
      }
    };

    uploadFile();
  }, [attachment_file]);

  const handleFormSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (isUploading) return;

      setIsVisible(false);
      setTimeout(() => {
        handleSubmit(e);
        setShowPreview(false);
        setFileResData(null);
      }, 300);
    },
    [handleSubmit, setShowPreview, setFileResData, isUploading]
  );

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setFileResData(null);
      setShowPreview(false);
    }, 300);
  }, [setFileResData, setShowPreview]);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  return (
    <div className={`popup-overlay ${isVisible ? "show" : "hide"}`}>
      <div className="popup-backdrop" onClick={handleClose}></div>

      <div className={`popup-container ${isVisible ? "show" : "hide"}`}>
        {/* Header */}
        <div className="popup-header">
          <div className="popup-header-content">
            <div className="popup-header-left">
              <div className="popup-header-icon">
                <Icon icon="mdi:share-outline" className="icon" />
              </div>
              <p className="popup-header-title">
                <span className="bold">Sharing with </span>
                <span className="light">{userName ?? groupName}</span>
              </p>
            </div>
            <button onClick={handleClose} className="popup-close-btn">
              <Icon icon="ion:close" className="icon" />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="popup-preview">
          {attachment_name && fileTypeIdentifier(attachment_name) ? (
            <div className="preview-image-container">
              <img
                src={URL.createObjectURL(attachment_file)}
                alt={`Preview of ${attachment_name}`}
                className="preview-image"
              />
            </div>
          ) : (
            <div className="preview-file">
              <Icon icon="flat-color-icons:file" className="preview-file-icon" />
              <p className="preview-file-name">
                {attachment_name || "No file selected"}
              </p>
              <p className="preview-file-size">
                {attachment_size && `Size: ${attachment_size}`}
              </p>
            </div>
          )}
        </div>

        {/* Input + Progress */}
        <form className="popup-form" onSubmit={handleFormSubmit}>
          {isUploading && (
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
                <div className="progress-glow"></div>
              </div>
              <p className="progress-text">Uploading... {uploadProgress}%</p>
            </div>
          )}

          <div className="message-label">
            <Icon icon="mdi:message-text-outline" className="icon-small" />
            <span>Message</span>
          </div>

          <div className="message-input-container">
            <input
              type="text"
              placeholder="Add a message..."
              className="message-input"
              onChange={(e) => setTextMessage(e.target.value)}
              disabled={isUploading}
            />
            <button
              type="submit"
              disabled={isUploading}
              className={`send-btn ${isUploading ? "disabled" : ""}`}
            >
              <Icon icon="mdi:send" className="icon-small" />
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FilePreviewPopup;
