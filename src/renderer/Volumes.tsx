import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';
import { visuallyHidden } from '@mui/utils';
import * as React from 'react';
import { useNavigate } from 'react-router';
import { useAddNewDiskToGuestFs } from './Context/AddNewDiskToGuestFs';
import { useFileUploadProgressBar } from './Context/FileUploadProgressBarContext';
import { MyDropzone } from './MyDropzone';
import { getMyDisks, getMyVmDisks } from './renderer';

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
  const [disks, setDisks] = React.useState([]);
  const [vmDisks, setVmDisks] = React.useState([]);
  const fileUploadProgressBar = useFileUploadProgressBar();
  const navigate = useNavigate();
  const addNewDiskToGuestFsUpdater = useAddNewDiskToGuestFs();

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  async function fetchData() {
    const disks0 = await getMyDisks();
    console.log('disks0', disks0);
    let disks1 = [];
    if (disks0) {
      disks1 = disks0.map((disk) => {
        return { id: disk.id, name: disk.name, time: 0, size: 0 };
      });
    }
    console.log('disks', disks1);

    setDisks(disks1);

    const vmDisks0 = await getMyVmDisks();
    console.log('vmDisks0', vmDisks0);
    const vmDisks1 = [];
    if (vmDisks0) {
      vmDisks0.forEach((vmDisks) => {
        const disksParsed = JSON.parse(vmDisks.disks);
        disksParsed.forEach((singleDisk) => {
          vmDisks1.push({
            id: vmDisks.id,
            name: singleDisk,
            time: 0,
            size: 0,
          });
        });
      });
    }
    console.log('vmDisks', vmDisks1);

    setVmDisks(vmDisks1);
  }

  React.useEffect(() => {
    fetchData();
  }, [addNewDiskToGuestFsUpdater]);

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

  const handleClick = (event, id) => {
    console.log('handleClick', id);
    // hash = hash.slice(0, 33);
    navigate(`/volume?hash=${id}`, { replace: true });
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
            rowCount={disks.length}
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

            {disks.sort(getComparator(order, orderBy)).map((row, index) => {
              return (
                <Box
                  onClick={(event) => handleClick(event, row.id)}
                  key={row.id}
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

            {vmDisks.sort(getComparator(order, orderBy)).map((row, index) => {
              return (
                <Box
                  onClick={(event) =>
                    handleClick(event, `${row.id}-${row.name}`)
                  }
                  key={row.id}
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
