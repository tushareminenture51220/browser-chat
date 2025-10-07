import React from "react";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";

const FloatingMenu = React.forwardRef(
  ({ message_text, onEdit, onDelete, onForward, closeMenu, style, show = "myself" }, ref) => {
    const handleEdit = () => {
      onEdit();
      closeMenu();
    };

    const handleCopy = () => {
      if (message_text) navigator.clipboard.writeText(message_text);
      toast.success("Message copied");
      closeMenu();
    };

    const handleForward = () => {
      onForward(); // ✅ trigger modal open
      closeMenu();
    };

    const handleDelete = () => {
      onDelete();
      closeMenu();
    };

    return (
      <div className="floating-menu-modern" style={style} ref={ref}>
        {show === "myself" && message_text && (
          <button onClick={handleEdit}>
            <Icon icon="mdi:pencil-outline" width="18" height="18" /> Edit
          </button>
        )}

        {message_text && (
          <button onClick={handleCopy}>
            <Icon icon="mdi:content-copy" width="18" height="18" /> Copy
          </button>
        )}

        <button onClick={handleForward}>
          <Icon icon="mdi:share-outline" width="18" height="18" /> Forward
        </button>

        {show === "myself" && (
          <button onClick={handleDelete}>
            <Icon icon="mdi:delete-outline" width="18" height="18" /> Delete
          </button>
        )}
      </div>
    );
  }
);

export default FloatingMenu;
