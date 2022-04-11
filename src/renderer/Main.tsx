import { CardActionArea, CardActions } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { useRef } from 'react';
import { useNavigate } from 'react-router';
import { MyDropzone } from './MyDropzone';
import { getMyVms, runVm } from './renderer';

// const { spawn } = require('child_process');

export default function Main() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [vms, setVms] = React.useState([]);
  const navigate = useNavigate();

  // spawn('/opt/homebrew/bin/socat', [
  //   'TCP-LISTEN:6000,reuseaddr,fork',
  //   'UNIX-CLIENT:"$DISPLAY"',
  // ]);
  // const XQuartz = path.join(__dirname, 'assets', 'XQuartz.pkg');
  // console.log(XQuartz);
  // spawn('cp', [XQuartz, '/tmp/']);

  // spawn('launchctl', ['getenv', 'DISPLAY']).stdout.on('data', (data: any) => {
  //   const display = String.fromCharCode(...data).trim();
  //   console.log(display);
  //   if (display.length < 3) {
  //     spawn('launchctl', ['load', '-w', '/tmp/org.xquartz.startx.plist']).on(
  //       'close',
  //       () => {
  //         spawn(
  //           '/System/Volumes/Data/opt/homebrew/Cellar/virt-viewer/10.8/bin/remote-viewer',
  //           ['spice://127.0.0.1:5930', '--display', display]
  //         );
  //       }
  //     );
  //   } else {
  //     spawn(
  //       '/System/Volumes/Data/opt/homebrew/Cellar/virt-viewer/10.8/bin/remote-viewer',
  //       ['spice://127.0.0.1:5930', '--display', display]
  //     );
  //   }
  // });

  // spawn('/bin/launchctl', ['unload', '-w', '/tmp/org.xquartz.startx.plist']);
  // const ls0 = spawn('/bin/launchctl', [
  //   'load',
  //   '-w',
  //   '/tmp/org.xquartz.startx.plist',
  // ]);
  // ls0.on('close', (code) => {
  //   const ls1 = spawn('/bin/launchctl', ['getenv', 'DISPLAY']);
  //   ls1.stdout.on('data', (data) => {
  //     const display = String.fromCharCode(...data).trim();
  //     console.log(display);
  //     const lsx = spawn(
  //       '/System/Volumes/Data/opt/homebrew/Cellar/virt-viewer/10.8/bin/remote-viewer',
  //       ['spice://127.0.0.1:5930', '--display', display]
  //     );
  //     lsx.stdout.on('data', (data) => {
  //       console.log(`stdout: ${data}`);
  //     });

  //     lsx.stderr.on('data', (data) => {
  //       console.error(`stderr: ${data}`);
  //     });

  //     lsx.on('close', (code) => {
  //       console.log(`child process exited with code ${code}`);
  //     });
  //   });

  //   ls0.stdout.on('data', (data) => {
  //     console.log(`stdout: ${data}`);
  //   });

  //   ls0.stderr.on('data', (data) => {
  //     console.error(`stderr: ${data}`);
  //   });
  // const ls = spawn(
  //   '/System/Volumes/Data/opt/homebrew/Cellar/virt-viewer/10.8/bin/remote-viewer',
  //   ['spice://127.0.0.1:5930']
  // );
  // ls.stdout.on('data', (data) => {
  //   console.log(`stdout: ${data}`);
  // });

  // ls.stderr.on('data', (data) => {
  //   console.error(`stderr: ${data}`);
  // });

  // ls.on('close', (code) => {
  //   console.log(`child process exited with code ${code}`);
  // });
  // });

  const updateVolumesList = (hash: string) => {
    console.log('gotoSingleVolume', hash);
    navigate(`/volumes`, { replace: true });
  };

  React.useEffect(() => {
    async function fetchData() {
      const vms0 = await getMyVms();
      if (vms0) {
        console.log('vms', vms0);
        setVms(vms0);
      }
    }

    fetchData();
  }, []);

  const runVmHandler = (vmNameId: Number) => {
    async function runVmAsync() {
      await runVm(vmNameId);
    }
    runVmAsync();
  };

  return (
    <Box
      sx={{
        width: 'calc(100% - 58px)',
        marginLeft: '58px',
        marginTop: '10px',
        marginBottom: '145px',
      }}
    >
      <Grid container spacing={1}>
        {vms.map((vm, index) => {
          const { name, my_vm_name_id, picture, description } = vm;
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
                    onClick={() => runVmHandler(my_vm_name_id)}
                  >
                    Run
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      <MyDropzone updateVolumesList={updateVolumesList} />
    </Box>
  );
}
