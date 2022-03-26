import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { useNavigate } from 'react-router-dom';
import { useFileUploadProgressBar } from './Context/FileUploadProgressBarContext';
import { addImportLayerToGuestFs, importLayer, isGustFsRunning, runGuestFs, sendFile } from './renderer';
import { upload } from './upload';

// https://kovart.github.io/dashed-border-generator/
const dashedBorder =
  "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='%23E3E3E3FF' stroke-width='4' stroke-dasharray='4%2c6' stroke-dashoffset='0' stroke-linecap='butt'/%3e%3c/svg%3e\")";

export function MyDropzone() {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const navigate = useNavigate();
  const fileUploadProgressBar = useFileUploadProgressBar();

  const setProgress = (progress: any) => {
    fileUploadProgressBar.set(progress);
  };

  const handleChange = async (file: File) => {
    fileUploadProgressBar.setTotalFileSize(file.size);

    const fileName = await upload(file, sendFile, setProgress);
    console.log('fileName', fileName);

    const layerPath = await importLayer(fileName);
    console.log('layerPath', layerPath);

    const gustfsRunning = await isGustFsRunning();
    if (!gustfsRunning) {
      console.log('gustfsRunning', gustfsRunning);
      await runGuestFs();
    }

    await addImportLayerToGuestFs(layerPath);
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
    navigate('/guestfs', { replace: true });
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
