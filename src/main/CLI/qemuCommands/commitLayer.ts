import getExternalBinariesPath from '../../service/getExternalBinariesPath';

const spawn = require('await-spawn');

const commitLayer = async (layerPath: string) => {
  try {
    const response = await spawn(
      `${getExternalBinariesPath()}sysroot-macOS-arm64/bin/qemu-img`,
      ['commit', layerPath]
    );

    console.log(response.toString(), layerPath);
  } catch (e) {
    console.log(e.stderr.toString(), layerPath);
  }
};

export default async (layerPath: string) => {
  return Promise.resolve(await commitLayer(layerPath));
};
