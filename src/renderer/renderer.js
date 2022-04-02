export function sendFile(bytes, tmpName) {
  return new Promise((resolve) => {
    // window.electron.once('electron-store-set', (_, arg) => {
    //   resolve(arg);
    // });
    // window.electron.send('electron-store-set', message);
    window.electron
      .invoke('save-file', bytes, tmpName)
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
    window.electron
      .invoke('add-imported-layer-to-guestfs', layerPath)
      .then((result) => {
        console.log('add-imported-layer-to-guestfs', result);
        resolve(result);
        return result;
      })
      .catch((e) => {
        console.log('ERR::::', e);
      });
  });
}

export function execInGuestFs(command) {
  return new Promise((resolve) => {
    console.log('execInGuestFs', command);
    window.electron
      .invoke('exec-in-guestfs', command)
      .then((result) => {
        console.log('exec-in-guestfs result::', result);
        resolve(result);
        return result;
      })
      .catch((e) => {
        console.log('ERR::::', e);
      });
  });
}

export function searchInGuestFs(command) {
  return new Promise((resolve) => {
    console.log('execInGuestFs', command);
    window.electron
      .invoke('search-in-guestfs', command)
      .then((result) => {
        console.log('search-in-guestfs', result);
        resolve(result);
        return result;
      })
      .catch((e) => {
        console.log('ERR::::', e);
      });
  });
}

export function getVolumes() {
  return new Promise((resolve) => {
    console.log('window.electron get-volumes');
    window.electron.invoke('get-volumes')
      .then((result) => {
        console.log('get-volumes result', result);
        resolve(result);
        return true;
      })
      .catch((e) => {
        console.log('ERR::::', e);
      });
    // window.electron
    //   .invoke('get-volumes')
    //   .then((result) => {
    //     console.log('get-volumes result', result);
    //     resolve(result);
    //     return true;
    //   })
    //   .catch((e) => {
    //     console.log('ERR::::', e);
    //   });
  });
}

export function importLayer(patch) {
  return new Promise((resolve) => {
    console.log('window.electron import-layer', patch);
    window.electron
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
    window.electron
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
    window.electron
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
