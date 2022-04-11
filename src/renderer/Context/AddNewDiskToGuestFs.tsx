import { createContext, useContext, useState } from 'react';

const AddNewDiskToGuestFsContext = createContext();

export const useAddNewDiskToGuestFs = () => {
  return useContext(AddNewDiskToGuestFsContext);
};

export const AddNewDiskToGuestFsProvider = ({ children }) => {
  const [updated, setUpdated] = useState({});

  const set = () => setUpdated({ updated: true });

  return (
    <AddNewDiskToGuestFsContext.Provider value={{ set, updated }}>
      {children}
    </AddNewDiskToGuestFsContext.Provider>
  );
};
