"use client";

import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { getGroupsData } from "../getGroupsData/action";

// CREATE GROUP CONSTANTS
export const CREATE_GROUP_LOADING = "CREATE_GROUP_LOADING";
export const CREATE_GROUP_SUCCESS = "CREATE_GROUP_SUCCESS";
export const CREATE_GROUP_ERROR = "CREATE_GROUP_ERROR";

// UPDATE GROUP CONSTANTS
export const UPDATE_GROUP_LOADING = "UPDATE_GROUP_LOADING";
export const UPDATE_GROUP_SUCCESS = "UPDATE_GROUP_SUCCESS";
export const UPDATE_GROUP_ERROR = "UPDATE_GROUP_ERROR";

// 🔹 CREATE GROUP ACTIONS
const createGroupLoading = () => ({
  type: CREATE_GROUP_LOADING,
});
const createGroupSuccess = (payload) => ({
  type: CREATE_GROUP_SUCCESS,
  payload,
});
const createGroupError = (payload) => ({
  type: CREATE_GROUP_ERROR,
  payload,
});

export const createGroup = (payload) => (dispatch) => {
  dispatch(createGroupLoading());

  axios({
    url: `${import.meta.env.VITE_HRMS_MA_API}/api/create-group`,
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    data: JSON.stringify(payload),
  })
    .then((res) => {
      toast.success(res?.data?.message || "Group created successfully");
      dispatch(createGroupSuccess(res?.data));
      dispatch(getGroupsData()); // 🔄 Refresh group list
    })
    .catch((error) => {
      toast.error(error?.response?.data?.message || "Failed to create group");
      dispatch(createGroupError(error?.response?.data?.message));
    });
};

// 🔹 UPDATE GROUP ACTIONS
const updateGroupLoading = () => ({
  type: UPDATE_GROUP_LOADING,
});
const updateGroupSuccess = (payload) => ({
  type: UPDATE_GROUP_SUCCESS,
  payload,
});
const updateGroupError = (payload) => ({
  type: UPDATE_GROUP_ERROR,
  payload,
});

export const updateGroup = (payload) => (dispatch) => {
  dispatch(updateGroupLoading());

  axios({
    url: `${import.meta.env.VITE_HRMS_MA_API}/api/update-group`,
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    data: JSON.stringify(payload),
  })
    .then((res) => {
      toast.success(res?.data?.message || "Group updated successfully");
      dispatch(updateGroupSuccess(res?.data));
      dispatch(getGroupsData());
    })
    .catch((error) => {
      toast.error(error?.response?.data?.message || "Failed to update group");
      dispatch(updateGroupError(error?.response?.data?.message));
    });
};
