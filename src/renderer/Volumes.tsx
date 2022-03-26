import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';
import { visuallyHidden } from '@mui/utils';
import * as React from 'react';
import { useFileUploadProgressBar } from './Context/FileUploadProgressBarContext';
import { MyDropzone } from './MyDropzone';

function createData(name, calories, fat, carbs, protein) {
  return {
    name,
    calories,
    fat,
  };
}

const rows = [
  createData('Cupcake', 5555, 343),
  createData('Donut', 54545, 254),
  createData('Eclair', 3, 165),
];

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

function LinearProgressWithLabel(props) {
  console.log(props);
  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}
    >
      <Box sx={{ width: '100%', m: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

export default function Volumes() {
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [progress, setProgress] = React.useState(0);
  const fileUploadProgressBar = useFileUploadProgressBar();

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  React.useEffect(() => {
    if (
      !fileUploadProgressBar.progress ||
      !fileUploadProgressBar.totalFileSize
    ) {
      return;
    }
    setProgress(
      (fileUploadProgressBar.progress / fileUploadProgressBar.totalFileSize) *
        100
    );
  }, [fileUploadProgressBar]);

  const handleClick = (event, name) => {};

  return (
    <Box sx={{ width: 'calc(100%-48px)', marginLeft: '48px' }}>
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
            <TableRow
              hover
              tabIndex={-1}
              key="name"
              style={{ cursor: 'pointer' }}
            >
              <TableCell
                component="th"
                scope="row"
                padding="normal"
                colSpan={3}
              >
                Name
                <Box sx={{ width: '100%' }}>
                  <LinearProgressWithLabel value={progress} />
                </Box>
              </TableCell>
            </TableRow>

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
                    {row.calories}
                  </TableCell>
                  <TableCell padding="normal" align="left">
                    {row.fat}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <MyDropzone />
    </Box>
  );
}
