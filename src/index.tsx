import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { createInstance, MatomoProvider } from "@jonkoops/matomo-tracker-react";
import { Constants } from "./Constants/Constants";

const instance = createInstance({
  urlBase: Constants.MATOMO_URL,
  siteId: Constants.MATOMO_ZEN_SITE_ID
});

ReactDOM.render(
  <React.StrictMode>
    <MatomoProvider  value={instance} >
    <App />
    </MatomoProvider>,
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
