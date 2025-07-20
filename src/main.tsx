// src/main.tsx
////271057976630-gbmu333gl79c8jdm4mrdta9gt3qm8s6t.apps.googleusercontent.com
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css"; // Thêm import index.css tại đây

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="271057976630-gbmu333gl79c8jdm4mrdta9gt3qm8s6t.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
