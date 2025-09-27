"use client";

import axios from "axios";
import Cookies from "js-cookie";
export const GET_GROUPS_MEMBERS_LOADING = "GET_GROUPS_MEMBERS_LOADING";
export const GET_GROUPS_MEMBERS_SUCCESS = "GET_GROUPS_MEMBERS_SUCCESS";
export const GET_GROUPS_MEMBERS_ERROR = "GET_GROUPS_MEMBERS_ERROR";
export const GET_AUTHENTICATED_MEMBERS = "GET_AUTHENTICATED_MEMBERS";

const getGroupsMembersloading = () => ({
  type: GET_GROUPS_MEMBERS_LOADING,
});

export const getGroupsMembersSuccess = (payload) => ({
  type: GET_GROUPS_MEMBERS_SUCCESS,
  payload,
});

const getGroupsMembersError = (payload) => ({
  type: GET_GROUPS_MEMBERS_ERROR,
  payload,
});

const getMembersData = (payload) => ({
  type: GET_AUTHENTICATED_MEMBERS,
  payload,
});

export const getGroupsMembersData = (groupId) => (dispatch) => {
  dispatch(getGroupsMembersloading());
  axios({
    url: `${import.meta.env.VITE_HRMS_MA_API}/api/get-groupmembers/${groupId}`,
    method: "GET",
  })
    .then((res) => {
      dispatch(getGroupsMembersSuccess(res.data.data));
    })
    .catch((error) => {
      dispatch(getGroupsMembersError(error?.response?.data));
    });
};


export const getAuthenticatedMembers = (groupId) => (dispatch) => {
  axios({
    url: `${import.meta.env.VITE_HRMS_MA_API}/api/getAuthenticatedMembers/${groupId}`,
    method: "GET",
  })
    .then((res) => {
      dispatch(getMembersData(res.data.data));
    })
    .catch((error) => {
      dispatch(getGroupsMembersError(error?.response?.data));
    });
};
