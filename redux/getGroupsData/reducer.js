"use client";

import {
  GET_GROUPS_ERROR,
  GET_GROUPS_LOADING,
  GET_GROUPS_SUCCESS,
} from "./action";

const initState = {
  loading: false,
  groupData: null,
  error: null,
};

export const getGroupReducer = (state = initState, action) => {
  switch (action.type) {
    case GET_GROUPS_LOADING:
      return {
        ...state,
        loading: true,
      };
    case GET_GROUPS_SUCCESS:
      return {
        ...state,
        loading: false,
        groupData: action.payload,
      };

    case GET_GROUPS_ERROR:
      return {
        ...state,
        loading: false,
        groupData: null,
        error: action.payload,
      };

    default:
      return state;
  }
};
