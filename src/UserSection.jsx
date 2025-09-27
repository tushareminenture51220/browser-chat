import React from "react";
import { useSelector } from "react-redux";
import "./image.css"

const UserSection = ({ searchTerm, handleOpenChat }) => {
  const { usersData } = useSelector((store) => store.usersData);

  const filteredUsers = usersData.filter(
    (user) =>
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              unread: false,
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
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span>{user.first_name ? user.first_name[0].toUpperCase() : "U"}</span>
            )}
          </div>
          <div className="chat-list-details">
            <div className="chat-list-header">
              <h3>{user.first_name}</h3>
              <span></span>
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
