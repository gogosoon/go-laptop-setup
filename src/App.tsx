import React, { useEffect, useRef, useState } from "react";
import softwares from "./softwares.json";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Popover,
  TextField,
} from "@mui/material";
import "./App.css";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { KeyboardArrowDown, ExpandLess } from "@mui/icons-material";
import { Banner } from "./components/Banner";
const { ipcRenderer } = window.require("electron");

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
  required?: boolean;
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
  const { onChange, software } = props;
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
    onChange(checked ? "ADD" : "REMOVE", software?.id, inputValues, null);
  }, [checked, inputValues, onChange, software]);

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
              key={input?.id}
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
            <div key={sub_software?.id}>
              <RenderSoftware
                software={sub_software}
                onChange={props?.onChange}
              />
            </div>
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
  const { software_group, onChange } = props;
  return (
    <div style={{ padding: 10 }}>
      <Typography variant="h4">{software_group?.name}</Typography>
      <Divider style={{ padding: 5 }} />
      {software_group?.softwares?.map((software) => (
        <RenderSoftware
          key={software?.id}
          software={software}
          onChange={onChange}
        />
      ))}
    </div>
  );
}

function App() {
  const [consoleOutput, setConsoleOutput] = useState("");
  const [showConsoleOutput, setShowConsoleOutput] = useState(false);
  let output = "";
  const [softwaresToInstall, setSoftwaresToInstall] = useState<
    Record<string, any>
  >({});
  const bottomRef = useRef<null | HTMLDivElement>(null);
  const [isRootUser, setIsRootUser] = useState<boolean>(true);

  function handleClose() {
    // ipcRenderer.send(`closeApp`);
    setIsRootUser(true);
  }

  function installSoftwares() {
    checkRootUser();
  }

  // function softwaresInstallation() {
  //   if (isRootUser) {
  //     console.log("all remaing softwares: ", softwaresToInstall);
  //     ipcRenderer.send("install", {
  //       install: {
  //         "11-snapd": {
  //           inputs: {
  //             id: "11-snapd",
  //             name: "Snap",
  //             description: "Snap Package Manager",
  //             script: ["sudo apt install -y snapd"],
  //             type: "execSync",
  //             required: true,
  //           },
  //         },
  //         ...softwaresToInstall,
  //       },
  //     });
  //   }
  // }

  function startListeners() {
    ipcRenderer.on("output", (event: any, message: any, arg: any) => {
      output += `${message}`;
      setConsoleOutput(output);

      if (arg) {
        switch (arg?.type) {
          case `rootUserCheck`:
            console.log("root user check switch case");
            if (!arg?.status) {
              setIsRootUser(false);
            } else {
              setIsRootUser(true);
              // softwaresInstallation();
            }
            break;

          default:
            break;
        }
      }
    });
  }

  function checkRootUser() {
    ipcRenderer.send("checkRootUser");
  }

  useEffect(() => {
    startListeners();
  }, []);

  useEffect(() => {
    if (showConsoleOutput) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [consoleOutput, showConsoleOutput]);

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
      <Banner
        title={
          <span>
            Please remove password prompt for sudo commands. Follow the steps in{" "}
            <a href="https://google.com" target={`_blank`}>
              this tutorial
            </a>{" "}
            to remove password for sudo commands.
          </span>
        }
      />
      <Banner
        title={
          <span>
            Snapd will be installed by default as part of this software
            installation. Snap is a software packaging and deployment system
            developed by Canonical for operating systems that use the Linux
            kernel. To learn more about snapd, visit{" "}
            <a
              href="https://snapcraft.io/docs/installing-snap-on-ubuntu"
              target={`_blank`}
            >
              Snap (Software)
            </a>{" "}
          </span>
        }
      />
      {softwares?.software_groups?.map((software_group) => (
        <SoftwareGroup
          key={software_group?.id}
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
      <Button variant="contained" size="large" onClick={installSoftwares}>
        Install
      </Button>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 20,
        }}
      >
        <Typography variant="h6">Console Output</Typography>
        <IconButton onClick={() => setShowConsoleOutput(!showConsoleOutput)}>
          {!showConsoleOutput && <KeyboardArrowDown />}
          {showConsoleOutput && <ExpandLess />}
        </IconButton>
      </div>
      {showConsoleOutput && (
        <Typography
          style={{
            whiteSpace: "pre-line",
            fontSize: 10,
            backgroundColor: "black",
            color: "white",
          }}
        >
          {consoleOutput}
          {"\n\n"}
          Listening for events...
        </Typography>
      )}
      <div ref={bottomRef} />
      <Dialog
        open={!isRootUser}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Not a root user?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Please, remove password for sudo command and then continue
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;
