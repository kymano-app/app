import { useLayoutEffect } from 'react';
import { useSearchResults } from './Context/SearchResultsContext';

// const electron = window.require('electron');
// const { ipcRenderer } = electron;

export default function InitUpdate() {
  const searchResults = useSearchResults();

  useLayoutEffect(() => {
    console.log('useLayoutEffect');
    window.electron.ipcRenderer.on('response-cmd', (response) => {
      searchResults.set(response);
    });
  }, []);

  return <></>;
}
