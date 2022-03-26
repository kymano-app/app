import React, { useContext, useState } from 'react';

const FileUploadProgressBarContext = React.createContext();

export const useFileUploadProgressBar = () => {
  return useContext(FileUploadProgressBarContext);
};

export const FileUploadProgressBarProvider = ({ children }) => {
  const [progress, setProgress] = useState(0);
  const [totalFileSize, setTotalSize] = useState(0);

  const set = (progress_: number) => setProgress(progress_);
  const setTotalFileSize = (size: number) => setTotalSize(size);

  return (
    <FileUploadProgressBarContext.Provider
      value={{ progress, totalFileSize, set, setTotalFileSize }}
    >
      {children}
    </FileUploadProgressBarContext.Provider>
  );
};
