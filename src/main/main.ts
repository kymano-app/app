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
import { app, BrowserWindow, ipcMain, shell, globalShortcut } from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import 'regenerator-runtime/runtime';
import { read } from 'simple-yaml-import';
import si from 'systeminformation';
import { build, version } from '../../package.json';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import processConfig from './v1/processConfig';

const fs = require('fs').promises;
const { spawn } = require('child_process');

const appData = app.getPath('appData');
app.setPath('userData', path.join(appData, build.productName));

const splitForQuery = (line: string): string[] => {
  const arr = line
    .toLowerCase()
    .split(/\W/)
    .filter((word: string | any[]) => word.length > 0);
  const a1: string[] = [];
  const result = arr.map((elem) => {
    a1.push(elem);
    return `'${a1.join(' ')}*'`;
  });
  if (result.length > 0) {
    result.push(`${result[result.length - 1].slice(0, -2)}'`);
  }
  return result;
};

const splitForIncludeQuery = (line: string) => {
  return [...[`'*'`], ...splitForQuery(line)].join(',');
};
const splitForExcludeQuery = (line: string) => {
  return splitForQuery(line).join(',');
};

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

const getVmsFromConfig = async (sysInfo, mainDisplay) => {
  const result = await db
    .prepare(
      `SELECT * FROM
      config_v1
      JOIN json_each(config_v1.arch) as arch
      JOIN json_each(config_v1.cpu_manufacturer_include) as cpu_manufacturer_include
      JOIN json_each(config_v1.cpu_manufacturer_exclude) as cpu_manufacturer_exclude
      JOIN json_each(config_v1.cpu_brand_include) as cpu_brand_include
      JOIN json_each(config_v1.cpu_brand_exclude) as cpu_brand_exclude
      JOIN json_each(config_v1.baseboard_manufacturer_include) as baseboard_manufacturer_include
      JOIN json_each(config_v1.baseboard_manufacturer_exclude) as baseboard_manufacturer_exclude
      JOIN json_each(config_v1.baseboard_model_include) as baseboard_model_include
      JOIN json_each(config_v1.baseboard_model_exclude) as baseboard_model_exclude
      JOIN json_each(config_v1.resolutionX) as resolutionX
      JOIN json_each(config_v1.resolutionY) as resolutionY
      WHERE
      minimum_version <= ? AND
      memory <= ? AND
      cores <= ? AND
      cpu_manufacturer_include.value IN (${splitForIncludeQuery(
        sysInfo.cpu.manufacturer
      )}) AND
      arch.value IN (${splitForIncludeQuery(sysInfo.osInfo.arch)}) AND
      cpu_manufacturer_exclude.value NOT IN (${splitForExcludeQuery(
        sysInfo.cpu.manufacturer
      )}) AND
      cpu_brand_include.value IN (${splitForIncludeQuery(
        sysInfo.cpu.brand
      )}) AND
      cpu_brand_exclude.value NOT IN (${splitForExcludeQuery(
        sysInfo.cpu.brand
      )}) AND
      baseboard_manufacturer_include.value IN (${splitForIncludeQuery(
        sysInfo.baseboard.manufacturer
      )}) AND
      baseboard_manufacturer_exclude.value NOT IN (${splitForExcludeQuery(
        sysInfo.baseboard.manufacturer
      )}) AND
      baseboard_model_include.value IN (${splitForIncludeQuery(
        sysInfo.baseboard.model
      )}) AND
      baseboard_model_exclude.value NOT IN (${splitForExcludeQuery(
        sysInfo.baseboard.model
      )}) AND
      resolutionX.value IN (${mainDisplay.currentResX}, '*') AND
      resolutionY.value IN (${mainDisplay.currentResY}, '*')
      GROUP BY config_v1.id
      `
    )
    .all(version, sysInfo.mem.total / 1024 / 1024, sysInfo.cpu.cores);

  return result;
};

const row = db
  .prepare(
    `SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='repo_v1'`
  )
  .get();
log.debug(row);

if (row.count === 0) {
  db.exec(`CREATE TABLE repo_v1 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version TEXT NOT NULL,
  url TEXT NOT NULL,
  repoSystemVersion TEXT NOT NULL
)`);

  db.exec(`CREATE TABLE config_v1 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  repo_id INT NOT NULL,
  'index' INT NOT NULL,
  version NUMERIC NOT NULL,
  cpu_manufacturer_include JSON HIDDEN,
  cpu_manufacturer_exclude JSON HIDDEN,
  cpu_brand_include JSON HIDDEN,
  cpu_brand_exclude JSON HIDDEN,
  baseboard_manufacturer_include JSON HIDDEN,
  baseboard_manufacturer_exclude JSON HIDDEN,
  baseboard_model_include JSON HIDDEN,
  baseboard_model_exclude JSON HIDDEN,
  arch JSON HIDDEN,
  resolutionX JSON HIDDEN,
  resolutionY JSON HIDDEN,
  memory INT NOT NULL,
  cores INT NOT NULL,
  disk INT NOT NULL,
  minimum_version NUMERIC NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  picture TEXT,
  releaseDescription TEXT,
  config JSON HIDDEN,
  previous_id INT default '0'
)`);

  db.exec(`CREATE TABLE config_v1_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version TEXT NOT NULL,
  releaseDescription TEXT NOT NULL,
  config TEXT NOT NULL,
  configSystemVersion TEXT NOT NULL,
  previous_id INT default '0'
)`);

  db.exec(`CREATE TABLE layer_v1 (
  hash TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  path TEXT NOT NULL
)`);

  db.exec(`CREATE TABLE disk_v1 (
  hash TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  config_v1_id INT NOT NULL,
  path TEXT NOT NULL
)`);

  db.exec(`CREATE TABLE my_layer (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  disk_version TEXT NOT NULL,
  disk_hash TEXT NOT NULL,
  my_config_id INT NOT NULL,
  path TEXT NOT NULL
)`);

  db.exec(`CREATE TABLE my_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  config_version INT NOT NULL,
  config_id INT NOT NULL,
  config_history_version INT NOT NULL,
  config_history_id INT NOT NULL
)`);
}

let mainWindow: BrowserWindow | null = null;
function listDirectories(dirs: any[]) {
  return Promise.all(dirs.map((dir) => fs.readdir(dir))).then((files) =>
    files.flat()
  );
}

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

  let dirPath;
  if (process.env.NODE_ENV === 'production') {
    dirPath = path.join(__dirname.split('/').slice(0, -2).join('/'), 'base/');
  } else {
    dirPath = path.join(
      __dirname.split('/').slice(0, -2).join('/'),
      'release/app/base/'
    );
  }
  // const data = await fs.readFile(`${dirPath}repoList.yml`, 'utf8');
  const data = read(`${dirPath}/repoList`, { path: dirPath });
  spawn('open', [`${dirPath}/XQuartz.pkg`]);
  // const data = await listDirectories([path.join(__dirname, 'base')]);
  console.log('data:::::::', `${dirPath}/XQuartz.pkg`);

  const body = await axios.get(
    `https://codeload.${data.repos[0]}/zip/refs/heads/master`,
    {
      responseType: 'arraybuffer',
    }
  );

  const zip = new AdmZip(body.data);
  // const zipEntries = zip.getEntries();

  // // search for "index.html" which should be there
  // for (var i = 0; i < zipEntries.length; i++) {
  //     console.log(zip.readAsText(zipEntries[i]));
  // }

  // and to extract it into current working directory

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

          // console.log(JSON.stringify(config, null, 4));
          // const from = ((repo, latest) => {
          //   try {
          //     return read(
          //       `${app.getPath('userData')}/${repo}/repo-master${latest}`
          //     );
          //   } catch (error) {
          //     // console.log(error);
          //     return undefined;
          //   }
          // })(data.repos[0], latestRepo.configs[key].from);
          // console.log(from);
          const sql = `INSERT INTO config_v1 (
          repo_id,
          'index',
          version,
          cpu_manufacturer_include,
          cpu_manufacturer_exclude,
          cpu_brand_include,
          cpu_brand_exclude,
          baseboard_manufacturer_include,
          baseboard_manufacturer_exclude,
          baseboard_model_include,
          baseboard_model_exclude,
          arch,
          resolutionX,
          resolutionY,
          memory,
          cores,
          disk,
          minimum_version,
          name,
          description,
          picture,
          releaseDescription,
          config)
          VALUES (?, ?, ?, json(?), json(?), json(?), json(?), json(?), json(?), json(?), json(?), json(?), json(?), json(?), ?, ?, ?, ?, ?, ?, ?, ?, json(?)
          )`;
          console.log(sql);
          await db.prepare(sql).run(
            repoId,
            index,
            config.version,
            JSON.stringify(
              config.requirements.cpu.manufacturer.include || ['*']
            ),
            JSON.stringify(config.requirements.cpu.manufacturer.exclude || []),
            JSON.stringify(config.requirements.cpu.brand.include || ['*']),
            JSON.stringify(config.requirements.cpu.brand.exclude || []),
            JSON.stringify(
              config.requirements.baseboard.manufacturer.include || ['*']
            ),
            JSON.stringify(
              config.requirements.baseboard.manufacturer.exclude || []
            ),
            JSON.stringify(
              config.requirements.baseboard.model.include || ['*']
            ),
            JSON.stringify(config.requirements.baseboard.model.exclude || []),
            JSON.stringify(config.requirements.arch || ['*']),
            JSON.stringify(config.requirements.resolutionX || ['*']),
            JSON.stringify(config.requirements.resolutionY || ['*']),
            config.requirements.memory,
            config.requirements.cores,
            config.requirements.disk,
            parseFloat(config.requirements.minimumVersion),
            config.name,
            config.description,
            config.picture,
            config.releaseDescription,
            JSON.stringify({
              darwin: config.darwin,
              linux: config.linux,
              win: config.win,
            })
          );
        }
      })
    );

    console.log('searchResults');

    const result = await getVmsFromConfig(sysInfo, mainDisplay);
    return result;
  }
  if (repoVersion > latestRepo.systemVersion) {
    db.prepare('UPDATE repo SET version = ? WHERE url = ?').run(
      latestRepo.version,
      data.repos[0]
    );
  }

  const result = await getVmsFromConfig(sysInfo, mainDisplay);
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

ipcMain.on('electron-store-set', async (_event, key, val) => {
  console.log('on electron-store-set');
  // fs.readdir(`./assets/repoList.yml`, (err, files) => {
  //   files.forEach((file) => {
  //     console.log(file);
  //   });
  // });

  // fetch(
  //   'https://raw.githubusercontent.com/kymano-app/kymano-app.github.io/master/CNAME'
  // )
  //   .then((response: any) => {
  //     return response.text();
  //   })
  //   .then((text: any) => {
  //     console.log(text);
  //   });

  const insert = db.prepare('INSERT INTO cats (name) VALUES (@name)');

  const insertMany = db.transaction((cats: any) => {
    cats.forEach((cat: any) => {
      insert.run(cat);
    });
  });

  insertMany([{ name: '111' }, { name: '2222' }]);
});

console.log(app.getPath('userData'));

// const db = new Database(`${app.getPath('userData')}/db.sqlite3`, {
//   verbose: console.log,
// });

// db.exec(`CREATE TABLE cats (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   name TEXT NOT NULL
// )`);
// const insert = db.prepare('INSERT INTO cats (name) VALUES (@name)');

// const insertMany = db.transaction((cats: any) => {
//   // eslint-disable-next-line no-restricted-syntax
//   for (const cat of cats) {
//     insert.run(cat);
//   }
// });

// insertMany([{ name: '1212' }]);

// const row = db.prepare('SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}').get();
// console.log(row);
// console.log(JSON.stringify(row));

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
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
