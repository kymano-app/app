import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import { visuallyHidden } from '@mui/utils';
import { pushGuestFsQueue } from 'main/global';
import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import SearchBox from './SearchBox';

type Delay = number | null;
type TimerHandler = (...args: any[]) => void;
const useInterval = (callback: TimerHandler, delay: Delay) => {
  const savedCallbackRef = useRef<TimerHandler>();

  useEffect(() => {
    savedCallbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = (...args: any[]) => savedCallbackRef.current!(...args);

    if (delay !== null) {
      const intervalId = setInterval(handler, delay);
      return () => clearInterval(intervalId);
    }
  }, [delay]);
};

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const headCells = [
  {
    id: 'name',
    numeric: false,
    label: 'Name',
  },
  {
    id: 'calories',
    numeric: true,
    label: 'Created',
  },
  {
    id: 'fat',
    numeric: true,
    label: 'Size',
  },
];

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align="left"
            padding="normal"
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default function Volume() {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('calories');
  const [searchParams, setSearchParams] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [loopSleepTime, setLoopSleepTime] = useState(1000);
  const navigate = useNavigate();

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleClick = (event, name) => {
    console.log(name);
    navigate(`/volume?hash=${searchParams.get('hash')}/${name}`, {
      replace: true,
    });
  };

  const handleBack = () => {
    const url = searchParams.get('hash');
    navigate(`/volume?hash=${url!.split('/').slice(0, -1).join('/')}`, {
      replace: true,
    });
  };

  async function fetchData() {
    try {
      console.log(searchParams.get('hash'));
      const res = await fetch(
        `http://192.168.66.2/${searchParams.get('hash')}`
      );
      console.log('fetchData Status Code:', res.status);
      if (res.status !== 200) {
        return;
      }
      const contentType = res.headers.get('Content-Type');
      if (contentType === 'application/json') {
        const jsonData = await res.json();
        setRows(jsonData);
        console.log(jsonData);
      } else {
        const fileName = searchParams
          .get('hash')!
          .split('/')
          .slice(-1)
          .join('/');
        console.log('fileName', fileName);
        const blob = await res.blob();
        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);

        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();

        // Clean up and remove the link
        link.parentNode.removeChild(link);

        navigate(
          `/volume?hash=${searchParams
            .get('hash')!
            .split('/')
            .slice(0, -1)
            .join('/')}`,
          {
            replace: true,
          }
        );
      }
      // }
    } catch (err) {
      console.log('err:::::::', err.message);
    }
  }

  async function fetchData0() {
    console.log(searchParams.get('hash'));
    let res;
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 1000);
      res = await fetch(`http://192.168.66.2/${searchParams.get('hash')}`, {
        signal: controller.signal,
      });
      if (res.status !== 200) {
        await new Promise((resolve) => setTimeout(resolve, 1 * 1000));
        return;
      }
      console.log('Status Code:', res.status);
      setLoopSleepTime(null);
      const jsonData = await res.json();
      setRows(jsonData);
      console.log(jsonData);
    } catch (err) {
      console.log('err:::::::', err.message);
      await new Promise((resolve) => setTimeout(resolve, 1 * 1000));
    }
  }

  const fetchData1 = useCallback(() => {
    fetchData0(searchParams);
  }, [searchParams]);

  useInterval(() => {
    console.log('setCount');
    fetchData1();
  }, loopSleepTime);

  useEffect(() => {
    console.log('searchParams', searchParams.get('hash'));
    async function runAsync() {
      const page = searchParams.get('hash');
      let handler = 'addNewDiskToGuestFs';
      if (page?.includes('-')) {
        handler = 'addNewVmDriveToGuestFs';
      }
      pushGuestFsQueue({
        name: handler,
        param: searchParams.get('hash'),
      });
      // await addNewVmDriveToGuestFs(searchParams.get('hash'));
      // await new Promise((resolve) => setTimeout(resolve, 1 * 1000));
      // const result = await execInGuestFs('/bin/guestfs');
      // console.log('result::::::', result);
      // fetchData();
    }
    runAsync();
  }, []);

  useEffect(() => {
    fetchData();
  }, [searchParams]);

  return (
    <Box
      sx={{
        width: 'calc(100% - 48px)',
        marginLeft: '48px',
      }}
    >
      <Box>
        <ArrowBackIosNewIcon onClick={() => handleBack()} />
        <SearchBox />
      </Box>
      <TableContainer>
        <Table
          sx={{ minWidth: 750 }}
          aria-labelledby="tableTitle"
          size="medium"
        >
          <EnhancedTableHead
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            rowCount={rows.length}
          />
          <TableBody>
            {rows.sort(getComparator(order, orderBy)).map((row, index) => {
              return (
                <TableRow
                  hover
                  onClick={(event) => handleClick(event, row.name)}
                  tabIndex={-1}
                  key={row.name}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell component="th" scope="row" padding="normal">
                    {row.name}
                  </TableCell>
                  <TableCell padding="normal" align="left">
                    {row.mtime}
                  </TableCell>
                  <TableCell padding="normal" align="left">
                    {row.size}
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
