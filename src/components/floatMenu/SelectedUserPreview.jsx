"use client";

import React from "react";
import { Icon } from "@iconify/react";
import "./SelectedUserPreview.css";

const SelectedUserPreview = ({ selectedUsersData, removeParticipant }) => {
  return (
    <div className="selected-user-preview">
      {selectedUsersData?.map((user, index) => (
        <span key={index} className="user-chip">
          {user?.user_profile ? (
            <img
              src={
                `https://eminenture.live/public/chatting-files/${user.user_profile}`
              }
              alt={user?.first_name || "User"}
              className="user-avatar"
              onError={(e) => (e.target.style.display = "none")}
            />
          ) : (
            <img
              src={`https://eminenture.live/public/chatting-files/${user.groupImage}`}
              alt={user?.first_name || user.name}
              className="user-avatar"
              onError={(e) => (e.target.style.display = "none")}
            />
          )}

          <span className="user-card-name">{user?.first_name || user.name}</span>
          <button
            onClick={() => removeParticipant(user?.id, user?.type)}
            type="button"
            className="remove-btn"
            aria-label="Remove"
          >
            <Icon className="remove-icon" icon="line-md:close" />
          </button>
        </span>
      ))}
    </div>
  );
};

export default SelectedUserPreview;
