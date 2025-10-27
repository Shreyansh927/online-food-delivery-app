import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ContextProvider } from "../context/context.jsx";

createRoot(document.getElementById("root")).render(
  <ContextProvider>
    <ToastContainer position="top-right" />
    <App />
  </ContextProvider>
);
