import getExternalBinariesPath from '../../service/getExternalBinariesPath';

const spawn = require('await-spawn');

const startVm = async (confparams: any) => {
  const qemu = `${getExternalBinariesPath()}sysroot-macOS-arm64/bin/qemu-system-aarch64`;
  console.log(qemu, ...confparams);
  try {
    await spawn(qemu, confparams, { stdio: 'inherit' });
  } catch (error) {
    console.error(error);
  }
};

export default async (confparams: any) => {
  return Promise.resolve(await startVm(confparams));
};
