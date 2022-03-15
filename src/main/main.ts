/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import AdmZip from 'adm-zip';
import axios from 'axios';
import Database from 'better-sqlite3';
import 'core-js/stable';
import { app, BrowserWindow, globalShortcut, ipcMain, shell } from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import { DataSource, Kymano, QemuCommands } from 'kymano';
import path from 'path';
import 'regenerator-runtime/runtime';
import { read } from 'simple-yaml-import';
import si from 'systeminformation';
import { build, version } from '../../package.json';
import MenuBuilder from './menu';
import getRepoListDir from './service/getRepoListDir';
import { resolveHtmlPath } from './util';
import processConfig from './v1/processConfig';

const fs = require('fs').promises;
const fsNormal = require('fs');
const { spawn } = require('child_process');

const appData = app.getPath('appData');
app.setPath('userData', path.join(appData, build.productName));

function checkIfCalledViaCLI(args: any[]) {
  if (args && args.length > 1) {
    if (args.length === 4 && args[3] === './src/main/main.ts') {
      return false;
    }
    return true;
  }
  return false;
}

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

console.log(`${app.getPath('userData')}/sqlite3.db`);
log.debug(`${app.getPath('userData')}/sqlite3.db`);

const db = new Database(`${app.getPath('userData')}/sqlite3.db`, {
  verbose: console.log,
});

const dataSource = new DataSource(db);
const kymano = new Kymano(dataSource, new QemuCommands());

let mainWindow: BrowserWindow | null = null;
function listDirectories(dirs: any[]) {
  return Promise.all(dirs.map((dir) => fs.readdir(dir))).then((files) =>
    files.flat()
  );
}

ipcMain.handle('save-file', async (event, bytes, path) => {
  console.log('save-file::::', path);
  fsNormal.appendFileSync(path, Buffer.from(bytes));
});

ipcMain.handle('import-layer', async (event, path) => {
  const rows = await dataSource.getTables();
  console.log('rows::::::::', rows);
  if (rows === 0) {
    await dataSource.createTables();
  }

  console.log('import-layer::::', path);
  await kymano.importLayer(path);
  console.log('import-layer:::: ok!!');
});

ipcMain.handle('run-guestfs', async (event) => {
  await kymano.run('guestfs', []);
  console.log('un-guest ok !!!');
});

ipcMain.handle('electron-store-set', async (event, someArgument) => {
  const valueObject = {
    cpu: 'manufacturer, brand, cores',
    mem: 'total',
    osInfo: 'platform, release, arch',
    baseboard: 'model, manufacturer',
    graphics: 'displays',
  };

  const sysInfo = await si.get(valueObject);
  const mainDisplay = sysInfo.graphics.displays.filter(
    (display: { main: boolean }) => display.main === true
  )[0];

  // const data = await fs.readFile(`${dirPath}repoList.yml`, 'utf8');
  const data = read(`${getRepoListDir()}/repoList`, {
    path: getRepoListDir(),
  });

  console.log('checkAndOpenXquartzPkg');
  // checkAndOpenXquartzPkg();

  const body = await axios.get(
    `https://codeload.${data.repos[0]}/zip/refs/heads/master`,
    {
      responseType: 'arraybuffer',
    }
  );

  const zip = new AdmZip(body.data);

  try {
    await fs.access(`${app.getPath('userData')}/${data.repos[0]}`);
  } catch (error) {
    fs.mkdir(`${app.getPath('userData')}/${data.repos[0]}`, {
      recursive: true,
    });
  }
  zip.extractAllTo(`${app.getPath('userData')}/${data.repos[0]}`, true);
  const latestRepo = read(
    `${app.getPath('userData')}/${data.repos[0]}/repo-master/latest`,
    {
      path: `${app.getPath('userData')}/${data.repos[0]}/repo-master`,
    }
  );

  const repoVersion = db
    .prepare(`SELECT version FROM repo_v1 WHERE url = ?`)
    .get(data.repos[0]);
  console.log(`repoVersion:${repoVersion}`);
  if (!repoVersion || Object.keys(repoVersion).length === 0) {
    const repoId = db
      .prepare(
        'INSERT INTO repo_v1 (version, url, repoSystemVersion) VALUES (?, ?, ?)'
      )
      .run(
        latestRepo.version,
        data.repos[0],
        latestRepo.systemVersion
      ).lastInsertRowid;

    await Promise.all(
      Object.entries(latestRepo.configs).map(async ([index, _]) => {
        console.log(`type: ${latestRepo.configs[index].type}`);
        console.log(latestRepo.configs[index]);

        if (latestRepo.configs[index].type === 'searchable') {
          console.log(`config parsing start`);

          const config = await (async () => {
            try {
              console.log(`config parsing try`);
              return await processConfig(
                latestRepo.configs[index].from,
                `${app.getPath('userData')}/${data.repos[0]}/repo-master`
              );
            } catch (error) {
              return undefined;
            }
          })();
          console.log(config);
          if (!config) {
            return;
          }

          await addConfig(config, db, repoId, index);
        }
      })
    );

    console.log('searchResults');

    const result = await getVmsFromConfig(db, version, sysInfo, mainDisplay);
    return result;
  }
  if (repoVersion > latestRepo.systemVersion) {
    db.prepare('UPDATE repo SET version = ? WHERE url = ?').run(
      latestRepo.version,
      data.repos[0]
    );
  }

  const result = await getVmsFromConfig(db, version, sysInfo, mainDisplay);
  return result;
});

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.on('asynchronous-message', (event, arg) => {
  event.reply('asynchronous-reply', app.getPath('userData'));
});

ipcMain.on('electron-store-get', async (event, val) => {
  event.returnValue = '123123';
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const ret = globalShortcut.register('CommandOrControl+Shift+I', () => {
    mainWindow!.webContents.toggleDevTools();
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    const isCalledViaCLI = checkIfCalledViaCLI(process.argv);

    if (!isCalledViaCLI) {
      createWindow();
    } else {
      app.dock.hide();
      processCLI(process.argv, db);
      // spawn('ssh', ['root@192.168.178.42'], { stdio: 'inherit' });
    }
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null && !isCalledViaCLI) createWindow();
    });
  })
  .catch(console.log);
