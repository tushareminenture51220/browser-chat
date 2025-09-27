"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import "./BrowserChatFrom.css";

const BrowserChatFrom = ({ msg }) => {
  const { message_text, created_at, is_deleted } = msg;
  const [LoggedInUser, setLoggedInUser] = useState(null);
  const { usersData = [] } = useSelector((store) => store.usersData);

  useEffect(() => {
    const LoggedInUserData = Cookies.get("HRMS_LoggedIn_UserData")
      ? JSON.parse(Cookies.get("HRMS_LoggedIn_UserData"))
      : null;
    setLoggedInUser(LoggedInUserData);
  }, []);

  return (
    <div className="chat-bubble-row self">
      <div className="chat-bubble-container from">
        <p className={`chat-message-text ${is_deleted ? "deleted" : ""}`}>
          {is_deleted ? "This message was deleted" : message_text}
        </p>
      </div>
    </div>
  );
};

export default BrowserChatFrom;
