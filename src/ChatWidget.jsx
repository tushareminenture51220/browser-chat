// ChatWidget.jsx
import React, { useEffect, useState } from "react";
import BrowserChat from "./BrowserChat";
import { Icon } from "@iconify/react";
import "./ChatWidget.css";
import { useDispatch, useSelector } from "react-redux";
import { getUsersData } from "../redux/users/action";
import { getGroupsData } from "../redux/getGroupsData/action";

const ChatWidget = () => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const { usersData, loggedInUser } = useSelector((store) => store.usersData);
  const { groupData } = useSelector((store) => store.groupsDataStore);
  // console.log("loggedInUser", loggedInUser)

  useEffect(() => {
    dispatch(getUsersData());
    dispatch(getGroupsData());
  }, [dispatch]);

  return (
    <>
      {/* Floating Chat Icon */}
      {!open && (
        <button
          className="chat-floating-btn"
          onClick={() => setOpen(true)}
          aria-label="Open Chat"
        >
          <Icon icon="mdi:chat" width={28} height={28} />
        </button>
      )}

      {/* Browser Chat Sidebar */}
      {open && (
        <BrowserChat
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default ChatWidget;
