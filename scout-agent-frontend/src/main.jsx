import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Toaster 
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '0.9375rem',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        },
        success: {
          iconTheme: {
            primary: '#2e7d32',
            secondary: '#ffffff',
          },
          style: {
            background: '#e8f5e9',
            color: '#1b5e20',
            border: '1px solid #2e7d32',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef5350',
            secondary: '#ffffff',
          },
          style: {
            background: '#ffebee',
            color: '#c62828',
            border: '1px solid #ef5350',
          },
        },
      }}
    />
  </React.StrictMode>
);