import React from "react";
import { CircularProgress } from "@mui/material";

import "./index.css";

interface Props {
  loading: boolean;
  boxLoaderContainerStyle?: React.CSSProperties;
  boxLoaderContentStyle?: React.CSSProperties;
  boxLoaderColor?:
    | "inherit"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning";
  message?: string;
}

const BoxLoader = (props: Props) => {
  return props.loading ? (
    <div
      className={`boxLoaderContainer`}
      style={{ ...props?.boxLoaderContainerStyle }}
    >
      <div
        className={`boxLoaderContent`}
        style={{ ...props?.boxLoaderContentStyle }}
      >
        <CircularProgress
          disableShrink={false}
          thickness={4}
          color={props?.boxLoaderColor}
        />
        {props?.message && (
          <span className={`boxLoaderMessage`}>{props?.message}</span>
        )}
      </div>
    </div>
  ) : null;
};

export default BoxLoader;

BoxLoader.defaultProps = {
  boxLoaderColor: "primary",
};
