import { app } from 'electron';
import { globalSockets, Kymano, electronWindow } from 'kymano';
import net from 'net';
import path from 'path';
import readline from 'readline';
import { build } from '../../package.json';
import getArch from './-CLI/commands/service/getArch';
import {
  cleanSocketData,
  delFromDiskIds,
  diskIds,
  getCmdId,
  pids,
  shiftSocketData,
} from './global';

const fs = require('fs').promises;
const fsNormal = require('fs');

const appData = app.getPath('appData');

app.setPath('userData', path.join(appData, build.productName));

export async function listDirectories(dirs: any[]) {
  return Promise.all(dirs.map((dir) => fs.readdir(dir))).then((files) =>
    files.flat()
  );
}

export async function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export async function sleepAndResolve(
  seconds: number,
  setResolve: CallableFunction
) {
  await sleep(seconds);
  setResolve(true);
}

export async function readLine(
  instantResult,
  command,
  cmdId,
  worker
) {
  console.log('readLine:::::', cmdId, worker, command);
  const arr = [];
  return new Promise(async (resolve) => {
    while (true) {
      const line = shiftSocketData(worker);
      // console.log('line:::', cmdId, worker, line);
      if (!line) {
        // eslint-disable-next-line no-await-in-loop
        await sleep(0.1);
        // eslint-disable-next-line no-continue
        continue;
      }
      if (instantResult) {
        try {
          electronWindow.global.webContents.send('response-cmd', line);
        } catch (err) {
          console.log('err::::::::', err);
        }
      } else {
        console.log('arr.push:::', cmdId, worker, line);
        arr.push(line);
      }
      if (line === `end${cmdId}`) {
        console.log('resolve:::', cmdId);
        // client.destroy();
        cleanSocketData(worker);
        resolve(arr);
        console.log('break:::', cmdId);
        break;
      }
    }
  });
}

export async function exec(command, client, instantResult, worker) {
  const cmdId = getCmdId();

  console.log('exec start', command, cmdId);
  let result;
  try {
    await client.write(`${cmdId}#kymano#${command}`);

    // const rl = readline.createInterface({ input: client });
    console.log('readLine', cmdId);
    // new Promise((resolve) =>
    //   setTimeout(() => {
    //     rl.close();
    //     resolve();
    //   }, 10 * 1000)
    // );
    result = await readLine(instantResult, command, cmdId, worker);
    console.log('readLine result', result, cmdId);
    return result;
  } catch (err) {
    console.log('err!::::::', err);
  }
}

export async function runGuestFs(kymano: Kymano): Promise<number | null> {
  try {
    const myConfig = await kymano.getMyConfigById(1);
    if (!myConfig) {
      await kymano.createVm(getArch() === 'arm64' ? 1 : 2);
      const response = await kymano.runVm(1);
      console.log(`src/main/services.ts:114 response`, response);
      pids.push(response[0].child.pid);
    } else {
      const response = await kymano.runVm(1);
      console.log(`src/main/services.ts:114 response`, response);
      pids.push(response[0].child.pid);
    }
    // const response = await kymano.run('guestfs', []);
    // const { pid } = response[0].child;
    // fsNormal.writeFileSync(
    //   path.join(app.getPath('userData'), 'guestfs.pid'),
    //   pid.toString()
    // );
    // return pid;
  } catch (e) {
    fsNormal.writeFileSync(`${app.getPath('userData')}/error.log`, e.message);
  }

  return null;
}

export async function createVm(kymano, configId): Promise<number | null> {
  try {
    const vmNameId = await kymano.createVm(configId);
    return vmNameId;
  } catch (e) {
    fsNormal.writeFileSync(`${app.getPath('userData')}/error.log`, e.message);
  }

  return null;
}

export async function runVm(kymano, vmNameId) {
  try {
    const response = await kymano.runVm(vmNameId);
    pids.push(response[0].child.pid);
    console.log('response:::::::', response);

    return;
  } catch (e) {
    fsNormal.writeFileSync(`${app.getPath('userData')}/error.log`, e.message);
  }
}

export async function addDriveViaMonitor(diskPath) {
  console.log('addDriveViaMonitor:::::', path);
  // const myConfig = await kymano.getMyConfigById(1);
  // const sockets = JSON.parse(myConfig.sockets);
  const sockets = globalSockets.remote[1];
  console.log('myConfig sockets:::::', sockets);
  const client = net.createConnection(sockets.monitor);
  const disk = `disk${Math.floor(Math.random() * 100000)}`;
  const device = `${disk}d`;
  const diskName = path.basename(diskPath);

  client.write(`drive_add 0 "if=none,file=${diskPath},id=${disk}"\n`, () => {
    console.log('drive_add command sent');
  });

  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: client });
    let driveAddcommandAccepted = false;
    let deviceAddcommandAccepted = false;
    rl.on('line', function (line) {
      console.log('line:', line);
      if (/drive_add/.test(line)) {
        driveAddcommandAccepted = true;
        console.log('driveAddcommandAccepted');
      } else if (/device_add/.test(line)) {
        deviceAddcommandAccepted = true;
        console.log('deviceAddcommandAccepted');
        client.destroy();
        sleepAndResolve(1, resolve);
      } else if (line === 'OK' && !deviceAddcommandAccepted) {
        client.write(
          `device_add usb-storage,serial=KY-${diskName},drive=${disk},id=${device}\n`,
          () => {
            console.log('client.write device_add');
            diskIds.push(device);
          }
        );
      }
    });
  });
}

export async function delDrivesViaMonitor(diskId) {
  const sockets = globalSockets.remote[1];
  const client = net.createConnection(sockets.monitor);
  console.log('delDrivesViaMonitor:::::', sockets.monitor);

  client.write(`device_del ${diskId}\n`, () => {
    delFromDiskIds(diskId);
  });

  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: client });
    rl.on('line', function (line) {
      console.log('delDrivesViaMonitor line:', line);
      if (/device_del/.test(line)) {
        console.log('device_del line:', line);
        client.destroy();
        resolve();
      }
    });
  });
}

export async function delDrives() {
  diskIds.forEach(async (diskId) => {
    await delDrivesViaMonitor(diskId);
  });
}

export async function addNewVmDriveToGuestFs(vmDisk) {
  return addDriveViaMonitor(
    `${app.getPath('userData')}/user_layers/vm/${vmDisk}`
  );
}

export async function addNewDiskToGuestFs(disk) {
  return addDriveViaMonitor(
    `${app.getPath('userData')}/user_layers/disk/${disk}`
  );
}

export async function delDrivesFromGuestFs() {
  return delDriveViaMonitor();
}

export async function runGuestFsAndAddDisks(kymano, dataSource) {
  await runGuestFs(kymano);
  // console.log('runGuestFsAndAddDisks');
  // await sleep(1);
  // const myDisks = await dataSource.getMyDisks();
  // const myVmDisks = await dataSource.getMyVmDisks();
  // console.log('disks:::', myDisks);
  // console.log('myVmDisks:::', myVmDisks);

  // // eslint-disable-next-line no-restricted-syntax
  // for (const disk of myDisks) {
  //   console.log('disk:', disk);
  //   // eslint-disable-next-line no-await-in-loop
  //   await addDriveViaMonitor(
  //     `${app.getPath('userData')}/user_layers/disk/${disk.id}`
  //   );
  // }
  // // eslint-disable-next-line no-restricted-syntax
  // for (const vm of myVmDisks) {
  //   console.log('disk:', vm);
  //   const vmDisks = JSON.parse(vm.disks);
  //   // eslint-disable-next-line no-restricted-syntax
  //   for (const vmDisk of vmDisks) {
  //     // eslint-disable-next-line no-await-in-loop
  //     await addDriveViaMonitor(
  //       `${app.getPath('userData')}/user_layers/vm/${vm.id}-${vmDisk}`
  //     );
  //   }
  // }
  // console.log('addDriveViaMonitor');
}

export function getGuestFsPid() {
  return fsNormal.readFileSync(
    path.join(app.getPath('userData'), 'guestfs.pid')
  );
}
