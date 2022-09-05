const path = require("path");
const cmd = require("node-cmd");
const util = require("util");
const { spawn, execSync, exec } = require("child_process");
const { app, BrowserWindow } = require("electron");
const isDev = require("electron-is-dev");
const { ipcMain } = require("electron");
const softwares = require("../src/softwares.json");

const execPromisify = util.promisify(exec);
// Conditionally include the dev tools installer to load React Dev Tools
let installExtension, REACT_DEVELOPER_TOOLS;

function getRequiredSoftwaresInfo(
  idsOfSoftwaresToInstall,
  softwares,
  softwaresInfo
) {
  softwares?.map((software) => {
    if (software?.softwares) {
      getRequiredSoftwaresInfo(
        idsOfSoftwaresToInstall,
        software?.softwares,
        softwaresInfo
      );
    } else {
      if (idsOfSoftwaresToInstall?.includes(software?.id)) {
        softwaresInfo[software?.id] = software;
      }
    }
  });
  return softwaresInfo;
}

function installSoftwaresUsingSpawn(software, event, resolve) {
  console.log("Installing software using spawn", software);
  for (let i = 0; i < software?.script?.length; i++) {
    console.log(`Running ${i} in ${software?.name}`);
    let script = software?.script[i];
    let splitCommands = script?.split(" ");
    const command = spawn(splitCommands[0], splitCommands?.slice(1));

    command.stdout.on("data", (output) => {
      // the output data is captured and printed in the callback
      // console.log("Output: ", output.toString());
      event.reply("output", output.toString());
    });
    command.on("close", (code) => {
      resolve(code);
    });
    if (i == software?.script?.length - 1) {
      console.log(`${software?.name} installation complete`);
      resolve("Done");
    }
  }

  // await resolve("Done");
}

async function installSoftwaresUsingExecSync(software, event, resolve1) {
  for (let i = 0; i < software?.script?.length; i++) {
    console.log(`Running ${i}. ${software?.script[i]} in ${software?.name}`);
    await new Promise((resolve, reject) => {
      let script = software?.script[i];
      try {
        event.reply(
          `output`,
          `Running ${i}. ${software?.script[i]} in ${software?.name}`,
          {
            type: "loading",
            status: true,
          }
        );
        exec(script, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            event.reply(
              `output`,
              `${software?.name} installation failed: ${error}`,
              {
                type: "loading",
                status: true,
              }
            );
            resolve("Done");
          }

          console.log(`stdout of ${i}: ${stdout}`);
          event.reply("output", stdout.toString());
          console.error(`stderr  of ${i}: ${stderr}`);

          if (i == software?.script?.length - 1) {
            console.log(`${software?.name} installation complete`);
            event.reply(`output`, `${software?.name} installation complete`, {
              type: "loading",
              status: true,
            });
            resolve("Done");
          }
          resolve("Done");
        });

        // event.reply("output", command.toString());
      } catch (error) {
        event.reply(
          `output`,
          `${software?.name} installation failed: ${error.message}`,
          {
            type: "loading",
            status: true,
          }
        );
        console.error("execSync error: ".error);
        resolve("Done");
      }
    });
  }
  resolve1("Done");

  // await resolve("Done");
}

async function installSoftware(software, event) {
  await new Promise(async (resolve, reject) => {
    event.reply("output", `Installing ${software?.name}... `);

    if (software?.type == "spawn") {
      installSoftwaresUsingSpawn(software, event, resolve);
    } else if (software?.type == "execSync") {
      await installSoftwaresUsingExecSync(software, event, resolve);
    }
  });
}

ipcMain.on("installRequiredSoftwares", async (event, data) => {
  const requiredSoftwares = [
    {
      id: "11-snapd",
      name: "Snap",
      description: "Snap Package Manager",
      script: ["sudo apt install -y snapd"],
      type: "execSync",
    },
  ];

  for (let i = 0; i < requiredSoftwares?.length; i++) {
    await installSoftware(requiredSoftwares[i], event);
  }

  event.reply(`output`, `required softwares are installed`, {
    type: "requiredSoftwaresInstalled",
    status: true,
  });
});

ipcMain.on("install", async (event, data) => {

  // Root user check
  await checkPasswordRemovedForSudo(event);

  // Install required softwares

  // Install selected softwares

  const idsOfSoftwaresToInstall = Object.keys(data?.install);

  const installSoftwaresInfo = getRequiredSoftwaresInfo(
    idsOfSoftwaresToInstall,
    softwares?.software_groups,
    {}
  );

  try {
    for (let i = 0; i < idsOfSoftwaresToInstall?.length; i++) {
      await new Promise(async (resolve, reject) => {
        await installSoftware(
          installSoftwaresInfo[idsOfSoftwaresToInstall[i]],
          event
        );
        resolve("Done");
      });
    }

    event.reply(`output`, `All software installation completed`, {
      type: "loading",
      status: false,
    });
  } catch (error) {
    event.reply(`output`, `Software installation failed`, {
      type: "loading",
      status: false,
    });
  }
});

if (isDev) {
  const devTools = require("electron-devtools-installer");
  installExtension = devTools.default;
  REACT_DEVELOPER_TOOLS = devTools.REACT_DEVELOPER_TOOLS;
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require("electron-squirrel-startup")) {
  app.quit();
}

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // and load the index.html of the app.
  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  if (isDev) {
    installExtension(REACT_DEVELOPER_TOOLS)
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((error) => console.log(`An error occurred: , ${error}`));
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

async function checkPasswordRemovedForSudo(event, data) {
  const command = await executeAsyncCommand(`sudo -n true`);

  if (command) {
    console.log("Root User ======================== ");
  } else {
    event.reply(`output`, `To continue, you should have root access...`, {
      type: "rootUserCheck",
    });
  }
}

async function executeAsyncCommand(command) {
  try {
    const { stdout, stderr } = await execPromisify(`${command}`);

    if (stdout) {
      return true;
    }

    if (stderr) {
      return false;
    }

    return true;
  } catch (e) {
    console.error("executeAsyncCommand catch: ", e);
    return false;
  }
}

ipcMain.on("checkRootUser", async (event, data) => {
  await checkPasswordRemovedForSudo(event, data);
});

ipcMain.on(`closeApp`, async (event, data) => {
  app.quit();
});
