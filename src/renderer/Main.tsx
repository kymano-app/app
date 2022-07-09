import MoreVertIcon from '@mui/icons-material/MoreVert';
import { CardActionArea, CardActions, LinearProgress } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import MainMenu from './Main/Menu';
import { MyDropzone } from './MyDropzone';
import {
  getMyConfigForUpdate,
  getMyVmsWithoutInternals,
  runVm,
} from './renderer';
import Badge from '@mui/material/Badge';
import { useLaunchingVmProcess } from './Context/LaunchingVmProcessContext';
import VmCard from './Main/VmCard';

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}
export default function Main() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [vms, setVms] = useState([]);
  const [progress, setProgress] = useState();
  const [progressType, setProgressType] = useState();
  const [progressName, setProgressName] = useState();
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

  async function fetchData() {
    const vms0 = await getMyVmsWithoutInternals();
    if (vms0) {
      console.log('vms', vms0);
      setVms(vms0);
    }
  }

  async function fetchMyConfigsForUpdate() {
    const cnf = await getMyConfigForUpdate();
    if (cnf) {
      console.log('getMyConfigForUpdate', cnf);
    }
  }

  useEffect(() => {
    fetchMyConfigsForUpdate();
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const runVmHandler = (vmNameId: Number) => {
    async function runVmAsync() {
      await runVm(vmNameId);
    }
    runVmAsync();
  };

  const [editingVm, setEditingVm] = useState();
  const handleOpenMenu = (
    vmName,
    myVmId,
    type,
    updated,
    releaseDescription,
    id,
    configHistoryId,
    version,
    status,
    pid,
    event
  ) => {
    setEditingVm({
      vmName,
      myVmId,
      type,
      updated,
      releaseDescription,
      id,
      configHistoryId,
      version,
      status,
      pid,
      eventCurrentTarget: event.currentTarget,
    });
  };

  const handleReRenderAll = () => {
    fetchData();
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
          const {
            vm_name,
            my_vm_id,
            picture,
            type,
            updated,
            releaseDescription,
            id,
            config_history_id,
            status,
            pid,
            version,
          } = vm;
          return (
            <Grid item>
              <VmCard
                vm_name={vm_name}
                my_vm_id={my_vm_id}
                picture={picture}
                type={type}
                updated={updated}
                releaseDescription={releaseDescription}
                id={id}
                config_history_id={config_history_id}
                status={status}
                pid={pid}
                version={version}
              />
            </Grid>
          );
        })}
      </Grid>
      <MyDropzone updateVolumesList={updateVolumesList} />
      {editingVm && (
        <MainMenu editingVm={editingVm} handleReRenderAll={handleReRenderAll} />
      )}
    </Box>
  );
}
