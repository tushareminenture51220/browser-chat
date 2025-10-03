import axios from "axios";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import {
  setMeetingStart,
  startOutgoingCall,
} from "../redux/audioVideoCall/callSlice";

/**
 * Generate a unique meeting link.
 */
export const generateMeetingLink = (groupId, roomName) => {
  const uniqueId = uuidv4();
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  return `${baseUrl}/group/${groupId}/${roomName}/${uniqueId}`;
};

/**
 * Handle starting an audio call (works for 1v1 + group).
 */
export const handleAudioCall = async ({
  currentUser,
  userData,
  type,
  groupMembersData = [],
  socket,
  dispatch,
}) => {
  if (!currentUser || !userData?.id) return;

  const isGroupCall = type === "Group";
  const roomName = `room_${currentUser.id}_${userData.id}_${Date.now()}`;
  const meetingLink = generateMeetingLink(userData.id, roomName);

  try {
    if (isGroupCall) {
      await startGroupAudioCall({
        currentUser,
        userData,
        roomName,
        meetingLink,
        groupMembersData,
        socket,
        dispatch,
      });
    } else {
      await startOneToOneAudioCall({
        currentUser,
        userData,
        roomName,
        socket,
        dispatch,
      });
    }
  } catch (err) {
    console.error("❌ Audio call failed:", err);
    toast.error("Something went wrong while starting the call.");
  }
};

/**
 * Starts a group audio call.
 */
const startGroupAudioCall = async ({
  currentUser,
  userData,
  roomName,
  meetingLink,
  groupMembersData,
  socket,
  dispatch,
}) => {
  try {
    // 1️⃣ Save group call data in DB
    await axios.post(
      `${import.meta.env.VITE_HRMS_MA_API}/api/addGroupCallData`,
      {
        groupId: userData.id,
        initiated_by: currentUser.id,
        members_joined: [currentUser.id],
        roomName,
        meeting_link: meetingLink,
        meeting_interval: null,
        mode: "audio",
      }
    );
  } catch (err) {
    console.error("❌ Failed to save group call start:", err);
    toast.error("Unable to initiate group call.");
    return;
  }

  // 2️⃣ Filter members to notify
  const membersToNotify = groupMembersData.filter(
    (member) => member.user_id !== currentUser.id
  );

  if (!membersToNotify.length) {
    toast.info("Please add members to start a group call.");
    return;
  }

  // 3️⃣ Notify group members
  socket.current.emit("group-call-user", {
    groupId: userData.id,
    groupName: userData.name,
    groupImage: userData.groupImage,
    callType: "group-audio",
    callerId: currentUser.id,
    callerName: currentUser.first_name,
    roomName,
    meetingLink,
    image: currentUser?.image,
  });

  // 4️⃣ Update Redux
  dispatch(
    startOutgoingCall({
      isGroup: true,
      groupId: userData.id,
      groupName: userData.name,
      groupImage: userData.groupImage || "",
      callType: "group-audio",
      roomName,
      meetingLink,
      callerId: currentUser.id,
    })
  );
  dispatch(setMeetingStart(Date.now()));
};

/**
 * Starts a 1v1 audio call.
 */
const startOneToOneAudioCall = async ({
  currentUser,
  userData,
  roomName,
  socket,
  dispatch,
}) => {
  // 1️⃣ Update Redux
  dispatch(
    startOutgoingCall({
      receiverId: userData.id,
      receiverName: userData.first_name,
      receiverImage: userData.profile,
      callerId: currentUser.id,
      callerName: currentUser.first_name,
      callerImage: currentUser.image || "",
      callType: "audio",
      roomName,
    })
  );

  // 2️⃣ Emit socket event
  socket.current.emit("call-user", {
    callType: "audio",
    callerId: currentUser.id,
    callerName: currentUser.first_name,
    callerImage: currentUser.image || "",
    receiverId: userData.id,
    roomName,
  });
};
