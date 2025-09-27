import { useState, useEffect } from "react";

const useFormattedTime = (dateString) => {
  const [formattedTime, setFormattedTime] = useState("");

  useEffect(() => {
    const getFormattedTime = (date) => {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };

    if (dateString) {
      const date = new Date(dateString);
      setFormattedTime(getFormattedTime(date));
    } else {
      const currentDate = new Date();
      setFormattedTime(getFormattedTime(currentDate));
    }
  }, [dateString]);

  return formattedTime;
};

export default useFormattedTime;
