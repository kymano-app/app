import { app } from 'electron';

const fs = require('fs');

const removeUserLayer = async (args: any[], db: any) => {
  const vmAndDisk = args[5];
  const vmName = vmAndDisk.split('/')[0];
  const diskName = vmAndDisk.split('/')[1];
  const driveFile = `${app.getPath(
    'userData'
  )}/user_layers/${vmName}/${diskName}.qcow2`;

  fs.unlinkSync(driveFile);
};

export default async (args: any[], db: any) => {
  return Promise.resolve(await removeUserLayer(args, db));
};
