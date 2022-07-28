import React, { ReactNode } from "react";
import { Info } from "@mui/icons-material";
import "./index.css";

interface Props {
  title: string | ReactNode;
  containerStyle?: React.CSSProperties;
  titleStyle?: React.CSSProperties;
  iconStyle?: React.CSSProperties;
  icon?: ReactNode;
}

export const Banner = (props: Props) => {
  return (
    <div className={`container`} style={{ ...props?.containerStyle }}>
      <span className={`title`} style={{ ...props?.titleStyle }}>
        {!props?.icon && (
          <Info className={`icon`} style={{ ...props?.iconStyle }} />
        )}
        {props?.icon}
        {props.title}
      </span>
    </div>
  );
};
