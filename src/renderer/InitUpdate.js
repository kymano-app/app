import {
  ip,
  pushGuestFsQueue,
  setIp,
  shiftGuestFsQueue,
  shiftGuestFsQueue2,
} from 'main/global';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { useAddNewDiskToGuestFs } from './Context/AddNewDiskToGuestFs';
import { useSearchResults } from './Context/SearchResultsContext';
import {
  addNewDiskToGuestFs,
  addNewVmDriveToGuestFs,
  delDisks,
  execInGuestFs,
  searchInGuestFs,
} from './renderer';

// const electron = window.require('electron');
// const { ipcRenderer } = electron;

export default function InitUpdate() {
  const searchResults = useSearchResults();
  const location = useLocation();
  const prevLocation = useRef();
  const addNewDiskToGuestFsUpdater = useAddNewDiskToGuestFs();

  const leavingVolume = (prevLocation, location) => {
    return (
      prevLocation.current.pathname === '/volume' &&
      location.pathname !== '/volume' &&
      location.pathname !== '/searchFiles' &&
      location.pathname !== '/searchText'
    );
  };
  const leavingSearch = (prevLocation, location) => {
    return (
      (prevLocation.current.pathname === '/searchFiles' ||
        prevLocation.current.pathname === '/searchText') &&
      location.pathname !== '/volume' &&
      location.pathname !== '/searchFiles' &&
      location.pathname !== '/searchText'
    );
  };
  useEffect(() => {
    async function runAsync() {
      if (
        prevLocation.current &&
        (leavingVolume(prevLocation, location) ||
          leavingSearch(prevLocation, location))
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
      console.log('searchResults.set(response)', response);
      searchResults.set(response);
    });
  }, []);

  useEffect(() => {
    console.log('async function loop::::::');
    (async function loop() {
      setTimeout(async function () {
        const command = shiftGuestFsQueue();
        console.log('command::::::', command, ip);
        if (command && command.name === 'addNewVmDriveToGuestFs') {
          await addNewVmDriveToGuestFs(command.param);
          await new Promise((resolve) => setTimeout(resolve, 1 * 1000));
          const result = await execInGuestFs('/bin/guestfs');
          console.log('result::::::', result);
        }
        if (command && command.name === 'unmount') {
          console.log('Unmount all');
          await execInGuestFs('kill `pidof ack` 2>/dev/null', 'worker2');
          await execInGuestFs('kill `pidof find` 2>/dev/null', 'worker2');
          await execInGuestFs('/bin/unmount 2>/dev/null');
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
        if (command && command.name === 'getIp') {
          const resultIp = await execInGuestFs(
            `/sbin/ifconfig eth0 | grep 'inet addr' | cut -d: -f2 | awk '{printf( "%s%c", $1, 0)}'`
          );
          console.log('resultIp::::::', resultIp);
          if (resultIp && resultIp[0].length < 7) {
            setIp(resultIp[1]);
          } else {
            setIp(resultIp[0]);
          }
        }
        loop();
      }, 1000);
    })();

    (async function loop2() {
      setTimeout(async function () {
        const command = shiftGuestFsQueue2();
        console.log('command2::::::', command, ip);
        if (command && command.name === 'searchFileInGuestFs') {
          // find / -type f -name *.txt -exec ls -l {} \;
          await searchInGuestFs(
            `find /mnt/kymano -type f -name "${command.param}" | xargs ls -l "$1" | awk '{printf "%s:kymano:%s%c", $9, $1, 0}'`,
            'worker1'
          );
        }
        if (command && command.name === 'searchTextInGuestFs') {
          await searchInGuestFs(
            `ack --print0 "${command.param}" /mnt/kymano -m 3`,
            'worker1'
          );
        }
        loop2();
      }, 1000);
    })();
  }, []);

  return <></>;
}
