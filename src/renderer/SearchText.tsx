import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import { pushGuestFsQueue2 } from 'main/global';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { useSearchResults } from './Context/SearchResultsContext';

export default function SearchText() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [searchValue, setSearchValue] = useState();
  const navigate = useNavigate();
  const searchResults = useSearchResults();
  const prevFile = useRef();
  const searchTextResults = useRef([]);

  const handleDownload = async (event, name) => {
    const pathName = name.split('/').splice(3).join('/');
    console.log(pathName);
    const res = await fetch(`http://192.168.66.2/${pathName}`);
    const fileName = pathName.split('/').slice(-1).join('/');
    console.log('fileName', fileName);
    const blob = await res.blob();
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  const handleBack = () => {
    const url = searchParams.get('query');
    navigate(`/searchText?query=${url!.split('/').slice(0, -1).join('/')}`, {
      replace: true,
    });
  };

  useEffect(() => {
    console.log('query', searchParams.get('query'));
    setSearchValue(searchParams.get('query'));
  }, [searchParams]);

  useEffect(() => {
    console.log('searchResults', searchResults.results);
    if (!searchResults.results) {
      return;
    }

    const splitted = searchResults.results.split(':');
    console.log('splitted', splitted);
    if (
      !/end[\d+]/.test(searchResults.results) &&
      prevFile.current !== splitted[0]
    ) {
      console.log('FILE:', prevFile.current, searchTextResults.current);
      setRows((prev) => [
        ...prev,
        { name: prevFile.current, searchResults: searchTextResults.current },
      ]);
      searchTextResults.current = [];
    }
    if (!/end[\d+]/.test(searchResults.results)) {
      prevFile.current = splitted[0];
      searchTextResults.current.push(splitted);
    }
  }, [searchResults]);

  useEffect(() => {
    if (!searchValue) return;

    console.log('searchValue', searchValue);
    pushGuestFsQueue2({
      name: 'searchTextInGuestFs',
      param: searchValue,
    });
  }, [searchValue]);

  return (
    <Box sx={{ width: 'calc(100%-48px)', marginLeft: '48px' }}>
      <Box>
        <ArrowBackIosNewIcon onClick={() => handleBack()} />
      </Box>
      <TableContainer>
        <Table
          sx={{ minWidth: 750 }}
          aria-labelledby="tableTitle"
          size="medium"
        >
          <TableBody>
            {rows.map((row, index) => {
              return (
                <TableRow
                  hover
                  onClick={(event) => handleDownload(event, row.name)}
                  tabIndex={-1}
                  key={index}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell component="th" scope="row" padding="normal">
                    {row.name !== undefined &&
                      row.name.split('/').splice(4).join('/')}
                    {row.searchResults.length > 0 &&
                      row.searchResults.map((elem) => (
                        <div>
                          {elem[1]}:{elem.slice(2).join('')}
                        </div>
                      ))}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
