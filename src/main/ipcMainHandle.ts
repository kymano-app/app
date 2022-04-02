import AdmZip from 'adm-zip';
import axios from 'axios';
import Database from 'better-sqlite3';
import 'core-js/stable';
import { app, ipcMain } from 'electron';
import { DataSource, Kymano, QemuCommands } from 'kymano';
import net from 'net';
import path from 'path';
import 'regenerator-runtime/runtime';
import { read } from 'simple-yaml-import';
import si from 'systeminformation';
import { build, version } from '../../package.json';
import getRepoListDir from './service/getRepoListDir';
import { isRunningByPid } from './service/isRunningByPid';
import {
  addDriveViaMonitor,
  exec,
  getGuestFsPid,
  runGuestFs,
  runGuestFsAndAddDisks,
  sleep
} from './services';
import processConfig from './v1/processConfig';

const os = require('os');
const fs = require('fs').promises;
const fsNormal = require('fs');

let globalMainWindow;

const appData = app.getPath('appData');
app.setPath('userData', path.join(appData, build.productName));

const db = new Database(`${app.getPath('userData')}/sqlite3.db`, {
  verbose: console.log,
});

const dataSource = new DataSource(db);
const kymano = new Kymano(dataSource, new QemuCommands());

const saveFile = async (event, bytes, tmpName) => {
  const tmpPath = path.join(os.tmpdir(), tmpName);
  fsNormal.appendFileSync(tmpPath, Buffer.from(bytes));
  return tmpPath;
};

const isGustfsRunning = async (event) => {
  const pid = getGuestFsPid();
  return isRunningByPid(pid);
};

const getVolumes = async (event) => {
  let volumes;
  try {
    volumes = await dataSource.getVolumes();
  } catch (e) {
    console.log(':::::::::::', e);
  }
  return volumes;
};

const importLayer = async (event, path) => {
  let layerPath;
  try {
    layerPath = await kymano.importLayer(path);
  } catch (e) {
    fsNormal.writeFileSync(
      `${app.getPath('userData')}/error.log`,
      `importLayer ERR: ${e.message}`
    );
  }
  console.log('layerPath', layerPath);
  return layerPath;
};

const addImportedLayerToGuestfs = async (event, path) => {
  await sleep(1);
  const added = await addDriveViaMonitor(path);
  return added;
};

const execInGuestfs = async (event, command) => {
  console.log('exec-in-guestfs');
  const client = net.createConnection('/tmp/guestexec.sock');

  const result = await exec(command, client, false, globalMainWindow);
  return result;
};
const searchInGuestfs = async (event, command) => {
  const client = net.createConnection('/tmp/guestexec.sock');

  const result = await exec(command, client, true, globalMainWindow);
  return result;
};

const updateConfigs = async (event, someArgument) => {
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
};

const runGuestfs = async (event) => {
  const pid = await runGuestFs(kymano);
  return pid;
};

export async function init(mainWindow) {
  globalMainWindow = mainWindow;
  const rows = await dataSource.getTables();
  if (rows === 0) {
    await dataSource.createTables();
  }

  runGuestFsAndAddDisks(kymano, dataSource);

  ipcMain.handle('save-file', saveFile);
  ipcMain.handle('is-gustfs-running', isGustfsRunning);
  ipcMain.handle('get-volumes', getVolumes);
  ipcMain.handle('import-layer', importLayer);
  ipcMain.handle('add-imported-layer-to-guestfs', addImportedLayerToGuestfs);
  ipcMain.handle('exec-in-guestfs', execInGuestfs);
  ipcMain.handle('search-in-guestfs', searchInGuestfs);
  ipcMain.handle('run-guestfs', runGuestfs);
  ipcMain.handle('update-configs', updateConfigs);
}
