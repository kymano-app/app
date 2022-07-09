import React, { useContext, useState } from 'react';

const LaunchingVmProcessContext = React.createContext();

export const useLaunchingVmProcess = () => {
  return useContext(LaunchingVmProcessContext);
};

export const LaunchingVmProcessProvider = ({ children }) => {
  const [results, setResults] = useState();

  const set = (result) => setResults(result);

  return (
    <LaunchingVmProcessContext.Provider value={{ results, set }}>
      {children}
    </LaunchingVmProcessContext.Provider>
  );
};
