"use client";

import {
  GET_GROUPS_MEMBERS_LOADING,
  GET_GROUPS_MEMBERS_SUCCESS,
  GET_GROUPS_MEMBERS_ERROR,
  GET_AUTHENTICATED_MEMBERS,
} from "./action";

const initState = {
  loading: false,
  groupMembersData: null,
  authenticatedMembers: [],
  error: null,
};

export const getGroupMembersReducer = (state = initState, action) => {
  switch (action.type) {
    case GET_GROUPS_MEMBERS_LOADING:
      return {
        ...state,
        loading: true,
      };
    case GET_GROUPS_MEMBERS_SUCCESS:
      return {
        ...state,
        loading: false,
        groupMembersData: action.payload,
      };
    case GET_AUTHENTICATED_MEMBERS:
      return {
        ...state,
        loading: false,
        authenticatedMembers: action.payload,
      };
    case GET_GROUPS_MEMBERS_ERROR:
      return {
        ...state,
        loading: false,
        groupMembersData: null,
        error: action.payload,
      };

    default:
      return state;
  }
};
