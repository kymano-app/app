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

export function addNewDiskToGuestFs(vmDisk) {
  return new Promise((resolve) => {
    console.log('addNewDiskToGuestFs', vmDisk);
    window.electron
      .invoke('add-new-disk-to-guestfs', vmDisk)
      .then((result) => {
        console.log('add-new-disk-to-guestfs', result);
        resolve(result);
        return result;
      })
      .catch((e) => {
        console.log('ERR::::', e);
      });
  });
}

export function addNewVmDriveToGuestFs(vmDisk) {
  return new Promise((resolve) => {
    console.log('addImportLayerToGuestFs', vmDisk);
    window.electron
      .invoke('add-new-vm-drive-to-guestfs', vmDisk)
      .then((result) => {
        console.log('add-new-vm-drive-to-guestfs', result);
        resolve(result);
        return result;
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

export function createVm(configId) {
  return new Promise((resolve) => {
    console.log('window.electron create-vm', configId);
    window.electron
      .invoke('create-vm', configId)
      .then((result) => {
        console.log('create-vm result', result);
        resolve(result);
        return true;
      })
      .catch((e) => {
        console.log('ERR::::', e);
      });
  });
}

export function runVm(vmNameId) {
  return new Promise((resolve) => {
    console.log('window.electron run-vm');
    window.electron
      .invoke('run-vm', vmNameId)
      .then((result) => {
        console.log('run-vm result', result);
        resolve(result);
        return true;
      })
      .catch((e) => {
        console.log('ERR::::', e);
      });
  });
}

export function getMyVmDisks() {
  return new Promise((resolve) => {
    console.log('window.electron getMyVmDisks');
    window.electron
      .invoke('get-my-vm-disks')
      .then((result) => {
        console.log('get-my-vm-disks result', result);
        resolve(result);
        return true;
      })
      .catch((e) => {
        console.log('ERR::::', e);
      });
  });
}
export function getMyDisks() {
  return new Promise((resolve) => {
    console.log('window.electron getMyDisks');
    window.electron
      .invoke('get-my-disks')
      .then((result) => {
        console.log('get-my-disks result', result);
        resolve(result);
        return true;
      })
      .catch((e) => {
        console.log('ERR::::', e);
      });
  });
}

export function getConfigList() {
  return new Promise((resolve) => {
    console.log('window.electron get-config-list');
    window.electron
      .invoke('get-config-list')
      .then((result) => {
        console.log('get-config-list result', result);
        resolve(result);
        return true;
      })
      .catch((e) => {
        console.log('ERR::::', e);
      });
  });
}

export function getMyVms() {
  return new Promise((resolve) => {
    console.log('window.electron get-my-vms');
    window.electron
      .invoke('get-my-vms')
      .then((result) => {
        console.log('get-my-vms result', result);
        resolve(result);
        return true;
      })
      .catch((e) => {
        console.log('ERR::::', e);
      });
  });
}

export function delDisks() {
  return new Promise((resolve) => {
    console.log('del-disks');
    window.electron
      .invoke('del-disks')
      .then((result) => {
        console.log('del-disks result', result);
        resolve(result);
        return true;
      })
      .catch((e) => {
        console.log('ERR::::', e);
      });
  });
}

export function importDisk(tmpPath, name) {
  return new Promise((resolve) => {
    console.log('window.electron import-disk', tmpPath, name);
    window.electron
      .invoke('import-disk', tmpPath, name)
      .then((result) => {
        console.log('import-disk result', result);
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
