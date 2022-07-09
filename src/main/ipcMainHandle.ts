import Database from 'better-sqlite3';
import 'core-js/stable';
import { app, ipcMain } from 'electron';
import { DataSource, electronWindow, globalSockets, Kymano, QemuCommands } from 'kymano';
import net from 'net';
import path from 'path';
import 'regenerator-runtime/runtime';
import { build } from '../../package.json';
import { lenghtSocketData, pushSocketData, socketData } from './global';
import { isRunningByPid } from './service/isRunningByPid';
import {
  addDriveViaMonitor,
  addNewDiskToGuestFs as addNewDiskToGuestFsService,
  addNewVmDriveToGuestFs as addNewVmDriveToGuestFsService,
  createVm as createVmService,
  delDrives,
  exec,
  getGuestFsPid,
  runGuestFs as runGuestFsService,
  runGuestFsAndAddDisks,
  runVm as runVmService,
  sleep,
} from './services';

const os = require('os');
const fs = require('fs').promises;
const fsNormal = require('fs');

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

const getMyVmsWithoutInternals = async (event) => {
  let vms;
  try {
    vms = await kymano.getMyVmsWithoutInternals();
    console.log('vms::', vms);
  } catch (e) {
    console.log('ERR:::::::::::', e);
  }
  return vms;
};

const changeVmName = async (event, name: string, id: number) => {
  await dataSource.changeVmName(name, id);
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

const getMyConfigForUpdate = async (event) => {
  let data;
  try {
    data = await dataSource.getMyConfigForUpdate();
    console.log(`src/main/ipcMainHandle.ts:91 data`, data);
  } catch (e) {
    console.log(':::::::::::', e);
  }
  return data;
};

const updateConfigInMyConfig = async (event, myConfigId) => {
  await dataSource.updateConfigInMyConfig(myConfigId);
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

const client = {};
function createConnection(worker: string) {
  const sockets = globalSockets.remote[1];
  let fullData = '';
  console.log('sockets', sockets);
  if (!client[worker]) {
    client[worker] = net.createConnection(sockets[worker]);
    console.log('new connection');
    client[worker].on('error', async function (error) {
      await sleep(1);
      console.log('error, trying again', error);
      client[worker] = createConnection(worker);
    });
    client[worker].on('data', (data) => {
      fullData += data.toString();
      const nb = data.toString().search(/\0/);
      const lastChar = data[data.length - 1];
      console.log('lastChar: ', lastChar);
      if (nb != -1) {
        const dataArr = fullData.split('\0');
        let arr = [];
        if (lastChar !== 0) {
          console.log('lastChar!=0: ', lastChar);
          arr = dataArr.slice(0, dataArr.length - 2);
          fullData = dataArr[dataArr.length - 1];
          console.log('fullData add:', dataArr[dataArr.length - 1]);
        } else {
          fullData = '';
          arr = dataArr.slice(0, dataArr.length - 1);
        }
        pushSocketData(worker, arr);
      }
      // if (data.toString().split('\0').length > 1) {
      //   const dataArr = fullData.split('\0');
      //   fullData = '';
      //   console.log('data:::', dataArr, worker);
      //   pushSocketData(worker, dataArr);
      // }
    });
  }

  return client[worker];
}

const execInGuestfs = async (event, command, worker) => {
  console.log('exec-in-guestfs', command, worker);
  // const myConfig = await kymano.getMyConfigById(1);
  // const sockets = JSON.parse(myConfig.sockets);
  // const sockets = globalSockets.remote[1];
  // console.log('exec-in-guestfs sockets', sockets.guestexec);

  if (!client[worker]) {
    console.log('NO client');
    client[worker] = createConnection(worker);
  }
  // try {
  //   client = net.createConnection(sockets.guestexec);
  // } catch (err) {
  //   console.log('err::::::::::', err);
  // }
  // client.on('error', function (err) {
  //   console.log('err2::::::::::', err);
  // });
  // if (rlSearchInGuestFs) {
  // const [result0, rl0] = exec(
  //   'kill -9 `pidof grep`; kill -9 `pidof find`',
  //   client,
  //   false,
  //   globalMainWindow
  // );
  // await result0;
  // rl0.close();
  // }
  while (lenghtSocketData(worker) !== 0) {
    console.log('wait:::', worker, socketData[worker]);
    // eslint-disable-next-line no-await-in-loop
    await sleep(0.5);
  }

  const result = await exec(
    command,
    client[worker],
    false,
    worker
  );
  // setRlSearchInGuestFs(rl);
  console.log('finished', result);

  return result;
};

const searchInGuestfs = async (event, command, worker) => {
  console.log('searchInGuestfs', command, worker);

  // const sockets = globalSockets.remote[1];

  // const client = net.createConnection(sockets.guestexec);
  // client = createConnection();
  if (!client[worker]) {
    console.log('NO client');
    client[worker] = createConnection(worker);
  }

  // const [result0, rl0] = exec(
  //   'kill -9 `pidof grep`; kill -9 `pidof find`',
  //   client,
  //   false,
  //   globalMainWindow
  // );
  // await result0;
  // rl0.close();
  while (lenghtSocketData(worker) !== 0) {
    console.log('wait:::', worker, socketData[worker]);
    await sleep(0.5);
  }

  const result = await exec(
    command,
    client[worker],
    true,
    worker
  );
  // setRlSearchInGuestFs(rl);
  console.log('finished', result);
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
    electronWindow.global = mainWindow;

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

  const rollbackConfigInMyConfig = async (event, myConfigId, historyId) => {
    await dataSource.rollbackConfigInMyConfigV1(myConfigId, historyId);
  };

  const getHistoryIdFromConfig = async (event, configId) => {
    let data;
    try {
      data = await dataSource.getHistoryIdFromConfigV1(configId);
      console.log(`src/main/ipcMainHandle.ts:320 data`, data);
    } catch (e) {
      console.log(':::::::::::', e);
    }
    return data;
  };

  const getPreviousIdFromConfigHistory = async (event, configHistoryId) => {
    let data;
    try {
      data = await dataSource.getPreviousIdFromConfigHistoryV1(configHistoryId);
      console.log(`src/main/ipcMainHandle.ts:331 data`, data);
    } catch (e) {
      console.log(':::::::::::', e);
    }
    return data;
  };


  const getConfigHistoryById = async (event, configHistoryId) => {
    let data;
    try {
      data = await dataSource.getConfigHistoryByIdV1(configHistoryId);
      console.log(`src/main/ipcMainHandle.ts:343 getConfigHistoryById`,data);
    } catch (e) {
      console.log(':::::::::::', e);
    }
    return data;
  };


  const getConfigById = async (event, configId) => {
    let data;
    try {
      data = await dataSource.getConfigById(configId);
      console.log(`src/main/ipcMainHandle.ts:355 getConfigById`);
    } catch (e) {
      console.log(':::::::::::', e);
    }
    return data;
  };

  const getLatestConfigByHistoryId = async (event, historyId) => {
    let data;
    try {
      data = await dataSource.getLatestConfigByHistoryIdV1(historyId);
      console.log(`src/main/ipcMainHandle.ts:366 getLatestConfigByHistoryIdV1`, data);
    } catch (e) {
      console.log(':::::::::::', e);
    }
    return data;
  };


  const getDrivesNames = async (event, myConfigId) => {
    let data;
    try {
      data = await kymano.getDrivesNamesFromMyConfigId(myConfigId);
      console.log(`src/main/ipcMainHandle.ts:366 getLatestConfigByHistoryIdV1`, data);
    } catch (e) {
      console.log(':::::::::::', e);
    }
    return data;
  };

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
  ipcMain.handle('get-my-vms', getMyVmsWithoutInternals);
  ipcMain.handle('del-disks', delDisks);
  ipcMain.handle('change-vm-name', changeVmName);
  ipcMain.handle('get-my-config-for-update', getMyConfigForUpdate);
  ipcMain.handle('update-config-in-my-config', updateConfigInMyConfig);
  ipcMain.handle('get-history-id-from-config', getHistoryIdFromConfig);
  ipcMain.handle('rollback-config-in-my-config', rollbackConfigInMyConfig);
  ipcMain.handle(
    'get-previous-id-from-config-history',
    getPreviousIdFromConfigHistory
  );
  ipcMain.handle('get-config-history-by-id', getConfigHistoryById);
  ipcMain.handle('get-config-by-id', getConfigById);
  ipcMain.handle('get-latest-config-by-history-id', getLatestConfigByHistoryId);
  ipcMain.handle('get-drives-names', getDrivesNames)
}
