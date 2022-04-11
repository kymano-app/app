import Database from 'better-sqlite3';
import 'core-js/stable';
import { app, ipcMain } from 'electron';
import { DataSource, Kymano, QemuCommands, globalSockets } from 'kymano';
import net from 'net';
import path from 'path';
import 'regenerator-runtime/runtime';
import { build } from '../../package.json';
import { pids } from './global';
import { isRunningByPid } from './service/isRunningByPid';
import {
  addDriveViaMonitor,
  createVm as createVmService,
  exec,
  getGuestFsPid,
  runGuestFs as runGuestFsService,
  addNewVmDriveToGuestFs as addNewVmDriveToGuestFsService,
  addNewDiskToGuestFs as addNewDiskToGuestFsService,
  runGuestFsAndAddDisks,
  runVm as runVmService,
  sleep,
  delDrives,
} from './services';

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

const getConfigList = async (event) => {
  let configs;
  try {
    configs = await kymano.configListForIde();
  } catch (e) {
    console.log(':::::::::::', e);
  }
  return configs;
};

const getMyVms = async (event) => {
  let vms;
  try {
    vms = await kymano.getMyVms();
    console.log('vms::', vms);
  } catch (e) {
    console.log('ERR:::::::::::', e);
  }
  return vms;
};

const getMyDisks = async (event) => {
  let disks;
  try {
    disks = await dataSource.getMyDisks();
  } catch (e) {
    console.log(':::::::::::', e);
  }
  return disks;
};

const getMyVmDisks = async (event) => {
  let disks;
  try {
    disks = await dataSource.getMyVmDisks();
  } catch (e) {
    console.log(':::::::::::', e);
  }
  return disks;
};

const importDisk = async (event, tmpPath, name) => {
  let layerPath;
  try {
    layerPath = await kymano.importDisk(tmpPath, name);
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

const delDisks = async (event) => {
  const result = await delDrives();
  return result;
};

const addNewVmDriveToGuestFs = async (event, vmDisk) => {
  const added = await addNewVmDriveToGuestFsService(vmDisk);
  return added;
};

const addNewDiskToGuestFs = async (event, disk) => {
  const added = await addNewDiskToGuestFsService(disk);
  return added;
};

const execInGuestfs = async (event, command) => {
  console.log('exec-in-guestfs');
  // const myConfig = await kymano.getMyConfigById(1);
  // const sockets = JSON.parse(myConfig.sockets);
  const sockets = globalSockets.remote[1];
  console.log('exec-in-guestfs sockets', sockets.guestexec);

  const client = net.createConnection(sockets.guestexec);

  const result = await exec(command, client, false, globalMainWindow);
  return result;
};

const searchInGuestfs = async (event, command) => {
  const client = net.createConnection('/tmp/guestexec.sock');

  const result = await exec(command, client, true, globalMainWindow);
  return result;
};

const updateConfigs = async () => {
  await kymano.update();
};

const runGuestfs = async (event) => {
  const pid = await runGuestFsService(kymano);
  return pid;
};

const createVm = async (event, configId) => {
  const result = await createVmService(kymano, configId);
  return result;
};

const runVm = async (event, vmNameId) => {
  const result = await runVmService(kymano, vmNameId);
  return result;
};

export async function init(mainWindow) {
  try {
    globalMainWindow = mainWindow;

    const rows = await dataSource.getTables();
    if (rows === 0) {
      await dataSource.createTables();
    }
    await updateConfigs();

    runGuestFsAndAddDisks(kymano, dataSource);
  } catch (e) {
    fsNormal.writeFileSync(
      `${app.getPath('userData')}/error.log`,
      `ERR: ${e.message}`
    );
  }

  ipcMain.handle('save-file', saveFile);
  ipcMain.handle('is-gustfs-running', isGustfsRunning);
  ipcMain.handle('get-my-disks', getMyDisks);
  ipcMain.handle('get-my-vm-disks', getMyVmDisks);
  ipcMain.handle('import-disk', importDisk);
  ipcMain.handle('add-imported-layer-to-guestfs', addImportedLayerToGuestfs);
  ipcMain.handle('add-new-vm-drive-to-guestfs', addNewVmDriveToGuestFs);
  ipcMain.handle('add-new-disk-to-guestfs', addNewDiskToGuestFs);
  ipcMain.handle('exec-in-guestfs', execInGuestfs);
  ipcMain.handle('search-in-guestfs', searchInGuestfs);
  ipcMain.handle('run-guestfs', runGuestfs);
  ipcMain.handle('create-vm', createVm);
  ipcMain.handle('run-vm', runVm);
  ipcMain.handle('update-configs', updateConfigs);
  ipcMain.handle('get-config-list', getConfigList);
  ipcMain.handle('get-my-vms', getMyVms);
  ipcMain.handle('del-disks', delDisks);
}
