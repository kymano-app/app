import getExternalBinariesPath from '../../service/getExternalBinariesPath';

const spawn = require('await-spawn');

const getBackingLayerHash = async (path: string) => {
  const qemuImg = `${getExternalBinariesPath()}sysroot-macOS-arm64/bin/qemu-img`;
  const qemuInfo = await spawn(qemuImg, ['info', path, '--output=json']);
  const parsedResponse = JSON.parse(qemuInfo.toString());
  if (parsedResponse['backing-filename']) {
    return /^.*?([\w]+)\.[\w]+$/.exec(parsedResponse['backing-filename'])![1];
  }
  return undefined;
};

export default async (path: string) => {
  return Promise.resolve(await getBackingLayerHash(path));
};
