import { createTheme, ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { FileUploadProgressBarProvider } from './Context/FileUploadProgressBarContext';
import Volumes from './Volumes';
import LeftMenu from './LeftMenu';
import Main from './Main';

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
      <FileUploadProgressBarProvider>
        <BrowserRouter>
          <CssBaseline />
          <LeftMenu />

          <Routes>
            <Route path="guestfs" element={<Volumes />} />
            <Route path="/index.html" element={<Main />} />
          </Routes>
        </BrowserRouter>
      </FileUploadProgressBarProvider>
    </ThemeProvider>
  );
}
