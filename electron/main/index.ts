import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { release } from 'os';
import { join } from 'path';
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer';

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

export const ROOT_PATH = {
  // /dist
  dist: join(__dirname, '../..'),
  // /dist or /public
  public: join(__dirname, app.isPackaged ? '../..' : '../../../public'),
};

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js');
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin
const url = `http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}`;
const indexHtml = join(ROOT_PATH.dist, 'index.html');

async function createWindow() {
  win = new BrowserWindow({
    title: 'CXO Relay',
    width: 1200,
    height: 960,
    icon: join(ROOT_PATH.public, 'favicon.svg'),
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (app.isPackaged) {
    win.loadFile(indexHtml);
  } else {
    win.loadURL(url);
    // win.webContents.openDevTools()
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });

  // The following two handlers override the browser's CORS behavior
  // https://pratikpc.medium.com/bypassing-cors-with-electron-ab7eaf331605
  win.webContents.session.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      callback({ requestHeaders: { Origin: '*', ...details.requestHeaders } });
    }
  );

  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const { responseHeaders } = details;
    upsertKeyValue(responseHeaders, 'Access-Control-Allow-Origin', ['*']);
    callback({
      responseHeaders,
    });
  });
}

app.whenReady().then(() => {
  createWindow();
  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));
});

app.on('window-all-closed', () => {
  win = null;
  if (process.platform !== 'darwin') app.quit();
});

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// new window example arg: new windows url
ipcMain.handle('open-win', (event, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
    },
  });

  if (app.isPackaged) {
    childWindow.loadFile(indexHtml, { hash: arg });
  } else {
    childWindow.loadURL(`${url}/#${arg}`);
  }
});

function upsertKeyValue(obj, keyToChange, value) {
  const keyToChangeLower = keyToChange.toLowerCase();
  for (const key of Object.keys(obj)) {
    if (key.toLowerCase() === keyToChangeLower) {
      // Reassign old key
      obj[key] = value;
      return;
    }
  }
  // Insert at end if not among values
  obj[keyToChange] = value;
}
