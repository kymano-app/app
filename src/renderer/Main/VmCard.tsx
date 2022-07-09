import MoreVertIcon from '@mui/icons-material/MoreVert';
import { CardActionArea, CardActions, LinearProgress } from '@mui/material';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLaunchingVmProcess } from '../Context/LaunchingVmProcessContext';
import {
  getMyConfigForUpdate,
  getMyVmsWithoutInternals,
  runVm,
} from '../renderer';

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}
export default function VmCard({
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
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState();
  const [progressType, setProgressType] = useState();
  const [progressName, setProgressName] = useState();
  const navigate = useNavigate();
  const launchingVmProcess = useLaunchingVmProcess();

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
    console.log(
      `src/renderer/Main.tsx:143 launchingVmProcess`,
      launchingVmProcess
    );
    if (launchingVmProcess.results && launchingVmProcess.results[my_vm_id]) {
      setProgress(launchingVmProcess.results[my_vm_id].percent);
      setProgressName(launchingVmProcess.results[my_vm_id].name);
      setProgressType(launchingVmProcess.results[my_vm_id].type);
    }
  }, [launchingVmProcess]);

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

  return (
    <Card sx={{ maxWidth: 345, width: 332 }}>
      <CardActionArea>
        <CardHeader
          action={
            <IconButton
              aria-label="settings"
              onClick={(e) =>
                handleOpenMenu(
                  vm_name,
                  my_vm_id,
                  type,
                  updated,
                  releaseDescription,
                  id,
                  config_history_id,
                  version,
                  status,
                  pid,
                  e
                )
              }
            >
              <Badge variant="dot" color="error" invisible={type === 'actual'}>
                <MoreVertIcon />
              </Badge>
            </IconButton>
          }
          title={vm_name}
          titleTypographyProps={{ fontSize: '1.2rem' }}
        />
        {picture ? (
          <CardMedia component="img" height="140" image={picture} />
        ) : (
          <Box height="140px" style={{ backgroundColor: '#f0f0f0' }} />
        )}
      </CardActionArea>
      <CardActions>
        {!progress ? (
          <Button
            size="small"
            color="primary"
            onClick={() => runVmHandler(my_vm_id)}
          >
            {status}
            {pid}
            {my_vm_id}
          </Button>
        ) : (
          <Box display="flex" flexDirection="column" flexGrow="1">
            <Box flexGrow="1">
              <LinearProgress
                color="success"
                variant="determinate"
                value={progress}
                style={{ width: '100%' }}
              />
            </Box>
            <Box flexGrow="1">{progressType}-{progressName}</Box>
          </Box>
        )}
      </CardActions>
    </Card>
  );
}
