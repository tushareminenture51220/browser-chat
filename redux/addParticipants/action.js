"use client";

import axios from "axios";
import { toast } from "react-toastify";
import { getGroupsData } from "../getGroupsData/action";
import { getGroupsMembersData } from "../getGroupsMembers/action";
export const ADD_PARTICIPANTS_LOADING = "ADD_PARTICIPANTS_LOADING";
export const ADD_PARTICIPANTS_SUCCESS = "ADD_PARTICIPANTS_SUCCESS";
export const ADD_PARTICIPANTS_ERROR = "ADD_PARTICIPANTS_ERROR";

//login
const addParticipantsloading = () => ({
  type: ADD_PARTICIPANTS_LOADING,
});
const addParticipantsSuccess = (payload) => ({
  type: ADD_PARTICIPANTS_SUCCESS,
  payload,
});
const addParticipantsError = (payload) => ({
  type: ADD_PARTICIPANTS_ERROR,
  payload,
});

export const addParticipantsAction = (groupId, payload) => (dispatch) => {
  dispatch(addParticipantsloading());
  axios({
    url: `${import.meta.env.VITE_HRMS_MA_API}/api/add-participants/${groupId}`,
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    data: JSON.stringify(payload),
  })
    .then((res) => {
      toast.success(res?.data?.message);
      dispatch(addParticipantsSuccess(res?.data));
      dispatch(getGroupsMembersData(groupId));
    })
    .catch((error) => {
      // console.log(error?.response?.data?.message);
      toast.error(error?.response?.data?.message);
      dispatch(addParticipantsError(error?.response?.data?.message));
    });
};
