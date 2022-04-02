import { app } from 'electron';
import net from 'net';
import path from 'path';
import readline from 'readline';
import { build } from '../../package.json';

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

export async function readLine(rl, client, instantResult, mainWindow) {
  const arr = [];
  return new Promise((resolve) => {
    rl.on('line', function (line) {
      if (instantResult) {
        mainWindow.webContents.send('response-cmd', line);
      } else {
        arr.push(line);
      }
      if (line === 'end') {
        client.destroy();
        resolve(arr);
      }
    });
  });
}

export async function exec(text, client, instantResult, mainWindow) {
  client.write(text);

  const rl = readline.createInterface({ input: client });
  const result = await readLine(rl, client, instantResult, mainWindow);
  return result;
}

export async function runGuestFs(kymano): Promise<number | null> {
  try {
    const response = await kymano.run('guestfs', []);
    const { pid } = response[0].child;
    fsNormal.writeFileSync(
      path.join(app.getPath('userData'), 'guestfs.pid'),
      pid.toString()
    );
    return pid;
  } catch (e) {
    fsNormal.writeFileSync(`${app.getPath('userData')}/error.log`, e.message);
  }

  return null;
};

export async function addDriveViaMonitor (path) {
  const client = new net.Socket();
  const disk = `disk${Math.floor(Math.random() * 100000)}`;
  const device = `${disk}d`;
  const hash = path.match(/([\w]+)$/)[1];

  client.connect(5551, 'localhost', function () {
    client.write(`drive_add 0 "if=none,file=${path},id=${disk}"\n`, () => {
      console.log('move forward command sent');
    });
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
        sleepAndResolve(5, resolve);
      } else if (line === 'OK' && !deviceAddcommandAccepted) {
        client.write(
          `device_add usb-storage,serial=KY-${hash},drive=${disk},id=${device}\n`,
          () => {
            console.log('client.write device_add');
          }
        );
      }
    });
  });
}

export async function runGuestFsAndAddDisks(kymano, dataSource) {
  await runGuestFs(kymano);
  console.log('runGuestFs');
  await sleep(1);
  const volumes = await dataSource.getVolumes();
  console.log('volumes:::', volumes);

  // eslint-disable-next-line no-restricted-syntax
  for (const volume of volumes) {
    console.log('volume:', volume);
    // eslint-disable-next-line no-await-in-loop
    await addDriveViaMonitor(
      `${app.getPath('userData')}/layers/${volume.hash}`
    );
  }
  console.log('addDriveViaMonitor');
};

export function getGuestFsPid() {
  return fsNormal.readFileSync(
    path.join(app.getPath('userData'), 'guestfs.pid')
  );
}
