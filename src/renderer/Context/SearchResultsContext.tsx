import React, { useContext, useState } from 'react';

const SearchResultsContext = React.createContext();

export const useSearchResults = () => {
  return useContext(SearchResultsContext);
};

export const SearchResultsProvider = ({ children }) => {
  const [results, setResults] = useState();

  const set = (result) => setResults(result);

  return (
    <SearchResultsContext.Provider value={{ results, set }}>
      {children}
    </SearchResultsContext.Provider>
  );
};
