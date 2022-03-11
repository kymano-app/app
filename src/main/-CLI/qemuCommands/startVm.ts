import path from 'path';

const util = require('util');

const exec = util.promisify(require('child_process').exec);

const spawn = require('await-spawn');

const startVm = async (confparams: any, qemuBinary: string) => {
  try {
    // await spawn(qemu, confparams, { stdio: 'inherit' });
    await spawn('chmod', ['+x', qemuBinary], { stdio: 'inherit' });
    await spawn('xattr', ['-cr', qemuBinary], { stdio: 'inherit' });
    // const { stdout, stderr } = await exec(
    //   [
    //     `DYLD_LIBRARY_PATH=${path.join(
    //       qemuBinary.split('/').slice(0, -2).join('/').replace(/ /g, '\\ '),
    //       'lib'
    //     )}`,
    //     qemuBinary.replace(/ /g, '\\ '),
    //     '-L',
    //     `${path
    //       .join(qemuBinary.split('/').slice(0, -2).join('/'), 'share/qemu')
    //       .replace(/ /g, '\\ ')}`,
    //     ...confparams,
    //   ].join(' ')
    // );
    // console.log('stdout:', stdout);
    // console.error('stderr:', stderr);

    await spawn(
      qemuBinary,
      [
        '-L',
        `${path.join(
          qemuBinary.split('/').slice(0, -2).join('/'),
          'share/qemu'
        )}`,
        ...confparams,
      ],
      {
        stdio: 'inherit',
        detached: true,
        env: {
          ...process.env,
          DYLD_LIBRARY_PATH: path.join(
            qemuBinary.split('/').slice(0, -2).join('/'),
            'lib'
          ),
        },
      }
    );
  } catch (error) {
    console.error(error);
  }
};

export default async (confparams: any, qemuBinary: string) => {
  return Promise.resolve(await startVm(confparams, qemuBinary));
};
