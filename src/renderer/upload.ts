import { useFileUploadProgressBar } from './Context/FileUploadProgressBarContext';

const tmp = require('tmp');

export const upload = async (
  file: File,
  callback: CallableFunction,
  setProgress: CallableFunction
) => {
  return new Promise((resolve, reject) => {
    const tmpobj = tmp.fileSync();
    console.log('tmpobj.name', tmpobj.name);
    const fileSize = file.size;
    const chunkSize = 1 * 1024 * 1024;
    let offset = 0;
    let chunkReaderBlock = null;
    const readEventHandler = (evt: any) => {
      if (evt.target.error == null) {
        offset += evt.target.result.byteLength;
        callback(evt.target.result, tmpobj.name);
        console.log('offset:::::', offset);
        setProgress(offset);
      } else {
        console.log(`Read error: ${evt.target.error}`);
        reject();
        return;
      }
      if (offset >= fileSize) {
        console.log('Done reading file', tmpobj.name);
        resolve(tmpobj.name);
        // convrt to qcow2
        return;
      }
      chunkReaderBlock(offset, chunkSize, file);
    };

    chunkReaderBlock = (_offset: number, length: number, _file: File) => {
      const r = new FileReader();
      const blob = _file.slice(_offset, length + _offset);
      r.onload = readEventHandler;
      r.readAsArrayBuffer(new Blob([blob]));
    };

    chunkReaderBlock(offset, chunkSize, file);

    console.log('done');
  });
};
