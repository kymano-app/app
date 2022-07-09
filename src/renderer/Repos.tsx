import { Button, CardActionArea, CardActions } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { useNavigate } from 'react-router';
import { useFileUploadProgressBar } from './Context/FileUploadProgressBarContext';
import { addDriveViaMonitor, addNewVmDriveToGuestFs, createVm, execInGuestFs, getConfigList, getDrivesNames, runVm } from './renderer';

export default function Repos() {
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [progress, setProgress] = React.useState(0);
  const [cards, setCards] = React.useState([]);
  const fileUploadProgressBar = useFileUploadProgressBar();
  const navigate = useNavigate();

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  React.useEffect(() => {
    async function fetchData() {
      const configs0 = await getConfigList();
      console.log('configs0', configs0);
      // let configs = [];
      // if (configs0) {
      //   configs = configs0.map((config) => {
      //     return { name: config.hash };
      //   });
      // }
      // console.log('configs', configs);

      setCards(configs0);
    }
    fetchData();
  }, []);

  const runNewVm = (configId) => {
    async function runNewVmAsync() {
      const myConfigId = await createVm(configId);
      navigate(`/index.html`);
      await runVm(myConfigId);
      const disks = await getDrivesNames(myConfigId);
      console.log('resp', disks, myConfigId);
      await addNewVmDriveToGuestFs(`${myConfigId}-${disks}`);
      await new Promise((resolve) => setTimeout(resolve, 1 * 1000));
      const result = await execInGuestFs('/bin/guestfs');
      console.log('result', result);
    }
    runNewVmAsync();
  };

  return (
    <Box
      sx={{
        width: 'calc(100% - 58px)',
        marginLeft: '58px',
        marginTop: '10px',
      }}
    >
      <Grid container spacing={1}>
        {cards.map((card, index) => {
          const { config_id, name, picture, description } = card;
          return (
            <Grid item>
              <Card sx={{ maxWidth: 345 }}>
                <CardActionArea>
                  {picture ? (
                    <CardMedia component="img" height="140" image={picture} />
                  ) : (
                    <Box
                      height="140px"
                      style={{ backgroundColor: '#f0f0f0' }}
                    />
                  )}
                  <CardContent style={{ height: 110 }}>
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="div"
                      style={{
                        whiteSpace: 'nowrap',
                        width: 300,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      style={{
                        overflow: 'hidden',
                        display: '-webkit-box',
                        webkitLineClamp: '2',
                        width: 300,
                        webkitBoxOrient: 'vertical',
                      }}
                    >
                      {description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => runNewVm(config_id)}
                  >
                    Run new
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
