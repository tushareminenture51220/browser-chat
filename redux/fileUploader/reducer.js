"use client";

import {
  FILE_UPLOAD_LOADING,
  FILE_UPLOAD_SUCCESS,
  FILE_UPLOAD_ERROR,
} from "./action";

const initState = {
  loading: false,
  attachment_name: null,
  attachment_size: null,
  error: null,
};

export const fileDataReducer = (state = initState, action) => {
  switch (action.type) {
    case FILE_UPLOAD_LOADING:
      return {
        ...state,
        loading: true,
      };
    case FILE_UPLOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        attachment_name: action.payload.attachment_name,
        attachment_size: action.payload.attachment_size,
        isAuthenticated: true,
      };
    case FILE_UPLOAD_ERROR:
      return {
        ...state,
        loading: false,
        res: null,
        error: action.payload,
      };
    default:
      return state;
  }
};
