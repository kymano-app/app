const electron = window.require('electron');
const { ipcRenderer } = electron;

export function sendFile(bytes, patch) {
  return new Promise((resolve) => {
    // ipcRenderer.once('electron-store-set', (_, arg) => {
    //   resolve(arg);
    // });
    // ipcRenderer.send('electron-store-set', message);
    ipcRenderer
      .invoke('save-file', bytes, patch)
      .then((result) => {
        // console.log('result::::', result);
        resolve(result);
        return true;
      })
      .catch((e) => {
        console.log('ERR::::', e);
      });
  });
}

export function importLayer(patch) {
  return new Promise((resolve) => {
    console.log('ipcRenderer import-layer', patch);
    ipcRenderer
      .invoke('import-layer', patch)
      .then((result) => {
        ipcRenderer.invoke('run-guestfs');
        console.log('result::::', result);
        resolve(result);
        return true;
      })
      .catch((e) => {
        console.log('ERR::::', e);
      });
  });
}

export function runGuestFs() {
  return new Promise((resolve) => {
    ipcRenderer
      .invoke('run-guestfs')
      .then((result) => {
        console.log('result::::', result);
        resolve(result);
        return true;
      })
      .catch((e) => {
        console.log('ERR::::', e);
      });
  });
}
