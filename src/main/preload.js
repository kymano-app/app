const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  async invoke(channel, ...params) {
    const validChannels = [
      'save-file',
      'is-gustfs-running',
      'get-my-disks',
      'get-my-vm-disks',
      'get-config-list',
      'import-disk',
      'add-imported-layer-to-guestfs',
      'add-new-vm-drive-to-guestfs',
      'add-new-disk-to-guestfs',
      'exec-in-guestfs',
      'search-in-guestfs',
      'run-guestfs',
      'create-vm',
      'run-vm',
      'update-configs',
      'get-my-vms',
      'del-disks',
    ];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...params);
    }
  },
  store: {
    get(val) {
      ipcRenderer.send('electron-store-get', val);
    },
    set(property, val) {
      ipcRenderer.send('electron-store-set', property, val);
    },
    // Other method you want to add like has(), reset(), etc.
  },
  // Any other methods you want to expose in the window object.
  // ...
  ipcRenderer: {
    myPing() {
      ipcRenderer.send('ipc-example', 'ping');
    },
    on(channel, func) {
      const validChannels = ['ipc-example', 'response-cmd'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    handle(channel, func) {
      const validChannels = ['ipc-example', 'response-cmd'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.handle(channel, (event, ...args) => func(...args));
      }
    },
    once(channel, func) {
      const validChannels = ['ipc-example'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (event, ...args) => func(...args));
      }
    },
  },
});
