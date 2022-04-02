import { createTheme, ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { FileUploadProgressBarProvider } from './Context/FileUploadProgressBarContext';
import { SearchResultsProvider } from './Context/SearchResultsContext';
import InitUpdate from './InitUpdate';
import LeftMenu from './LeftMenu';
import Main from './Main';
import Search from './Search';
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
        <FileUploadProgressBarProvider>
          <BrowserRouter>
            <CssBaseline />
            <InitUpdate />
            <LeftMenu />

            <Routes>
              <Route path="volumes" element={<Volumes />} />
              <Route path="volume" element={<Volume />} />
              <Route path="search" element={<Search />} />
              <Route path="/index.html" element={<Main />} />
            </Routes>
          </BrowserRouter>
        </FileUploadProgressBarProvider>
      </SearchResultsProvider>
    </ThemeProvider>
  );
}
