"use client";

import axios from "axios";
export const FILE_UPLOAD_LOADING = "FILE_UPLOAD_LOADING";
export const FILE_UPLOAD_SUCCESS = "FILE_UPLOAD_SUCCESS";
export const FILE_UPLOAD_ERROR = "FILE_UPLOAD_ERROR";

// Action creators
const fileUploadLoading = () => ({
  type: FILE_UPLOAD_LOADING,
});

export const fileUploadSuccess = (payload) => ({
  type: FILE_UPLOAD_SUCCESS,
  payload,
});

const fileUploadError = (payload) => ({
  type: FILE_UPLOAD_ERROR,
  payload,
});

// Thunk action for file upload
export const uploadFile = (file) => async (dispatch) => {
  try {
    dispatch(fileUploadLoading());

    // Create FormData object
    const formData = new FormData();
    formData.append("attachment_file", file);

    // Axios POST request
    const response = await axios.post(
      `${import.meta.env.VITE_HRMS_MA_API}/api/upload-file`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data) {
      dispatch(fileUploadSuccess(response.data));
    }

    console.log("File uploaded successfully:", response.data);
  } catch (error) {
    console.error(
      "Error uploading file:",
      error.response?.data || error.message
    );
    dispatch(fileUploadError(error.message));
  }
};
export const deleteFile =
  (fileName, setFileResData, setShowPreview) => async (dispatch) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_HRMS_MA_API}/api/delete-file`,
        {
          data: { fileName: fileName },
        }
      );
      setFileResData && setFileResData(null);
      setShowPreview && setShowPreview(false);
      console.log("File deleted successfully:", response.data);
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

export const fileTypeIdentifier = (filename) => {
  if (!filename) return false; // Handle empty or undefined filenames

  // List of common image file extensions
  const imageExtensions = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "svg",
    "webp",
    "avif",
    "jfif",
  ];

  const extension = filename.split(".").pop().toLowerCase();

  return imageExtensions.includes(extension);
};
