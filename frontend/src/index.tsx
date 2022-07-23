import React from 'react';
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "@self.id/framework";
import App from './App';
import { BlockifyProvider } from "./context";
import "./index.css";

ReactDOM.render(
  <React.StrictMode>
    <Provider client={{ ceramic: "testnet-clay" }}>
      <BlockifyProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </BlockifyProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);