import React from "react";
import { Icon } from "@iconify/react";
import "./menu.css";

const FloatingMenu = React.forwardRef(({ message_text, closeMenu, style }, ref) => {
  const handleEdit = () => { alert("Edit"); closeMenu(); };
  const handleCopy = () => { if(message_text) navigator.clipboard.writeText(message_text); closeMenu(); };
  const handleForward = () => { alert("Forward"); closeMenu(); };
  const handleDelete = () => { alert("Delete"); closeMenu(); };

  return (
    <div className="floating-menu-modern" style={style} ref={ref}>
      {message_text && (
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
      <button onClick={handleDelete}>
        <Icon icon="mdi:delete-outline" width="18" height="18" /> Delete
      </button>
    </div>
  );
});

export default FloatingMenu;
