import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';
import { visuallyHidden } from '@mui/utils';
import * as React from 'react';
import { useNavigate } from 'react-router';
import { useFileUploadProgressBar } from './Context/FileUploadProgressBarContext';
import { MyDropzone } from './MyDropzone';
import { getVolumes } from './renderer';

function createData(name, calories, fat, carbs, protein) {
  return {
    name,
    calories,
    fat,
  };
}

// const rows = [
//   createData('Cupcake', 5555, 343),
//   createData('Donut', 54545, 254),
//   createData('Eclair', 3, 165),
// ];

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
    <Box style={{ display: 'flex', flexDirection: 'row' }}>
      {headCells.map((headCell) => (
        <Box
          key={headCell.id}
          sortDirection={orderBy === headCell.id ? order : false}
          style={{ flexGrow: headCell.id == 'name' ? 1 : 0 }}
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
        </Box>
      ))}
    </Box>
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
  const [rows, setRows] = React.useState([]);
  const fileUploadProgressBar = useFileUploadProgressBar();
  const navigate = useNavigate();

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  React.useEffect(() => {
    async function fetchData() {
      const volumes0 = await getVolumes();
      console.log('volumes0', volumes0);
      let volumes = [];
      if (volumes0) {
        volumes = volumes0.map((volume) => {
          return { name: volume.hash, time: 0, size: 0 };
        });
      }
      console.log('volumes', volumes);

      setRows(volumes);
    }
    fetchData();
  }, []);

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

  const handleClick = (event, hash) => {
    console.log('handleClick', hash);
    hash = hash.slice(0, 33);
    navigate(`/volume?hash=${hash}`, { replace: true });
  };

  const updateVolumesList = (hash: string) => {
    console.log('gotoSingleVolume', hash);
    navigate(`/volumes`, { replace: true });
  };

  console.log('progress', progress);

  return (
    <Box
      sx={{
        width: 'calc(100% - 48px)',
        marginLeft: '48px',
      }}
    >
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
          <Box
            style={{
              overflow: 'auto',
              bottom: 130,
              position: 'fixed',
              top: 60,
              width: 'calc(100% - 48px)',
            }}
          >
            {progress > 0 && progress < 100 && (
              <Box key="name" style={{ display: 'flex', flexDirection: 'row' }}>
                <Box>
                  Name
                  <Box>
                    <LinearProgressWithLabel value={progress} />
                  </Box>
                </Box>
              </Box>
            )}

            {rows.sort(getComparator(order, orderBy)).map((row, index) => {
              return (
                <Box
                  onClick={(event) => handleClick(event, row.name)}
                  key={row.name}
                  style={{
                    cursor: 'pointer',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                  }}
                >
                  <Box padding="normal" style={{ padding: 12, flexGrow: 1 }}>
                    {row.name}
                  </Box>
                  <Box padding="normal" align="left" style={{ padding: 12 }}>
                    {row.time}
                  </Box>
                  <Box padding="normal" align="left" style={{ padding: 12 }}>
                    {row.size}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Table>
      </TableContainer>
      <MyDropzone updateVolumesList={updateVolumesList} />
    </Box>
  );
}
