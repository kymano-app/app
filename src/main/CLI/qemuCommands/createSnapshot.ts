import getExternalBinariesPath from '../../service/getExternalBinariesPath';

const spawn = require('await-spawn');

const createSnapshot = async (backingFile: string, snapshotFile: string) => {
  console.log('createSnapshot');
  const snapshotCmd = [
    'create',
    '-f',
    'qcow2',
    '-F',
    'qcow2',
    '-b',
    backingFile,
    snapshotFile,
  ];
  await spawn(
    `${getExternalBinariesPath()}sysroot-macOS-arm64/bin/qemu-img`,
    snapshotCmd
  );
};

export default async (backingFile: string, snapshotFile: string) => {
  return Promise.resolve(await createSnapshot(backingFile, snapshotFile));
};
