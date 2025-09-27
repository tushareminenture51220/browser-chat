import axios from "axios";
import { toast } from "react-toastify";
import {
  GET_PINNED_MESSAGES_LOADING,
  GET_PINNED_MESSAGES_SUCCESS,
  GET_PINNED_MESSAGES_ERROR,
  ADD_PINNED_MESSAGE_SUCCESS,
  DELETE_PINNED_MESSAGE_SUCCESS,
} from "./actionTypes";
const API = import.meta.env.VITE_HRMS_MA_API;

// ✅ Add pinned message
export const addPinnedMessageAction =
  (msgId, userId, receiverId, isGroup = false) =>
  async (dispatch) => {
    try {
      const res = await axios.post(
        `${API}/api/pin-msg/${msgId}/${userId}/${receiverId}?isGroup=${isGroup}`
      );
      dispatch({ type: ADD_PINNED_MESSAGE_SUCCESS, payload: res.data.data });
      toast.success("Message pinned!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to pin message.");
    }
  };

// ✅ Delete pinned message
export const deletePinnedMessageAction =
  (msgId, userId) => async (dispatch) => {
    try {
      await axios.delete(`${API}/api/unpin-msg/${msgId}/${userId}`);
      dispatch({ type: DELETE_PINNED_MESSAGE_SUCCESS, payload: msgId });
      toast.success("Message unpinned!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to unpin message.");
    }
  };
