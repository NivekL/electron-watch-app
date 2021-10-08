// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu } = require('electron');

// Import and start to use the @electron/remote module
// read more here: https://www.npmjs.com/package/@electron/remote
const remoteMain = require('@electron/remote/main');
remoteMain.initialize();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // These are needed in order to be able to
      // use node features like "require" in the renderer code
      // for the  window
      nativeWindowOpen: true,
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // allow the remote module to be used in the window/renderer
  remoteMain.enable(mainWindow.webContents);

  // and load an URL
  // (switch to real web server when you go live with the project)
  mainWindow.loadURL('http://localhost:3000/');

  // On some Windows machines explicitely asking the mainWindow
  // to show seems to be necessary to show the appliction
  mainWindow.show();

  // Open the DevTools (commented out)
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

}

// Create the menu by reading the from JSON etc
function createMenu() {
  let template = require('./menu-choices/menu.json');
  let mac = require('./menu-choices/mac-specific.json');
  // Fix all things Mac specific
  if (process.platform === 'darwin') {
    template.unshift(mac.appMenu);
    let editMenu = template.find(x => x.label === 'Edit');
    editMenu.submenu = [...editMenu.submenu, ...mac.speechChoices];
    let windowMenu = template.find(x => x.role === 'window');
    windowMenu.submenu = mac.windowChoices;
  }
  // Recurse through the template finding all menus choices
  // with label and no submenu and add click handling
  // and resolve platform specific keyboard short cuts
  // (using JSON stringify for recursion)
  JSON.stringify(template, function (key, val) {
    if (key === 'label' && !this.submenu && !this.role) {
      this.click = (...args) => menuClickHandler(...args);
    }
    if (key === 'accelerator' && val instanceof Array) {
      // if an accelerator/key short cut is coded as an array
      // we change it to a string, according to the rule
      // the first array item => mac specific, second => everywhere else
      this.accelerator = process.platform === 'darwin' ? val[0] : val[1];
    }
    return val;
  });

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}


// Handle clicks in the menu
function menuClickHandler(menuItem) {
  // Send the menu choice to the mainWindow renderer process
  mainWindow.webContents.send('menuChoice', menuItem.label);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);
app.on('ready', createMenu);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
});

// Disable unnecessary security warnings
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';