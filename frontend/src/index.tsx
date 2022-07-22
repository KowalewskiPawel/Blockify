import React from 'react';
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from './App';
import { BlockifyProvider } from "./context";
import "./index.css";

ReactDOM.render(
  <React.StrictMode>
    <BlockifyProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </BlockifyProvider>
  </React.StrictMode>,
  document.getElementById("root")
);