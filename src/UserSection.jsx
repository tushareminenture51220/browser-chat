import React from "react";
import "./image.css";
import "./BrowserChat.css"

const UserSection = ({ searchTerm, handleOpenChat, usersData }) => {
  // Filter users based on search
  let filteredUsers = usersData?.filter(
    (user) =>
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort users: unread messages first
  filteredUsers.sort((a, b) => {
    if ((b.unreadMessageCount || 0) > 0 && (a.unreadMessageCount || 0) === 0) {
      return 1; // b comes before a
    }
    if ((a.unreadMessageCount || 0) > 0 && (b.unreadMessageCount || 0) === 0) {
      return -1; // a comes before b
    }
    return 0; // keep original order if both have or don't have unread
  });

  return (
    <div className="chat-list">
      {filteredUsers.map((user) => (
        <div
          key={user.id}
          className="chat-list-item"
          onClick={() =>
            handleOpenChat({
              id: user.id,
              name: user.first_name || "Unknown",
              message: user.email || "",
              time: "",
              unread: user.unreadMessageCount || 0,
              type: "user",
              image: user.user_profile || "",
            })
          }
        >
          <div className="chat-avatar">
            {user.user_profile ? (
              <img
                src={`https://eminenture.live/public/chatting-files/${user.user_profile}`}
                alt={user.first_name}
              />
            ) : (
              <span>{user.first_name ? user.first_name[0].toUpperCase() : "U"}</span>
            )}
            {/* Online indicator */}
            <span
              className={`online-indicator ${user.user_status ? "online" : "offline"}`}
            ></span>
          </div>

          <div className="chat-list-details">
            <div className="chat-list-header">
              <h3>{user.first_name}</h3>
              {/* Unread badge */}
              {/* {user.unreadMessageCount > 0 && (
                <span className="unread-badge">{user.unreadMessageCount}</span>
              )} */}
            </div>
            <div className="chat-list-message">
              <p>{user.email}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserSection;
