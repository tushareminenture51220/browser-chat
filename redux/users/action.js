"use client";

import axios from "axios";
import Cookies from "js-cookie";

// Action types
export const GET_USERS_LOADING = "GET_USERS_LOADING";
export const GET_USERS_SUCCESS = "GET_USERS_SUCCESS";
export const GET_USERS_ERROR = "GET_USERS_ERROR";
export const GET_ONLINE_USERS = "GET_ONLINE_USERS";

export const GET_USER_LOADING = "GET_USER_LOADING";
export const GET_USER_SUCCESS = "GET_USER_SUCCESS";
export const GET_USER_ERROR = "GET_USER_ERROR";

export const ADD_USER_LOADING = "ADD_USER_LOADING";
export const ADD_USER_SUCCESS = "ADD_USER_SUCCESS";
export const ADD_USER_ERROR = "ADD_USER_ERROR";

export const EDIT_USER_LOADING = "EDIT_USER_LOADING";
export const EDIT_USER_SUCCESS = "EDIT_USER_SUCCESS";
export const EDIT_USER_ERROR = "EDIT_USER_ERROR";

// Action creators
const getUsersLoading = () => ({ type: GET_USERS_LOADING });
export const getUsersSuccess = (payload) => ({
  type: GET_USERS_SUCCESS,
  payload,
});
const getUsersError = (payload) => ({ type: GET_USERS_ERROR, payload });
export const getOnlineUsers = (payload) => ({
  type: GET_ONLINE_USERS,
  payload,
});

export const SET_LOGGED_IN_USER = "SET_LOGGED_IN_USER";
export const setLoggedInUser = (payload) => ({
  type: SET_LOGGED_IN_USER,
  payload,
});

const getUserLoading = () => ({ type: GET_USER_LOADING });
export const getUserSuccess = (payload) => ({
  type: GET_USER_SUCCESS,
  payload,
});
const getUserError = (payload) => ({ type: GET_USER_ERROR, payload });

const addUserLoading = () => ({ type: ADD_USER_LOADING });
const addUserSuccess = (payload) => ({ type: ADD_USER_SUCCESS, payload });
const addUserError = (payload) => ({ type: ADD_USER_ERROR, payload });

const editUserLoading = () => ({ type: EDIT_USER_LOADING });
const editUserSuccess = (payload) => ({ type: EDIT_USER_SUCCESS, payload });
const editUserError = (payload) => ({ type: EDIT_USER_ERROR, payload });

// ✅ Fetch all users except logged-in
export const getUsersData = () => (dispatch) => {
  const HRMS_Auth_Token = Cookies.get("HRMS_Auth_Token");
  const LoggedInUserData = JSON.parse(Cookies.get("HRMS_LoggedIn_UserData"));
  dispatch(getUsersLoading());

  axios({
    url: `${import.meta.env.VITE_HRMS_MA_API}/api/get-users/${
      LoggedInUserData?.id
    }`,
    method: "GET",
    headers: { Authorization: `Bearer ${HRMS_Auth_Token}` },
  })
    .then((res) => {
      const FilteredData = res?.data?.data?.filter(
        (user) => user.id !== LoggedInUserData.id
      );
      dispatch(getUsersSuccess(FilteredData));
    })
    .catch((error) => dispatch(getUsersError(error?.response?.data)));
};

// ✅ Fetch particular user (profile data)
export const getParticularUserData = () => (dispatch) => {
  const HRMS_Auth_Token = Cookies.get("HRMS_Auth_Token");
  const LoggedInUserData = JSON.parse(Cookies.get("HRMS_LoggedIn_UserData"));

  if (!HRMS_Auth_Token || !LoggedInUserData?.id) {
    return dispatch(getUserError("Missing auth token or userId"));
  }

  dispatch(getUserLoading());

  axios({
    url: `${import.meta.env.VITE_HRMS_MA_API}/api/get-particular-user/${
      LoggedInUserData.id
    }`,
    method: "GET",
    headers: { Authorization: `Bearer ${HRMS_Auth_Token}` },
  })
    .then((res) => dispatch(getUserSuccess(res?.data?.data)))
    .catch((error) => dispatch(getUserError(error?.response?.data)));
};

// ✅ Add a new user
export const createUser = (userData) => (dispatch) => {
  const HRMS_Auth_Token = Cookies.get("HRMS_Auth_Token");
  dispatch(addUserLoading());

  axios({
    url: `${import.meta.env.VITE_HRMS_MA_API}/api/addUser`,
    method: "POST",
    headers: { Authorization: `Bearer ${HRMS_Auth_Token}` },
    data: userData,
  })
    .then((res) => dispatch(addUserSuccess(res?.data)))
    .catch((error) => dispatch(addUserError(error?.response?.data)));
};

// ✅ Edit an existing user
export const updateUser = (userData) => (dispatch) => {
  const HRMS_Auth_Token = Cookies.get("HRMS_Auth_Token");
  dispatch(editUserLoading());

  axios({
    url: `${import.meta.env.VITE_HRMS_MA_API}/api/editUser`,
    method: "PUT",
    headers: { Authorization: `Bearer ${HRMS_Auth_Token}` },
    data: userData,
  })
    .then((res) => dispatch(editUserSuccess(res?.data)))
    .catch((error) => dispatch(editUserError(error?.response?.data)));
};
