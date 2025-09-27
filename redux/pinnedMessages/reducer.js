import {
  GET_PINNED_MESSAGES_LOADING,
  GET_PINNED_MESSAGES_SUCCESS,
  GET_PINNED_MESSAGES_ERROR,
  ADD_PINNED_MESSAGE_SUCCESS,
  DELETE_PINNED_MESSAGE_SUCCESS,
} from "./actionTypes";

const initialState = {
  loading: false,
  error: null,
  pinnedMessages: [],
};

export const pinnedMessagesReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_PINNED_MESSAGES_LOADING:
      return { ...state, loading: true, error: null };

    case GET_PINNED_MESSAGES_SUCCESS:
      return { ...state, loading: false, pinnedMessages: action.payload };

    case GET_PINNED_MESSAGES_ERROR:
      return { ...state, loading: false, error: action.payload };

    case ADD_PINNED_MESSAGE_SUCCESS:
      return {
        ...state,
        pinnedMessages: [action.payload, ...state.pinnedMessages],
      };

    case DELETE_PINNED_MESSAGE_SUCCESS:
      return {
        ...state,
        pinnedMessages: state.pinnedMessages.filter(
          (msg) => msg._id !== action.payload
        ),
      };

    default:
      return state;
  }
};
