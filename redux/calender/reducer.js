"use client";

import {
  GET_EVENTS_LOADING,
  GET_EVENTS_SUCCESS,
  GET_EVENTS_ERROR,
  GET_UPCOMING_EVENTS_SUCCESS,
  ADD_EVENT_SUCCESS,
  EDIT_EVENT_SUCCESS,
  DELETE_EVENT_SUCCESS,
} from "./action";

const initState = {
  loading: false,
  eventsData: null, // All events
  upcomingEvents: null, // Events with alert/reminder
  error: null,
};

export const calendarReducer = (state = initState, action) => {
  switch (action.type) {
    // 🔹 Loading
    case GET_EVENTS_LOADING:
      return {
        ...state,
        loading: true,
      };

    // 🔹 Get all events
    case GET_EVENTS_SUCCESS:
      return {
        ...state,
        loading: false,
        eventsData: action.payload,
        error: null,
      };

    // 🔹 Get upcoming events (reminders)
    case GET_UPCOMING_EVENTS_SUCCESS:
      return {
        ...state,
        loading: false,
        upcomingEvents: action.payload,
        error: null,
      };

    // 🔹 Error
    case GET_EVENTS_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // 🔹 Add new event
    case ADD_EVENT_SUCCESS:
      return {
        ...state,
        loading: false,
        eventsData: state.eventsData
          ? [...state.eventsData, action.payload]
          : [action.payload],
        upcomingEvents:
          action.payload.alert_type === "remind"
            ? state.upcomingEvents
              ? [...state.upcomingEvents, action.payload]
              : [action.payload]
            : state.upcomingEvents,
        error: null,
      };

    // 🔹 Edit event
    case EDIT_EVENT_SUCCESS:
      return {
        ...state,
        loading: false,
        eventsData: state.eventsData
          ? state.eventsData.map((event) =>
              event.id === action.payload.id ? action.payload : event
            )
          : null,
        upcomingEvents: state.upcomingEvents
          ? state.upcomingEvents.map((event) =>
              event.id === action.payload.id ? action.payload : event
            )
          : state.upcomingEvents,
        error: null,
      };

    // 🔹 Delete event
    case DELETE_EVENT_SUCCESS:
      return {
        ...state,
        loading: false,
        eventsData: state.eventsData
          ? state.eventsData.filter((event) => event.id !== action.payload.id)
          : null,
        upcomingEvents: state.upcomingEvents
          ? state.upcomingEvents.filter(
              (event) => event.id !== action.payload.id
            )
          : state.upcomingEvents,
        error: null,
      };

    default:
      return state;
  }
};
