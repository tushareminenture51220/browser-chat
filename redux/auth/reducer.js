"use client";

import {
  GET_LOGIN_ERROR,
  GET_LOGIN_LOADING,
  GET_LOGIN_SUCCESS,
  IS_AUTHENTICATED,
} from "./action";
import Cookies from "js-cookie";

const initState = {
  loading: false,
  res: (() => {
    const userData = Cookies.get("HRMS_LoggedIn_UserData");
    return userData ? JSON.parse(userData) : null;
  })(),
  error: null,
  isAuthenticated: false,
};

export const loginReducer = (state = initState, action) => {
  switch (action.type) {
    case GET_LOGIN_LOADING:
      return {
        ...state,
        loading: true,
      };
    case IS_AUTHENTICATED:
      return {
        ...state,
        loading: false,
        isAuthenticated: action.payload,
      };
    case GET_LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        res: action.payload,
        isAuthenticated: true,
      };
    case GET_LOGIN_ERROR:
      return {
        ...state,
        loading: false,
        res: null,
        error: action.payload,
      };

    default:
      return state;
  }
};
