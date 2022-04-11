import { pushGuestFsQueue, shiftGuestFsQueue } from 'main/global';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { useAddNewDiskToGuestFs } from './Context/AddNewDiskToGuestFs';
import { useSearchResults } from './Context/SearchResultsContext';
import {
  addNewDiskToGuestFs,
  addNewVmDriveToGuestFs,
  delDisks,
  execInGuestFs,
} from './renderer';

// const electron = window.require('electron');
// const { ipcRenderer } = electron;

export default function InitUpdate() {
  const searchResults = useSearchResults();
  const location = useLocation();
  const prevLocation = useRef();
  const addNewDiskToGuestFsUpdater = useAddNewDiskToGuestFs();

  useEffect(() => {
    async function runAsync() {
      if (
        prevLocation.current &&
        prevLocation.current.pathname === '/volume' &&
        location.pathname !== '/volume'
      ) {
        pushGuestFsQueue({ name: 'unmount' });
      }
      console.log('Location changed', location, prevLocation.current);
      prevLocation.current = location;
    }
    runAsync();
  }, [location]);

  useLayoutEffect(() => {
    console.log('useLayoutEffect');
    window.electron.ipcRenderer.on('response-cmd', (response) => {
      searchResults.set(response);
    });
  }, []);

  useEffect(() => {
    (async function loop() {
      setTimeout(async function () {
        const command = shiftGuestFsQueue();
        if (command && command.name === 'addNewVmDriveToGuestFs') {
          await addNewVmDriveToGuestFs(command.param);
          await new Promise((resolve) => setTimeout(resolve, 1 * 1000));
          const result = await execInGuestFs('/bin/guestfs');
          console.log('result::::::', result);
        }
        if (command && command.name === 'unmount') {
          console.log('Unmount all');
          const result = await execInGuestFs('/bin/unmount');
          console.log('result:::::', result);
          const result2 = await delDisks();
          console.log('result2:::::', result2);
        }
        if (command && command.name === 'addNewDiskToGuestFs') {
          await addNewDiskToGuestFs(command.param);
          await new Promise((resolve) => setTimeout(resolve, 1 * 1000));
          const result = await execInGuestFs('/bin/guestfs');
          console.log('result::::::', result);
          addNewDiskToGuestFsUpdater.set();
        }

        console.log('command::::::', command);
        loop();
      }, 200);
    })();
  }, []);

  return <></>;
}
