import {
  ADD_PIN_CHAT_LOADING,
  ADD_PIN_CHAT_SUCCESS,
  ADD_PIN_CHAT_ERROR,
  GET_PIN_CHATS_LOADING,
  GET_PIN_CHATS_SUCCESS,
  GET_PIN_CHATS_ERROR,
  DELETE_PIN_CHAT_SUCCESS,
} from "./actionTypes";

const initialState = {
  loading: false,
  pinChatsData: [],
  error: null,
};

export const pinChatsReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_PIN_CHAT_LOADING:
    case GET_PIN_CHATS_LOADING:
      return { ...state, loading: true, error: null };

    case ADD_PIN_CHAT_SUCCESS:
      return {
        ...state,
        loading: false,
        pinChatsData: [...state.pinChatsData, action.payload],
      };

    case GET_PIN_CHATS_SUCCESS:
      return {
        ...state,
        loading: false,
        pinChatsData: action.payload,
      };

    case DELETE_PIN_CHAT_SUCCESS:
      return {
        ...state,
        pinChatsData: state.pinChatsData.filter(
          (chat) => chat.id !== action.payload
        ),
      };

    case ADD_PIN_CHAT_ERROR:
    case GET_PIN_CHATS_ERROR:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};
