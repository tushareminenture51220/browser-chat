import { createReducer } from "@reduxjs/toolkit";
import {
  setIncomingCallPopup,
  setOutgoingCallPopup,
  setCallAccepted,
  setCallRejected,
  setCallEnded,
  setLocalStream,
  setRemoteStream,
  setAnswer,
  clearCallState,
} from "./action";

const initialState = {
  isIncomingCall: false,
  isOutgoingCall: false,
  isCallActive: false,
  isVideoCall: false,
  callType: null,           // "audio" | "video"
  callStatus: "idle",       // "idle" | "ringing" | "accepted" | "rejected" | "ended"

  // 1-to-1 Call Data
  from: null,
  to: null,
  callerName: null,
  callerImage: null,

  // Group Info (if it's a group call)
  isGroup: false,
  groupId: null,
  groupName: null,
  groupImage: null,

  // Media
  offer: null,
  answer: null,
  localStream: null,
  remoteStream: null,
};

const callReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setIncomingCallPopup, (state, action) => {
      const {
        isVideoCall,
        callType,
        offer,
        from,
        callerName,
        callerImage,
        isGroup,
        groupId,
        groupName,
        groupImage,
      } = action.payload;

      state.isIncomingCall = true;
      state.isOutgoingCall = false;
      state.isCallActive = false;
      state.isVideoCall = isVideoCall || false;
      state.callType = callType || "audio";
      state.callStatus = "ringing";

      // Caller Info
      state.offer = offer || null;
      state.from = from || null;
      state.callerName = callerName || null;
      state.callerImage = callerImage || null;

      // Group Info
      state.isGroup = isGroup || false;
      state.groupId = groupId || null;
      state.groupName = groupName || null;
      state.groupImage = groupImage || null;
    })

    .addCase(setOutgoingCallPopup, (state, action) => {
      const {
        to,
        isVideoCall,
        callType,
        isGroup,
        groupId,
        groupName,
        groupImage,
      } = action.payload;

      state.isOutgoingCall = true;
      state.isIncomingCall = false;
      state.isCallActive = false;
      state.isVideoCall = isVideoCall || false;
      state.callType = callType || "audio";
      state.callStatus = "ringing";

      // Receiver Info
      state.to = to || null;

      // Group Info
      state.isGroup = isGroup || false;
      state.groupId = groupId || null;
      state.groupName = groupName || null;
      state.groupImage = groupImage || null;
    })

    .addCase(setCallAccepted, (state) => {
      state.callStatus = "accepted";
      state.isCallActive = true;
    })

    .addCase(setCallRejected, (state) => {
      state.callStatus = "rejected";
      state.isCallActive = false;
    })

    .addCase(setCallEnded, (state) => {
      state.callStatus = "ended";
      state.isCallActive = false;
    })

    .addCase(setLocalStream, (state, action) => {
      state.localStream = action.payload;
    })

    .addCase(setRemoteStream, (state, action) => {
      state.remoteStream = action.payload;
    })

    .addCase(setAnswer, (state, action) => {
      state.answer = action.payload;
    })

    .addCase(clearCallState, () => initialState);
});

export default callReducer;
