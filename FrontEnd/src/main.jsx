import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import './index.css'
import '@ant-design/v5-patch-for-react-19';
import { BreadcrumbProvider } from "./context/breadcrumb_context.jsx"; // ✅ importar
import { BrowserRouter } from "react-router-dom"; 

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <BreadcrumbProvider> {/* ✅ envolver la app */}
        <App />
      </BreadcrumbProvider>
    </BrowserRouter>
  </React.StrictMode>
);
