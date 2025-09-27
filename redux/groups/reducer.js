"use client";

import {
  CREATE_GROUP_LOADING,
  CREATE_GROUP_SUCCESS,
  CREATE_GROUP_ERROR,
} from "./action";
import Cookies from "js-cookie";

const initState = {
  loading: false,
  groupRes: null,
  error: null,
};

export const createGroupReducer = (state = initState, action) => {
  switch (action.type) {
    case CREATE_GROUP_LOADING:
      return {
        ...state,
        loading: true,
      };
    case CREATE_GROUP_SUCCESS:
      return {
        ...state,
        loading: false,
        groupRes: action.payload,
      };
    case CREATE_GROUP_ERROR:
      return {
        ...state,
        loading: false,
        groupRes: null,
        error: action.payload,
      };

    default:
      return state;
  }
};
