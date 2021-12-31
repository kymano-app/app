import { app } from 'electron';
import getMyLocalConfig from '../../../dataSource/config/getMyLocalConfig';
import startVm from '../../qemuCommands/startVm';
import isFileExist from '../../service/isFileExist';
import getOrCreateUserDriveAndFillConfigVars from './getOrCreateUserDriveAndFillConfigVars';
import replaceVarsToDrivePathes from './replaceVarsToDrivePathes';

const fs = require('fs').promises;

const execConfig = async (name: string, db: any) => {
  const userDrivesDirectory = `${app.getPath(
    'userData'
  )}/user_layers/${name.toLowerCase()}`;

  if (!isFileExist(userDrivesDirectory)) {
    await fs.mkdir(userDrivesDirectory, {
      recursive: true,
    });
  }

  const config = await getMyLocalConfig(name, db);

  const configVars = await getOrCreateUserDriveAndFillConfigVars(
    config.darwin.local.drives,
    userDrivesDirectory
  );
  const confparams = await replaceVarsToDrivePathes(
    config.darwin.local.config,
    configVars
  );

  await startVm(confparams);
};

export default async (config: any, db: any) => {
  return Promise.resolve(await execConfig(config, db));
};
