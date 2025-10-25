import React from "react";
import { useSelector } from "react-redux";
import "./image.css";
import "./BrowserChat.css"

const GroupSection = ({ searchTerm, handleOpenChat }) => {
  const { groupData } = useSelector((store) => store.groupsDataStore);

  const filteredGroups = groupData.filter(
    (group) =>
      group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="chat-list">
      {filteredGroups.map((group) => (
        <div
          key={group.id}
          className="chat-list-item"
          onClick={() =>
            handleOpenChat({
              id: group.id,
              name: group.name,
              message: group.description || "",
              time: group.createdAt || "",
              unread: false,
              type: "group",
              image: group.groupImage || "",
            })
          }
        >
          <div className="chat-avatar">
            {group.groupImage ? (
              <img
                src={`https://api.eminenture.cloud/uploads/files/${group.groupImage}`}
                alt={group.name}
              />
            ) : (
              <span>
                {group.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </span>
            )}
          </div>
          <div className="chat-list-details">
            <div className="chat-list-header">
              <h3>{group.name}</h3>
              <span>{group.createdAt?.split(" ")[0]}</span>
            </div>
            <div className="chat-list-message">
              <p>{group.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupSection;
