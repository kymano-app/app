import { app } from 'electron';
import isFileExist from '../../service/isFileExist';
import createImg from '../../qemuCommands/createImg';
import createSnapshot from '../../qemuCommands/createSnapshot';
import getBackingLayerHash from '../../qemuCommands/getBackingLayerHash';

const getOrCreateUserDriveAndFillConfigVars = async (
  drives: any,
  userDrivesDirectory: string
) => {
  const configVars: any[][] = [];
  await Promise.all(
    Object.entries(drives).map(async ([driveName, driveData]) => {
      const userDrivePath = `${userDrivesDirectory}/${driveName}.qcow2`;
      if (!driveData.path && !driveData.layers) {
        configVars.push([driveName, userDrivePath]);
        if (!isFileExist(userDrivePath)) {
          await createImg(userDrivePath);
        }
      } else if (driveData.path) {
        configVars.push([driveName, driveData.path]);
      } else if (driveData.layers) {
        let backingLayerHash;
        const lastLayerHash =
          driveData.layers[driveData.layers.length - 1].hash;
        if (isFileExist(userDrivePath)) {
          backingLayerHash = await getBackingLayerHash(userDrivePath);
        }
        if (backingLayerHash !== lastLayerHash) {
          await createSnapshot(
            `${app.getPath('userData')}/layers/${lastLayerHash}.qcow2`,
            userDrivePath
          );
        }
        configVars.push([driveName, userDrivePath]);
      }
    })
  );
  return configVars;
};

export default async (drives, userDrivesDirectory) => {
  return Promise.resolve(
    await getOrCreateUserDriveAndFillConfigVars(drives, userDrivesDirectory)
  );
};
