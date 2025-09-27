"use client";

import {
  GET_SEARCH_USERS_LOADING,
  GET_SEARCH_USERS_SUCCESS,
  GET_SEARCH_USERS_ERROR,
} from "./action";

const initState = {
  loading: false,
  usersData: null,
  error: null,
};

export const searchResultUsersReducer = (state = initState, action) => {
  switch (action.type) {
    case GET_SEARCH_USERS_LOADING:
      return {
        ...state,
        loading: true,
      };
    case GET_SEARCH_USERS_SUCCESS:
      return {
        ...state,
        loading: false,
        usersData: action.payload,
      };
    case GET_SEARCH_USERS_ERROR:
      return {
        ...state,
        loading: false,
        usersData: null,
        error: action.payload,
      };

    default:
      return state;
  }
};
