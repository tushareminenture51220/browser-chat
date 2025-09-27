import axios from "axios";
import { toast } from "react-toastify";
import {
  ADD_PIN_CHAT_LOADING,
  ADD_PIN_CHAT_SUCCESS,
  ADD_PIN_CHAT_ERROR,
  GET_PIN_CHATS_LOADING,
  GET_PIN_CHATS_SUCCESS,
  GET_PIN_CHATS_ERROR,
  DELETE_PIN_CHAT_SUCCESS,
} from "./actionTypes";

const API = import.meta.env.VITE_HRMS_MA_API;

// ✅ Add Pin Chat
export const addPinChatAction = (payload) => async (dispatch) => {
  dispatch({ type: ADD_PIN_CHAT_LOADING });
  try {
    const res = await axios.post(`${API}/api/add-pin`, payload);
    dispatch({ type: ADD_PIN_CHAT_SUCCESS, payload: res.data.data });

    toast.success("Chat pinned successfully!");

    // Refresh the pin list
    dispatch(getPinChatsAction(payload.pinned_by_user_id));
  } catch (err) {
    const errorMsg = err.response?.data?.message || "Failed to pin chat.";
    dispatch({ type: ADD_PIN_CHAT_ERROR, payload: errorMsg });
    toast.error(errorMsg);
  }
};

// ✅ Get Pin Chats for a user
export const getPinChatsAction = (userId) => async (dispatch) => {
  dispatch({ type: GET_PIN_CHATS_LOADING });
  try {
    const res = await axios.get(`${API}/api/get-pins/${userId}`);
    dispatch({ type: GET_PIN_CHATS_SUCCESS, payload: res.data.data });
  } catch (err) {
    const errorMsg =
      err.response?.data?.message || "Failed to fetch pin chats.";
    dispatch({ type: GET_PIN_CHATS_ERROR, payload: errorMsg });
    toast.error(errorMsg);
  }
};

// ✅ Delete a pinned chat
export const deletePinChatAction = (id, userId) => async (dispatch) => {
  try {
    await axios.delete(`${API}/api/delete-pin/${id}`);
    dispatch({ type: DELETE_PIN_CHAT_SUCCESS, payload: id });
    toast.success("Pin removed successfully.");

    if (userId) {
      await dispatch(getPinChatsAction(userId));
    }
  } catch (err) {
    console.error("❌ Delete error:", err);
    toast.error("Failed to delete pin.");
  }
};
