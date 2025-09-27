// app/redux/store.js
"use client";

import {
  applyMiddleware,
  combineReducers,
  compose,
  legacy_createStore as createStore,
} from "redux";
import { thunk } from "redux-thunk";

import { loginReducer } from "./auth/reducer";
import { usersReducer } from "./users/reducer";
import { searchResultUsersReducer } from "./usersSearchResults/reducer";
import { fileDataReducer } from "./fileUploader/reducer";
import { createGroupReducer } from "./groups/reducer";
import { getGroupReducer } from "./getGroupsData/reducer";
import { getGroupMembersReducer } from "./getGroupsMembers/reducer";
import { addParticipantsReducer } from "./addParticipants/reducer";
import { pinChatsReducer } from "./pinChats/reducer";
import callReducer from "./audioVideoCall/callSlice";
import { pinnedMessagesReducer } from "./pinnedMessages/reducer";
import { calendarReducer } from "./calender/reducer";
import { notificationsReducer } from "./notifications/reducer";

const rootReducer = combineReducers({
  login: loginReducer,
  usersData: usersReducer,
  searchResults: searchResultUsersReducer,
  pinnedMessagesStore: pinnedMessagesReducer,
  fileUploaderData: fileDataReducer,
  createGroup: createGroupReducer,
  groupsDataStore: getGroupReducer,
  getGroupMembersStore: getGroupMembersReducer,
  addParticipantsStore: addParticipantsReducer,
  pinChatsStore: pinChatsReducer,
  call: callReducer,
  calendarStore: calendarReducer,
  notificationStore: notificationsReducer,
});

const composeEnhancers =
  typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : compose;

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk))
);

export default store;
