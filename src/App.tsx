import React, { useEffect, useState } from "react";
import softwares from "./softwares.json";
import {
  Checkbox,
  Divider,
  FormControlLabel,
  Popover,
  TextField,
} from "@mui/material";
import "./App.css";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
// const { ipcRenderer } = window.require("electron");

interface Input {
  id: string;
  label: string;
  required?: boolean;
}

interface SoftwareProp {
  id: string;
  name: string;
  description: string;
  script?: string[];
  softwares?: SoftwareProp[];
  type?: string;
  inputs?: Input[];
}

interface SoftwareProps {
  software: SoftwareProp;
  onChange: (
    action: "ADD" | "REMOVE",
    id: string,
    inputs?: Record<string, string>,
    metadata?: any
  ) => void;
}

export const Software = (props: SoftwareProps) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [checked, setChecked] = useState(false);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  useEffect(() => {
    props?.onChange(
      checked ? "ADD" : "REMOVE",
      props?.software?.id,
      inputValues,
      null
    );
  }, [checked, inputValues]);

  return (
    <>
      <FormControlLabel
        control={<Checkbox />}
        label={props?.software?.name}
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
        checked={checked}
        onChange={() => setChecked(!checked)}
      />
      {checked && props?.software?.inputs && (
        <>
          {props?.software?.inputs?.map((input) => (
            <TextField
              id={input?.id}
              label={input?.label}
              variant="outlined"
              value={inputValues[input?.id]}
              required={input?.required || false}
              style={{ margin: 5 }}
              onChange={(event) => {
                setInputValues({
                  ...inputValues,
                  [input?.id]: event.target.value,
                });
              }}
            />
          ))}
        </>
      )}
      <Popover
        id="software-description"
        sx={{
          pointerEvents: "none",
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <Typography sx={{ p: 1 }}>{props?.software?.description}</Typography>
      </Popover>
    </>
  );
};

interface RenderSoftwareProps {
  software: SoftwareProp;
  onChange: (
    action: "ADD" | "REMOVE",
    id: string,
    inputs?: Record<string, string>,
    metadata?: any
  ) => void;
}

function RenderSoftware(props: RenderSoftwareProps) {
  const { software } = props;
  return (
    <>
      {!software?.softwares && (
        <>
          <Software software={software} onChange={props?.onChange} />
        </>
      )}
      {software?.softwares && (
        <>
          <Typography variant="h6">{software?.name}</Typography>
          {software?.softwares?.map((sub_software) => (
            <>
              <RenderSoftware
                software={sub_software}
                onChange={props?.onChange}
              />
            </>
          ))}
        </>
      )}
      <br />
    </>
  );
}

interface SoftwareGroupProps {
  software_group: SoftwareProp;
  onChange: (
    action: "ADD" | "REMOVE",
    id: string,
    inputs?: Record<string, string>,
    metadata?: any
  ) => void;
}

function SoftwareGroup(props: SoftwareGroupProps) {
  const { software_group } = props;
  return (
    <div style={{ padding: 10 }}>
      <Typography variant="h4">{software_group?.name}</Typography>
      <Divider style={{ padding: 5 }} />
      {software_group?.softwares?.map((software) => (
        <RenderSoftware software={software} onChange={props?.onChange} />
      ))}
    </div>
  );
}

function App() {
  // function installGit() {
  //   console.log("Install Git Here");
  //   // cmd.runSync("sudo apt-get install git");
  //   ipcRenderer.send("install", { install: ["git"] });
  // }
  const [softwaresToInstall, setSoftwaresToInstall] = useState<
    Record<string, any>
  >({});

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
          >
            GoGoSoon Laptop Setup
          </Typography>
        </Toolbar>
      </AppBar>
      {softwares?.software_groups?.map((software_group) => (
        <SoftwareGroup
          software_group={software_group}
          onChange={(
            action: "ADD" | "REMOVE",
            id: string,
            inputs?: Record<string, string>,
            metadata?: any
          ) => {
            switch (action) {
              case "ADD": {
                let newSoftware = {
                  inputs,
                  metadata,
                };
                setSoftwaresToInstall({
                  ...softwaresToInstall,
                  [id]: newSoftware,
                });
                break;
              }
              case "REMOVE": {
                let allSoftwares = softwaresToInstall;

                if (allSoftwares[id]) {
                  delete allSoftwares[id];
                }

                setSoftwaresToInstall(allSoftwares);
                break;
              }
            }
          }}
        />
      ))}
    </Box>
  );
}

export default App;
