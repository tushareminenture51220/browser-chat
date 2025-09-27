"use client";

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isIncomingCall: false,
  activeGroupParticipants: [],
  isOutgoingCall: false,
  isCallActive: false,
  callStatus: "idle", // idle, calling, accepted, etc.
  callType: null, // 'audio' or 'video'
  isGroup: false,
  groupId: null,
  groupName: null,
  groupImage: null,
  callData: null,
  peerConnection: null,
  isRemoteSharing: false,
  remoteStream: null,
  incomingOffer: null,
  isScreenSharing: false,
  roomName: null,
  mutedUsers: {},
  meetingLink: "",
  meetingInterval: null,
  meetingStart: null,
};

const callSlice = createSlice({
  name: "call",
  initialState,
  reducers: {
    setIncomingCall(state, action) {
      // console.log("🔥 REDUCER -> setIncomingCall payload:", action.payload);
      state.isIncomingCall = true;
      state.isOutgoingCall = false;
      state.isCallActive = false;
      state.callType = action.payload.callType;
      state.callStatus = "calling";
      state.callData = action.payload.callData;
      state.isGroup = !!action.payload.isGroup;
      state.groupId = action.payload.groupId || null;
      state.groupName = action.payload.groupName || null;
      state.groupImage = action.payload.groupImage || null;
      state.roomName = action.payload.roomName || null;
      state.meetingLink = action.payload.meetingLink || null;
    },

    startOutgoingCall(state, action) {
      // console.log("📞 REDUCER -> startOutgoingAudioCall", action.payload);
      const {
        isGroup = false,
        callType = "audio",
        groupId = null,
        groupName = null,
        groupImage = null,
        callerId = null,
        callerName = "",
        callerImage = "",
        receiverId = null,
        receiverName = "",
        receiverImage = "",
        roomName = null,
        meetingLink = "",
      } = action.payload;

      state.isOutgoingCall = true;
      state.isIncomingCall = false;
      state.isCallActive = false;
      state.callType = callType;
      state.callStatus = "calling";
      state.isGroup = isGroup;

      state.groupId = groupId;
      state.groupName = groupName;
      state.groupImage = groupImage;
      state.roomName = roomName;
      state.meetingLink = meetingLink;

      state.callData = {
        isGroup,
        callType,
        groupId,
        groupName,
        groupImage,
        callerId,
        callerName,
        callerImage,
        receiverId,
        receiverName,
        receiverImage,
        roomName,
        meetingLink,
      };
    },

    setCallActive(state, action) {
      // console.log("🎬 REDUCER -> setCallActive", action.payload);
      state.isCallActive = action.payload;
    },

    setCallStatus(state, action) {
      // console.log("📶 REDUCER -> setCallStatus", action.payload);
      state.callStatus = action.payload;
    },

    // callSlice.js
    setActiveGroupParticipants: (state, action) => {
      const unique = {};
      action.payload.forEach((p) => {
        unique[p.userId] = p; // overwrite if exists
      });
      state.activeGroupParticipants = Object.values(unique);
    },

    setPeerConnection(state, action) {
      // console.log("🖥️ REDUCER -> setPeerConnection", action.payload);
      state.peerConnection = action.payload;
    },

    setIsRemoteSharing(state, action) {
      // console.log("🖥️ REDUCER -> setRemoteSharing", action.payload);
      state.isRemoteSharing = action.payload;
    },

    setIsScreenSharing(state, action) {
      // console.log("🖥️ REDUCER -> setIsScreenSharing", action.payload);
      state.isScreenSharing = action.payload;
    },

    setMeetingStart(state, action) {
      // console.log("🖥️ REDUCER -> setMeetingStart", action.payload);
      state.meetingStart = action.payload;
    },

    setMeetingInterval(state, action) {
      // console.log("🖥️ REDUCER -> setMeetingInterval", action.payload);
      state.meetingInterval = action.payload;
    },
    setMutedUsers: (state, action) => {
      state.mutedUsers = {
        ...state.mutedUsers,
        [action.payload.userId]: action.payload.isMuted,
      };
    },

    clearIncomingCall(state) {
      // console.log("🧹 REDUCER -> clearIncomingCall");
      state.isIncomingCall = false;
      state.callData = null;
      state.callType = null;
      state.isCallActive = false;
      state.callStatus = "idle";
      state.isGroup = false;
      state.groupId = null;
      state.groupName = null;
      state.groupImage = null;
      state.roomName = null;
    },
    setCallData: (state, action) => {
      // console.log("setCallData", action.payload);
      state.callData = action.payload;
    },
    setRemoteStream: (state, action) => {
      state.remoteStream = action.payload;
    },
    setIncomingOffer: (state, action) => {
      state.incomingOffer = action.payload;
    },

    clearCallState(state) {
      // console.log("🧼 REDUCER -> clearCallState");
      Object.assign(state, initialState);
    },
  },
});

export const {
  setIncomingCall,
  startOutgoingCall,
  setCallActive,
  setCallStatus,
  clearIncomingCall,
  setActiveGroupParticipants,
  setPeerConnection,
  setIsRemoteSharing,
  clearCallState,
  setCallData,
  setRemoteStream,
  setIncomingOffer,
  setIsScreenSharing,
  setMutedUsers,
  setMeetingInterval,
  setMeetingStart,
} = callSlice.actions;

export default callSlice.reducer;
