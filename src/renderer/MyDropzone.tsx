import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { pushGuestFsQueue } from 'main/global';
import { useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { useNavigate } from 'react-router-dom';
import { useFileUploadProgressBar } from './Context/FileUploadProgressBarContext';
import {
  importDisk,
  sendFile
} from './renderer';
import { upload } from './upload';

// const electron = window.require('electron');
// const { ipcRenderer } = electron;

// ipcRenderer.on('response-cmd', (event, response) => {
// console.log('response:', response);
// });

// const fetch = require('node-fetch');

// https://kovart.github.io/dashed-border-generator/
const dashedBorder =
  "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='%23E3E3E3FF' stroke-width='4' stroke-dasharray='4%2c6' stroke-dashoffset='0' stroke-linecap='butt'/%3e%3c/svg%3e\")";

export function MyDropzone({ updateVolumesList }) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const navigate = useNavigate();
  const fileUploadProgressBar = useFileUploadProgressBar();

  const setProgress = (progress: any) => {
    fileUploadProgressBar.set(progress);
  };

  const handleChange = async (file: File) => {
    fileUploadProgressBar.setTotalFileSize(file.size);

    const tmpPath = await upload(file, sendFile, setProgress);
    console.log('tmpPath', tmpPath);

    const userLayersDiskPath = await importDisk(tmpPath, file.name);
    console.log('userLayersDiskPath', userLayersDiskPath);

    const userLayersDiskPathSplitted = userLayersDiskPath.split('/');
    const diskId =
      userLayersDiskPathSplitted[userLayersDiskPathSplitted.length - 1];
    console.log('diskId', diskId);
    // const gustfsRunning = await isGustFsRunning();
    // if (!gustfsRunning) {
    //   console.log('gustfsRunning', gustfsRunning);
    //   await runGuestFs();
    // }

    pushGuestFsQueue({
      name: 'addNewDiskToGuestFs',
      param: diskId,
    });
    // const added = await addImportLayerToGuestFs(userLayersDiskPath);
    // console.log('added', added);
    // if (added) {
    //   console.log('userLayersDiskPath', userLayersDiskPath);
    //   const hash = userLayersDiskPath.match(/([\w]+)$/)[1];
    //   await execInGuestFs('/bin/guestfs');
    //   updateVolumesList(hash.slice(0, 33));
    // }
    // showFileExplorer()
  };

  // const memoizedCallback = useCallback(
  //   () => {
  //     doSomething(a, b);
  //   },
  //   [a, b],
  // );

  const onDraggingStateChange = (dragging: boolean) => {
    console.log('FileUploader onDraggingStateChange:', dragging);
    setIsDragging(dragging);
  };

  const onSelect = (e: any) => {
    console.log('FileUploader onSelect:', e);
  };

  const onDrop = async (e: any) => {
    console.log('FileUploader onDrop:', e);
    // history.push('/guestfs');
    navigate('/volumes', { replace: true });
  };

  // https://dribbble.com/shots/4541690-File-Upload-Component/attachments/10455025?mode=media

  return (
    <Box
      style={{
        position: 'fixed',
        bottom: 0,
        left: 48,
        width: 'calc(100% - 48px)',
        padding: 10,
        backgroundColor: 'white',
      }}
    >
      <FileUploader
        handleChange={handleChange}
        name="file"
        onDraggingStateChange={onDraggingStateChange}
        onSelect={onSelect}
        onDrop={onDrop}
        hoverTitle=" "
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          sx={{
            width: '100%',
            height: 120,
            backgroundImage: dashedBorder,
            p: 2,
          }}
        >
          <CloudUploadIcon
            display="flex"
            fontSize="inherit"
            style={{ fontSize: '36px', marginBottom: 13 }}
          />

          {!isDragging && (
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
            >
              <Typography variant="body1" display="flex">
                Drag and drop Parallels, Virtualbox, VmWare disks
              </Typography>

              <Typography variant="body2" display="flex">
                It`s safe, original files will not be modified
              </Typography>
            </Box>
          )}
          {isDragging && <Typography>Drop here</Typography>}
        </Box>
      </FileUploader>
    </Box>
  );
}
