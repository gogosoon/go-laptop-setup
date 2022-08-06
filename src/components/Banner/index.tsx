import React, { ReactNode } from "react";
import { Info } from "@mui/icons-material";
import "./index.css";

interface Props {
  title: string | ReactNode;
  containerStyle?: React.CSSProperties;
  titleContainerStyle?: React.CSSProperties;
  iconStyle?: React.CSSProperties;
  icon?: ReactNode;
}

export const Banner = (props: Props) => {
  return (
    <div className={`bannerContainer`} style={{ ...props?.containerStyle }}>
      <div
        className={`bannerTitleContainer`}
        style={{ ...props?.titleContainerStyle }}
      >
        {!props?.icon && (
          <Info className={`bannerIcon`} style={{ ...props?.iconStyle }} />
        )}
        {props?.icon}
        {props.title}
      </div>
    </div>
  );
};
