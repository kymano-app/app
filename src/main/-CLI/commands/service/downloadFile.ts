const fs = require('fs');
const axios = require('axios');
const ProgressBar = require('progress');

async function downloadFile(url: string, path: string) {
  const { data, headers } = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });
  const totalLength = headers['content-length'];

  const progress = new ProgressBar('downloading [:bar] :percent :etas', {
    width: 40,
    complete: '=',
    incomplete: ' ',
    renderThrottle: 1,
    total: parseInt(totalLength, 10),
  });

  const writer = fs.createWriteStream(path);

  data.on('data', (chunk: string | any[]) => {
    progress.tick(chunk.length);
  });
  data.pipe(writer);

  return new Promise<void>((resolve, reject) => {
    data.on('end', () => {
      console.log('::::::::::::::::resolve();');
      resolve();
    });

    data.on('error', () => {
      console.log('::::::::::::::::reject();');
      reject();
    });
  });
}

export default async (url: string, path: string) => {
  return Promise.resolve(await downloadFile(url, path));
};
