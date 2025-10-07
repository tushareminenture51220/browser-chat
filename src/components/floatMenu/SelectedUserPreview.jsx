"use client";

import React from "react";
import { Icon } from "@iconify/react";
import "./SelectedUserPreview.css";

const SelectedUserPreview = ({ selectedUsersData, removeParticipant }) => {
  return (
    <div className="selected-user-preview">
      {selectedUsersData?.map((user, index) => (
        <span key={index} className="user-chip">
          <img
            src={user?.profile_image || ""}
            alt="User"
            className="user-avatar"
            width={22}
            height={22}
          />
          <span className="user-name">{user?.first_name}</span>
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
