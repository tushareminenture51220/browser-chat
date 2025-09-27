"use client";

import React from "react";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import store from "./store"; // ✅ directly import, no dynamic import
import { SocketProvider } from "../context/SocketContext";


const Providers = ({ children }) => {
  return (
    <Provider store={store}>
      <SocketProvider>
        {children}
        <ToastContainer />
      </SocketProvider>
    </Provider>
  );
};

export default Providers;
