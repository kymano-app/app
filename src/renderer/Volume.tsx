import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import DangerousIcon from '@mui/icons-material/Dangerous';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { Skeleton } from '@mui/material';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import { visuallyHidden } from '@mui/utils';
import { ip, pushGuestFsQueue } from 'main/global';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import useFetch from './dataSource/useFetch';
import SearchBox from './SearchBox';

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
    id: 'mtime',
    numeric: true,
    label: 'Created',
  },
  {
    id: 'size',
    numeric: true,
    label: 'Size',
  },
];

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    property = property === 'mtime' ? 'unixtime' : property;
    console.log(event, property);
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
  const [orderBy, setOrderBy] = useState('name');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data, loading, error } = useFetch();

  const handleRequestSort = (event, property) => {
    console.log('event', event);
    console.log('property', property);
    console.log('orderBy', orderBy);
    console.log('order', order);
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleClick = (event, name, type) => {
    if (type === 'other') {
      return;
    }
    console.log(name);
    navigate(`/volume?hash=${searchParams.get('hash')}/${name}`, {
      replace: true,
    });
  };

  const handleBack = () => {
    const url = searchParams.get('hash');
    const urlSplited = url!.split('/').slice(0, -1);
    let navigateTo;
    if (urlSplited.length > 0) {
      navigateTo = urlSplited.join('/');
      navigate(`/volume?hash=${navigateTo}`, {
        replace: true,
      });
    } else {
      navigate(`/volumes`, {
        replace: true,
      });
    }
  };

  useEffect(() => {
    if (!ip) {
      pushGuestFsQueue({
        name: 'getIp',
      });
    }
  }, []);

  useEffect(() => {
    console.log('searchParams', searchParams.get('hash'));
    async function runAsync() {
      const page = searchParams.get('hash');
      let handler = 'addNewDiskToGuestFs';
      if (page?.includes('-')) {
        handler = 'addNewVmDriveToGuestFs';
      }
      console.log(handler, searchParams.get('hash'));
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

  return (
    <Box
      sx={{
        width: 'calc(100% - 48px)',
        marginLeft: '48px',
      }}
    >
      {loading && (
        <Stack spacing={1}>
          <Skeleton variant="text" height={50} />
          <Skeleton variant="text" height={50} />
          <Skeleton variant="text" height={50} />
          <Skeleton variant="text" height={50} />
        </Stack>
      )}
      {data && (
        <>
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
                rowCount={data.length}
              />
              <TableBody>
                {data.sort(getComparator(order, orderBy)).map((row, index) => {
                  return (
                    <TableRow
                      hover
                      onClick={(event) =>
                        handleClick(event, row.name, row.type)
                      }
                      tabIndex={-1}
                      key={row.name}
                      style={{ cursor: 'pointer' }}
                    >
                      <TableCell component="th" scope="row" padding="normal">
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                          }}
                        >
                          {row.type === 'directory' && <FolderIcon />}
                          {row.type === 'other' && <DangerousIcon />}
                          {row.type === 'file' && <InsertDriveFileIcon />}
                          <span style={{ marginLeft: 10 }}>{row.name}</span>
                        </div>
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
        </>
      )}
    </Box>
  );
}
