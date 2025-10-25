import React from "react";
import "./TaggedPerson.css";
import "./image.css"
const TaggedPerson = ({ users, selectUser }) => {
  return (
    <div className="tagged-person-dropdown">
      {users.map((user) => (
        <div
          key={user.id}
          className="tagged-person-item"
          onClick={() => selectUser(user)}
        >
          <div className="chat-avatar">
            {user.user_profile ? (
              <img
                src={
                  user?.user_profile
                    ? `https://api.eminenture.cloud/uploads/files/${user.user_profile}`
                    : "/default-user.png"
                }
                alt={user?.first_name || "User"}
              />
            ) : (
              <div className="default-avatar">{user.first_name[0]}</div>
            )}
          </div>
          <div className="tagged-person-info">
            <span className="tagged-person-name">
              {user.first_name} {user.last_name || ""}
            </span>
            <span className="tagged-person-email">{user.email}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaggedPerson;
