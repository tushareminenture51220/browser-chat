"use client";

import {
  ADD_PARTICIPANTS_LOADING,
  ADD_PARTICIPANTS_SUCCESS,
  ADD_PARTICIPANTS_ERROR,
} from "./action";

const initState = {
  loading: false,
  addParticipantsRes: null,
  error: null,
};

export const addParticipantsReducer = (state = initState, action) => {
  switch (action.type) {
    case ADD_PARTICIPANTS_LOADING:
      return {
        ...state,
        loading: true,
      };
    case ADD_PARTICIPANTS_SUCCESS:
      return {
        ...state,
        loading: false,
        addParticipantsRes: action.payload,
      };
    case ADD_PARTICIPANTS_ERROR:
      return {
        ...state,
        loading: false,
        addParticipantsRes: null,
        error: action.payload,
      };

    default:
      return state;
  }
};
