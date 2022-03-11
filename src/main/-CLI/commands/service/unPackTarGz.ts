import fs from 'fs';
import path from 'path';
import tar from 'tar';

const ProgressBar = require('progress');

async function unPackTarGz(file: string, dest: string) {
  let numberOfFiles = 0;
  tar.t({
    file,
    sync: true,
    onentry: () => {
      numberOfFiles += 1;
    },
  });

  const progress = new ProgressBar('extracting [:bar] :percent :etas', {
    width: 40,
    complete: '=',
    incomplete: ' ',
    renderThrottle: 1,
    total: numberOfFiles,
  });

  const data = fs
    .createReadStream(path.resolve(file))
    .on('error', console.log)
    .pipe(tar.x({ C: dest }))
    .on('entry', () => {
      progress.tick(1);
    });

  return new Promise<void>((resolve, reject) => {
    data.on('end', () => {
      resolve();
    });

    data.on('error', () => {
      reject();
    });
  });
}

export default async (file: string, dest: string) => {
  return Promise.resolve(await unPackTarGz(file, dest));
};
