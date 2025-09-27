"use client";

import axios from "axios";

// ✅ Action Types
export const GET_NOTIFICATIONS_LOADING = "GET_NOTIFICATIONS_LOADING";
export const GET_NOTIFICATIONS_SUCCESS = "GET_NOTIFICATIONS_SUCCESS";
export const GET_NOTIFICATIONS_ERROR = "GET_NOTIFICATIONS_ERROR";

export const MARK_NOTIFICATION_READ_SUCCESS = "MARK_NOTIFICATION_READ_SUCCESS";
export const MARK_NOTIFICATION_READ_ERROR = "MARK_NOTIFICATION_READ_ERROR";

export const DELETE_NOTIFICATION_SUCCESS = "DELETE_NOTIFICATION_SUCCESS";
export const DELETE_NOTIFICATION_ERROR = "DELETE_NOTIFICATION_ERROR";

// ✅ Loading
const getNotificationsLoading = () => ({
  type: GET_NOTIFICATIONS_LOADING,
});

// ✅ Success and Error Actions
const getNotificationsSuccess = (payload) => ({
  type: GET_NOTIFICATIONS_SUCCESS,
  payload,
});

const getNotificationsError = (payload) => ({
  type: GET_NOTIFICATIONS_ERROR,
  payload,
});

const markNotificationReadSuccess = (payload) => ({
  type: MARK_NOTIFICATION_READ_SUCCESS,
  payload,
});

const markNotificationReadError = (payload) => ({
  type: MARK_NOTIFICATION_READ_ERROR,
  payload,
});

const deleteNotificationSuccess = (payload) => ({
  type: DELETE_NOTIFICATION_SUCCESS,
  payload,
});

const deleteNotificationError = (payload) => ({
  type: DELETE_NOTIFICATION_ERROR,
  payload,
});

// ✅ Thunks / Async Actions

// Get notifications by user
export const getNotificationsByUser = (userId) => (dispatch) => {
  // console.log("id", userId);
  dispatch(getNotificationsLoading());

  axios
    .get(`${import.meta.env.VITE_HRMS_MA_API}/api/getNotification/${userId}`)
    .then((res) => {
      dispatch(getNotificationsSuccess(res.data.data));
    })
    .catch((error) => {
      dispatch(getNotificationsError(error?.response?.data));
    });
};

// Mark notification as read
export const markNotificationRead = (notificationId) => (dispatch) => {
  axios
    .put(`${import.meta.env.VITE_HRMS_MA_API}/api/read/${notificationId}`)
    .then((res) => dispatch(markNotificationReadSuccess(res.data.data)))
    .catch((error) =>
      dispatch(markNotificationReadError(error?.response?.data))
    );
};

// Delete notification
export const deleteNotification = (notificationId) => (dispatch) => {
  axios
    .delete(
      `${import.meta.env.VITE_HRMS_MA_API}/api/delete/${notificationId}`
    )
    .then((res) => dispatch(deleteNotificationSuccess(notificationId)))
    .catch((error) => dispatch(deleteNotificationError(error?.response?.data)));
};
