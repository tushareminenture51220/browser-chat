import { createAction } from "@reduxjs/toolkit";

// Call popup setup
export const setIncomingCallPopup = createAction("call/setIncomingCallPopup");
export const setOutgoingCallPopup = createAction("call/setOutgoingCallPopup");

// Call state changes
export const setCallAccepted = createAction("call/setCallAccepted");
export const setCallRejected = createAction("call/setCallRejected");
export const setCallEnded = createAction("call/setCallEnded");

// WebRTC
export const setLocalStream = createAction("call/setLocalStream");
export const setRemoteStream = createAction("call/setRemoteStream");
export const setAnswer = createAction("call/setAnswer");

// Clear
export const clearCallState = createAction("call/clearCallState");
