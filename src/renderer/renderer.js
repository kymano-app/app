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

export function addImportLayerToGuestFs(layerPath) {
  return new Promise((resolve) => {
    console.log('addImportLayerToGuestFs', layerPath);
    ipcRenderer
      .invoke('add-imported-layer-to-guestfs', layerPath)
      .then((result) => {
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
        console.log('import-layer result', result);
        resolve(result);
        return true;
      })
      .catch((e) => {
        console.log('ERR::::', e);
      });
  });
}

export function isGustFsRunning() {
  return new Promise((resolve) => {
    ipcRenderer
      .invoke('is-gustfs-running')
      .then((result) => {
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
        console.log('runGuestFs result::::', result);
        resolve(result);
        return true;
      })
      .catch((e) => {
        console.log('ERR::::', e);
      });
  });
}
