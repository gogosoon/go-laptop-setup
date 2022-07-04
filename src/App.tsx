import React from "react";
import "./App.css";
// var cmd = require("node-cmd");
// import cmd from "node-cmd";
// import { ipcRenderer } from "electron";
const { ipcRenderer } = window.require("electron");

function App() {
  function installGit() {
    console.log("Install Git Here");
    // cmd.runSync("sudo apt-get install git");
    ipcRenderer.send("install", { install: ["git"] });
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.js</code> and save to reload. Hello
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <button onClick={installGit}>Install Git</button>
      </header>
    </div>
  );
}

export default App;
