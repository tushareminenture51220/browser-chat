import React, { createContext, useContext, useRef } from "react";

const CallFunctionContext = createContext(null);

export const CallFunctionProvider = ({ children }) => {
  const handleRejoinRef = useRef(null);

  return (
    <CallFunctionContext.Provider value={{ handleRejoinRef }}>
      {children}
    </CallFunctionContext.Provider>
  );
};

export const useCallFunctions = () => useContext(CallFunctionContext);
