"use client";
import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useDispatch, useSelector } from "react-redux";
import { getUsersData } from "../../../redux/users/action";
import { getGroupsData } from "../../../redux/getGroupsData/action";
import SelectedUserPreview from "./SelectedUserPreview";
import InlineLoader from "../../../loaders/InlineLoader";
import Cookies from "js-cookie";
import axios from "axios";
import { toast } from "react-toastify";
import "./ForwardMessageModal.css";

const ForwardMessageModal = ({ onClose, message, onForwarded }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const modalRef = useRef(null);
  const dispatch = useDispatch();

  const { loading: userLoading, usersData = [] } = useSelector(
    (store) => store.usersData
  );
  const { groupData = [], loading: groupLoading } = useSelector(
    (store) => store.groupsDataStore
  );

  const currentUser = JSON.parse(Cookies.get("HRMS_LoggedIn_UserData"));

  useEffect(() => {
    dispatch(getUsersData());
    dispatch(getGroupsData());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleSelectItem = (item, type) => {
    const exists = selectedItems.find(
      (i) => i.id === item.id && i.type === type
    );
    if (!exists) {
      setSelectedItems((prev) => [...prev, { ...item, type }]);
    }
  };

  const handleRemoveItem = (id, type) => {
    setSelectedItems((prev) =>
      prev.filter((item) => !(item.id === id && item.type === type))
    );
  };

  const handleForward = async () => {
    setLoading(true);
    try {
      const receiverIds = selectedItems.map((i) => ({
        id: i.id,
        isGroup: i.type === "group",
      }));

      const res = await axios.post(
        `${import.meta.env.VITE_HRMS_MA_API}/api/forward-msg/${
          currentUser.id
        }/${message.id}/${encodeURIComponent(message.message_text || "null")}`,
        {
          receiverIds,
          sender_name: `${currentUser.first_name} ${currentUser.last_name}`,
        }
      );

      if (res.data.success) {
        toast.success("Message forwarded ✅");
        if (onForwarded) onForwarded(res.data.data);
        onClose();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to forward message ❌");
      }
    }
    setLoading(false);
  };

  const filteredUsers = usersData.filter((user) =>
    `${user.first_name} ${user.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groupData.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="forward-overlay">
      <div ref={modalRef} className="forward-modal">
        <h2 className="forward-title">Forward Message</h2>

        <div className="forward-body">
          {selectedItems.length > 0 && (
            <SelectedUserPreview
              selectedUsersData={selectedItems}
              removeParticipant={(id, type) => handleRemoveItem(id, type)}
            />
          )}

          {/* Search Box */}
          <div className="search-container">
            <div className="search-icon">
              <Icon icon="mingcute:search-line" className="search-icon-inner" />
            </div>
            <input
              type="search"
              placeholder="Search users or groups"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {(userLoading || groupLoading) && <InlineLoader />}

          {/* Users */}
          {filteredUsers?.length > 0 && (
            <div className="section">
              <h3 className="section-title">Users</h3>
              <div className="section-list">
                {filteredUsers.map((user) => {
                  const isSelected = selectedItems.some(
                    (i) => i.id === user.id && i.type === "user"
                  );
                  const displayName = user.first_name?.trim() || user.email;

                  return (
                    <div
                      key={`user-${user.id}`}
                      onClick={() => handleSelectItem(user, "user")}
                      className={`list-item ${isSelected ? "selected" : ""}`}
                    >
                      {/* Avatar */}
                      <div className="item-avatar">
                        {user?.user_profile ? (
                          <img
                            src={`https://eminenture.live/public/chatting-files/${user.user_profile}`}
                            alt={user?.first_name || "User"}
                            className="item-image"
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        ) : (
                          <span className="avatar-fallback">
                            {user?.first_name?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        )}
                      </div>

                      {/* Name & Email */}
                      <div className="item-info">
                        <span className="item-group-name">{displayName}</span>
                        <span className="item-email">{user.email}</span>
                      </div>

                      {isSelected && (
                        <Icon icon="mdi:check-circle" className="item-check" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Groups */}
          {filteredGroups?.length > 0 && (
            <div className="section">
              <h3 className="section-title">Groups</h3>
              <div className="section-list">
                {filteredGroups.map((group) => {
                  const isSelected = selectedItems.some(
                    (i) => i.id === group.id && i.type === "group"
                  );
                  return (
                    <div
                      key={`group-${group.id}`}
                      className={`list-item ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSelectItem(group, "group")}
                    >
                      <div className="chat-avatar">
                        <div className="chat-avatar">
                          {group?.groupImage ? (
                            <img
                              src={`https://eminenture.live/public/chatting-files/${group.groupImage}`}
                              alt={group?.name || "Group"}
                              onError={(e) => (e.target.style.display = "none")}
                            />
                          ) : (
                            <span className="avatar-fallback">
                              {group?.name?.charAt(0)?.toUpperCase() || "G"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="item-name">{group.name}</div>
                      {isSelected && (
                        <Icon icon="mdi:check-circle" className="item-check" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="forward-footer">
          <button onClick={onClose} className="btn-cancel">
            Cancel
          </button>
          <button
            onClick={handleForward}
            disabled={selectedItems.length === 0 || loading}
            className={`btn-send ${
              selectedItems.length === 0 || loading ? "disabled" : ""
            }`}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForwardMessageModal;
