"use client";

import {
  GET_NOTIFICATIONS_LOADING,
  GET_NOTIFICATIONS_SUCCESS,
  GET_NOTIFICATIONS_ERROR,
  MARK_NOTIFICATION_READ_SUCCESS,
  MARK_NOTIFICATION_READ_ERROR,
  DELETE_NOTIFICATION_SUCCESS,
  DELETE_NOTIFICATION_ERROR,
} from "./action";

const initState = {
  loading: false,
  notifications: [],
  error: null,
};

export const notificationsReducer = (state = initState, action) => {
  switch (action.type) {
    case GET_NOTIFICATIONS_LOADING:
      return {
        ...state,
        loading: true,
      };

    case GET_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        notifications: action.payload,
        error: null,
      };

    case GET_NOTIFICATIONS_ERROR:
      return {
        ...state,
        loading: false,
        notifications: [],
        error: action.payload,
      };

    case MARK_NOTIFICATION_READ_SUCCESS:
      return {
        ...state,
        notifications: state.notifications.map((notif) =>
          notif.id === action.payload.id ? { ...notif, read: true } : notif
        ),
      };

    case MARK_NOTIFICATION_READ_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    case DELETE_NOTIFICATION_SUCCESS:
      return {
        ...state,
        notifications: state.notifications.filter(
          (notif) => notif.id !== action.payload
        ),
      };

    case DELETE_NOTIFICATION_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
};
