"use client";

import axios from "axios";
import Cookies from "js-cookie";

// 🔹 Action Types
export const GET_EVENTS_LOADING = "GET_EVENTS_LOADING";
export const GET_EVENTS_SUCCESS = "GET_EVENTS_SUCCESS";
export const GET_EVENTS_ERROR = "GET_EVENTS_ERROR";

export const ADD_EVENT_SUCCESS = "ADD_EVENT_SUCCESS";
export const EDIT_EVENT_SUCCESS = "EDIT_EVENT_SUCCESS";
export const DELETE_EVENT_SUCCESS = "DELETE_EVENT_SUCCESS";

export const GET_UPCOMING_EVENTS_SUCCESS = "GET_UPCOMING_EVENTS_SUCCESS";

// 🔹 Action Creators
const getEventsLoading = () => ({
  type: GET_EVENTS_LOADING,
});

export const getEventsSuccess = (payload) => ({
  type: GET_EVENTS_SUCCESS,
  payload,
});

const getEventsError = (payload) => ({
  type: GET_EVENTS_ERROR,
  payload,
});

export const addEventSuccess = (payload) => ({
  type: ADD_EVENT_SUCCESS,
  payload,
});

export const editEventSuccess = (payload) => ({
  type: EDIT_EVENT_SUCCESS,
  payload,
});

export const deleteEventSuccess = (payload) => ({
  type: DELETE_EVENT_SUCCESS,
  payload,
});

// ✅ Get events by user
export const getEventsByUser = () => (dispatch) => {
  const LoggedInUserData = JSON.parse(Cookies.get("HRMS_LoggedIn_UserData"));
  const HRMS_Auth_Token = Cookies.get("HRMS_Auth_Token");

  dispatch(getEventsLoading());
  axios({
    url: `${import.meta.env.VITE_HRMS_MA_API}/api/user/${LoggedInUserData?.id}`,
    method: "GET",
    headers: { Authorization: `Bearer ${HRMS_Auth_Token}` },
  })
    .then((res) => {
      dispatch(getEventsSuccess(res.data.data));
    })
    .catch((error) => {
      console.log(error?.response?.data);
      dispatch(getEventsError(error?.response?.data));
    });
};

// ✅ Get all events
export const getAllEvents = () => (dispatch) => {
  const HRMS_Auth_Token = Cookies.get("HRMS_Auth_Token");

  dispatch(getEventsLoading());
  axios({
    url: `${import.meta.env.VITE_HRMS_MA_API}/api/all`,
    method: "GET",
    headers: { Authorization: `Bearer ${HRMS_Auth_Token}` },
  })
    .then((res) => {
      dispatch(getEventsSuccess(res.data.data));
    })
    .catch((error) => {
      console.log(error?.response?.data);
      dispatch(getEventsError(error?.response?.data));
    });
};

// ✅ Add new event
export const addEvent = (eventData) => (dispatch) => {
  const HRMS_Auth_Token = Cookies.get("HRMS_Auth_Token");

  axios({
    url: `${import.meta.env.VITE_HRMS_MA_API}/api/add-event`,
    method: "POST",
    headers: { Authorization: `Bearer ${HRMS_Auth_Token}` },
    data: eventData,
  })
    .then((res) => {
      dispatch(addEventSuccess(res.data));
      dispatch(getEventsByUser());
    })
    .catch((error) => {
      console.log(error?.response?.data);
      dispatch(getEventsError(error?.response?.data));
    });
};

// ✅ Edit event
export const editEvent = (id, eventData) => (dispatch) => {
  const HRMS_Auth_Token = Cookies.get("HRMS_Auth_Token");

  axios({
    url: `${import.meta.env.VITE_HRMS_MA_API}/api/edit/${id}`,
    method: "PUT",
    headers: { Authorization: `Bearer ${HRMS_Auth_Token}` },
    data: eventData,
  })
    .then((res) => {
      dispatch(editEventSuccess(res.data));
      // refresh list
      dispatch(getEventsByUser());
    })
    .catch((error) => {
      console.log(error?.response?.data);
      dispatch(getEventsError(error?.response?.data));
    });
};

// ✅ Delete event
export const deleteEvent = (id) => (dispatch) => {
  const HRMS_Auth_Token = Cookies.get("HRMS_Auth_Token");

  axios({
    url: `${import.meta.env.VITE_HRMS_MA_API}/api/delete/${id}`,
    method: "DELETE",
    headers: { Authorization: `Bearer ${HRMS_Auth_Token}` },
  })
    .then((res) => {
      dispatch(deleteEventSuccess({ id }));
      // refresh list
      dispatch(getEventsByUser());
    })
    .catch((error) => {
      console.log(error?.response?.data);
      dispatch(getEventsError(error?.response?.data));
    });
};

// ✅ Get upcoming events (for reminders / alerts)
export const getUpcomingEvents = () => (dispatch) => {
  const HRMS_Auth_Token = Cookies.get("HRMS_Auth_Token");

  dispatch(getEventsLoading());

  axios({
    url: `${import.meta.env.VITE_HRMS_MA_API}/api/get-upcoming-events`,
    method: "GET",
    headers: { Authorization: `Bearer ${HRMS_Auth_Token}` },
  })
    .then((res) => {
      dispatch({
        type: GET_UPCOMING_EVENTS_SUCCESS,
        payload: res.data.data,
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch(getEventsError(error?.response?.data));
    });
};
