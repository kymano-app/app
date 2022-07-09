import { createTheme, ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AddNewDiskToGuestFsProvider } from './Context/AddNewDiskToGuestFs';
import { FileUploadProgressBarProvider } from './Context/FileUploadProgressBarContext';
import { LaunchingVmProcessProvider } from './Context/LaunchingVmProcessContext';
import { SearchResultsProvider } from './Context/SearchResultsContext';
import InitUpdate from './InitUpdate';
import LeftMenu from './LeftMenu';
import Main from './Main';
import Repos from './Repos';
import SearchFiles from './SearchFiles';
import SearchText from './SearchText';
import Volume from './Volume';
import Volumes from './Volumes';

const theme = createTheme({
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <SearchResultsProvider>
        <LaunchingVmProcessProvider>
          <FileUploadProgressBarProvider>
            <AddNewDiskToGuestFsProvider>
              <BrowserRouter>
                <CssBaseline />
                <InitUpdate />
                <LeftMenu />

                <Routes>
                  <Route path="volumes" element={<Volumes />} />
                  <Route path="volume" element={<Volume />} />
                  <Route path="searchFiles" element={<SearchFiles />} />
                  <Route path="searchText" element={<SearchText />} />
                  <Route path="repos" element={<Repos />} />
                  <Route path="/index.html" element={<Main />} />
                </Routes>
              </BrowserRouter>
            </AddNewDiskToGuestFsProvider>
          </FileUploadProgressBarProvider>
        </LaunchingVmProcessProvider>
      </SearchResultsProvider>
    </ThemeProvider>
  );
}
