import getExternalBinariesPath from '../../service/getExternalBinariesPath';

const spawn = require('await-spawn');

const createImg = async (path: string) => {
  try {
    console.log(
      `${getExternalBinariesPath()}sysroot-macOS-arm64/bin/qemu-img`,
      ['create', '-f', 'qcow2', path, '100G']
    );
    const response = await spawn(
      `${getExternalBinariesPath()}sysroot-macOS-arm64/bin/qemu-img`,
      ['create', '-f', 'qcow2', path, '100G']
    );
    console.log(response.toString());
  } catch (e) {
    console.log(e.stderr.toString(), path);
  }
};

export default async (path: string) => {
  return Promise.resolve(await createImg(path));
};
