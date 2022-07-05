import React from "react";
import softwares from "./softwares.json";
import { Checkbox, Divider, FormControlLabel } from "@mui/material";
import "./App.css";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
const { ipcRenderer } = window.require("electron");

interface SoftwareProp {
  name: string;
  description: string;
  script?: string[];
  softwares?: SoftwareProp[];
  type?: string;
}

interface SoftwareProps {
  software: SoftwareProp;
}

export const Software = (props: SoftwareProps) => {
  return (
    <FormControlLabel control={<Checkbox />} label={props?.software?.name} />
  );
};

interface RenderSoftwareProps {
  software: SoftwareProp;
}

function RenderSoftware(props: RenderSoftwareProps) {
  const { software } = props;
  return (
    <>
      {!software?.softwares && (
        <>
          <Software software={software} />
        </>
      )}
      {software?.softwares && (
        <>
          <Typography variant="h6">{software?.name}</Typography>
          {software?.softwares?.map((sub_software) => (
            <>
              <RenderSoftware software={sub_software} />
            </>
          ))}
        </>
      )}
      <br />
    </>
  );
}

function App() {
  // function installGit() {
  //   console.log("Install Git Here");
  //   // cmd.runSync("sudo apt-get install git");
  //   ipcRenderer.send("install", { install: ["git"] });
  // }

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
        <div style={{ padding: 10 }}>
          <Typography variant="h4">{software_group?.name}</Typography>
          <Divider style={{ padding: 5 }} />
          {software_group?.softwares?.map((software) => (
            <RenderSoftware software={software} />
          ))}
        </div>
      ))}
    </Box>
  );
}

export default App;
