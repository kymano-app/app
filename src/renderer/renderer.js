const electron = window.require('electron');
const { ipcRenderer } = electron;

export default function send(message) {
  return new Promise((resolve) => {
    // ipcRenderer.once('electron-store-set', (_, arg) => {
    //   resolve(arg);
    // });
    // ipcRenderer.send('electron-store-set', message);
    ipcRenderer
      .invoke('electron-store-set', message)
      .then((result) => {
        // console.log('result::::', result);
        resolve(result);
        return true;
      })
      .catch(() => {
        console.log('ERR::::');
      });
  });
}
