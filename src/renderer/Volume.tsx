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
import * as React from 'react';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
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
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [searchParams, setSearchParams] = useSearchParams();
  const [rows, setRows] = React.useState([]);
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

  React.useEffect(() => {
    async function fetchData() {
      try {
        console.log(searchParams.get('hash'));
        const res = await fetch(
          `http://192.168.66.2/${searchParams.get('hash')}`
        );
        console.log('Status Code:', res.status);
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
        console.log(err.message);
      }
    }
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
