import {
  GET_USERS_ERROR,
  GET_USERS_LOADING,
  GET_USERS_SUCCESS,
  GET_ONLINE_USERS,
  GET_USER_LOADING,
  GET_USER_SUCCESS,
  GET_USER_ERROR,
  ADD_USER_LOADING,
  ADD_USER_SUCCESS,
  ADD_USER_ERROR,
  EDIT_USER_LOADING,
  EDIT_USER_SUCCESS,
  EDIT_USER_ERROR,
  SET_LOGGED_IN_USER, // NEW
} from "./action";

const initState = {
  loading: false,
  usersData: null,       // all users list
  user: null,            // for particular user
  loggedInUser: null,    // ✅ NEW (rawUserData saved here)
  error: null,
  onlineUsersData: [],   // online users
  addUserStatus: null,   // for add user response
  editUserStatus: null,  // for edit user response
};

export const usersReducer = (state = initState, action) => {
  switch (action.type) {
    case GET_USERS_LOADING:
    case GET_USER_LOADING:
    case ADD_USER_LOADING:
    case EDIT_USER_LOADING:
      return {
        ...state,
        loading: true,
        error: null,
        addUserStatus: null,
        editUserStatus: null,
      };

    case GET_USERS_SUCCESS:
      return {
        ...state,
        loading: false,
        usersData: action.payload,
        error: null,
      };

    case GET_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload,
        error: null,
      };

    case ADD_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        addUserStatus: action.payload,
        error: null,
      };

    case EDIT_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        editUserStatus: action.payload,
        error: null,
      };

    case GET_USERS_ERROR:
    case GET_USER_ERROR:
    case ADD_USER_ERROR:
    case EDIT_USER_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case GET_ONLINE_USERS:
      return {
        ...state,
        onlineUsersData: action.payload,
      };

    case SET_LOGGED_IN_USER: // ✅ NEW
      return {
        ...state,
        loggedInUser: action.payload,
      };

    default:
      return state;
  }
};
