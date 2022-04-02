export const upload = async (
  file: File,
  callback: CallableFunction,
  setProgress: CallableFunction
) => {
  return new Promise((resolve, reject) => {
    const tmpName = (Math.random() + 1).toString(36).substring(2);
    let tmpPath;
    console.log('tmpobj.name', tmpName);
    const fileSize = file.size;
    const chunkSize = 1 * 1024 * 1024;
    let offset = 0;
    let chunkReaderBlock = null;
    const readEventHandler = async (evt: any) => {
      if (evt.target.error == null) {
        offset += evt.target.result.byteLength;
        tmpPath = await callback(evt.target.result, tmpName);
        console.log('tmpPath:::::', tmpPath);
        console.log('offset:::::', offset);
        setProgress(offset);
      } else {
        console.log(`Read error: ${evt.target.error}`);
        reject();
        return;
      }
      if (offset >= fileSize) {
        console.log('Done reading file', tmpPath);
        resolve(tmpPath);
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
