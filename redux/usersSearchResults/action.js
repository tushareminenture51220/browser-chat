"use client";

import axios from "axios";
export const GET_SEARCH_USERS_LOADING = "GET_SEARCH_USERS_LOADING";
export const GET_SEARCH_USERS_SUCCESS = "GET_SEARCH_USERS_SUCCESS";
export const GET_SEARCH_USERS_ERROR = "GET_SEARCH_USERS_ERROR";


const getSearchUsersloading = () => ({
  type: GET_SEARCH_USERS_LOADING,
});
const getSearchUsersSuccess = (payload) => ({
  type: GET_SEARCH_USERS_SUCCESS,
  payload,
});
const getSearchUsersError = (payload) => ({
  type: GET_SEARCH_USERS_ERROR,
  payload,
});

export const getSearchResultsUsersData = (params, endpoint) => (dispatch) => {
  // console.log("usersDataCalled");
  dispatch(getSearchUsersloading());
  axios({
    url: `${import.meta.env.VITE_HRMS_MA_API}/api/${endpoint}`,
    method: "GET",
    params: params,
  })
    .then((res) => {
      dispatch(getSearchUsersSuccess(res?.data?.data));
      //console.log("search data: ", res);
    })
    .catch((error) => {
      console.log(error?.response?.data);
      dispatch(getSearchUsersError(error?.response?.data));
    });
};
