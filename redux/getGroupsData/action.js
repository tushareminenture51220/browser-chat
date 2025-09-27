"use client";

import axios from "axios";
import Cookies from "js-cookie";
export const GET_GROUPS_LOADING = "GET_GROUPS_LOADING";
export const GET_GROUPS_SUCCESS = "GET_GROUPS_SUCCESS";
export const GET_GROUPS_ERROR = "GET_GROUPS_ERROR";

const getGroupsloading = () => ({
  type: GET_GROUPS_LOADING,
});
export const getGroupsSuccess = (payload) => ({
  type: GET_GROUPS_SUCCESS,
  payload,
});
const getGroupsError = (payload) => ({
  type: GET_GROUPS_ERROR,
  payload,
});

export const getGroupsData = () => (dispatch) => {
  const HRMS_Auth_Token = Cookies.get("HRMS_Auth_Token");
  const LoggedInUserData = JSON.parse(Cookies.get("HRMS_LoggedIn_UserData"));
  dispatch(getGroupsloading());
  axios({
    url: `${import.meta.env.VITE_HRMS_MA_API}/api/get-groups/${LoggedInUserData?.id}`,
    method: "GET",
  })
    .then((res) => {
      dispatch(getGroupsSuccess(res.data.groups));
    })
    .catch((error) => {
      console.log(error?.response?.data);
      dispatch(getGroupsError(error?.response?.data));
    });
};
