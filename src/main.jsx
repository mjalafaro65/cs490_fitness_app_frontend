import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./AuthContext";
import { MessagingProvider } from "./MessagingContext";


ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
  <MessagingProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </MessagingProvider>
</AuthProvider>
);
