import CloseIcon from '@mui/icons-material/Close';
import { FormControl } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  changeVmName,
  getConfigById,
  getConfigHistoryById,
  getHistoryIdFromConfig,
  getLatestConfigByHistoryId,
  getPreviousIdFromConfigHistory,
  rollbackConfigInMyConfig,
  updateConfigInMyConfig,
} from 'renderer/renderer';

const isUpdatable = (currentVm, vm) => {
  console.log(
    `src/renderer/Main/UpdateModal.tsx:24 isUpdatable`,
    currentVm.type !== 'actual' && currentVm.version != vm.version,
    currentVm.type,
    currentVm.version,
    vm.version
  );
  return (
    currentVm.type !== 'actual' &&
    !(currentVm.type === 'latest' && currentVm.version == vm.version)
  );
};

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
    minWidth: '400px',
  },
}));

const BootstrapDialogTitle = (props: DialogTitleProps) => {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}

export default function UpdateModal({
  vm,
  openModal,
  setMenuOpenModal,
  handleReRenderAll,
}) {
  console.log(`src/renderer/Main/UpdateModal.tsx:60 vm`, vm, openModal);
  const [open, setOpen] = useState(openModal);
  const [currentVm, setCurrentVm] = useState(vm);
  const handleClose = () => {
    setOpen(false);
    setMenuOpenModal(false);
    getLatestConfigByHistoryIdAsync();
    handleReRenderAll();
  };
  async function getLatestConfigByHistoryIdAsync() {
    let latestConfig;
    if (vm.type === 'history' && vm.configHistoryId) {
      latestConfig = await getLatestConfigByHistoryId(vm.configHistoryId);
    }
    if (vm.type === 'history' && !vm.configHistoryId) {
      latestConfig = await getLatestConfigByHistoryId(vm.id);
    }
    console.log(
      `src/renderer/Main/UpdateModal.tsx:186 latestConfig`,
      latestConfig,
      vm
    );
    if (latestConfig) {
      setCurrentVm({
        vmName: currentVm.vmName,
        myVmId: currentVm.myVmId,
        type: 'latest',
        updated: 1,
        releaseDescription: latestConfig['releaseDescription'],
        id: latestConfig['id'],
        configHistoryId: latestConfig['history_id'],
        version: latestConfig['version'],
      });
    } else {
      setCurrentVm(vm);
    }
  }
  const updateConfigInMyConfigHandler = (myVmId: Number) => {
    async function updateConfigInMyConfigAsync() {
      await updateConfigInMyConfig(myVmId);
      handleReRenderAll();
    }
    updateConfigInMyConfigAsync();
  };

  const handleUpdate = () => {
    console.log(`src/renderer/Main/UpdateModal.tsx:85 handleUpdate`, currentVm);
    if (currentVm.version == vm.version) {
      handleClose();
    } else {
      if (currentVm.type === 'latest') {
        updateConfigInMyConfigHandler(currentVm.myVmId);
      } else {
        rollbackConfigInMyConfig(currentVm.myVmId, currentVm.id);
      }
      vm = currentVm;
      handleClose();
    }
  };

  const getHistoryIdFromConfigHandler = (
    configId: Number,
    myConfigId: Number
  ) => {
    async function getHistoryIdFromConfigAsync() {
      const historyId = await getHistoryIdFromConfig(configId);
      console.log(`src/renderer/Main/UpdateModal.tsx:89 HistoryId`, historyId);
      const config = await getConfigHistoryById(historyId);
      console.log(`src/renderer/Main/UpdateModal.tsx:97 getConfigById`, config);

      setCurrentVm({
        vmName: currentVm.vmName,
        myVmId: currentVm.myVmId,
        type: 'history',
        updated: 1,
        releaseDescription: config['releaseDescription'],
        id: config['id'],
        configHistoryId: config['previous_id'],
        version: config['version'],
      });
      //await rollbackConfigInMyConfig(myConfigId, historyId);

      //handleReRenderAll();
    }
    getHistoryIdFromConfigAsync();
  };

  const getPreviousIdFromConfigHistoryHandler = (
    configHistoryId: Number,
    myConfigId: Number
  ) => {
    async function getPreviousIdFromConfigHistoryAsync() {
      const historyId = await getPreviousIdFromConfigHistory(configHistoryId);
      console.log(`src/renderer/Main/UpdateModal.tsx:98 HistoryId`, historyId);
      const config = await getConfigHistoryById(historyId);
      console.log(
        `src/renderer/Main/UpdateModal.tsx:114 getConfigHistoryById`,
        config
      );
      setCurrentVm({
        vmName: currentVm.vmName,
        myVmId: currentVm.myVmId,
        type: 'history',
        updated: 1,
        releaseDescription: config['releaseDescription'],
        id: config['id'],
        configHistoryId: config['previous_id'],
        version: config['version'],
      });
      //await rollbackConfigInMyConfig(myConfigId, historyId);

      //handleReRenderAll();
    }
    getPreviousIdFromConfigHistoryAsync();
  };

  const handlePrevious = () => {
    console.log(`src/renderer/Main/UpdateModal.tsx:149 currentVm`, currentVm);
    if (
      currentVm.id &&
      (currentVm.type === 'actual' || currentVm.type === 'latest')
    ) {
      getHistoryIdFromConfigHandler(currentVm.id, currentVm.myVmId);
      console.log(
        `src/renderer/Main/UpdateModal.tsx:118 getHistoryIdFromConfigHandler`,
        currentVm.id,
        currentVm.myVmId
      );
    } else {
      getPreviousIdFromConfigHistoryHandler(currentVm.id, currentVm.myVmId);
      console.log(
        `src/renderer/Main/UpdateModal.tsx:124 getPreviousIdFromConfigHistoryHandler`
      );
    }
    //handleClose();
  };

  useEffect(() => {
    setOpen(openModal);
  }, [openModal]);

  // useEffect(() => {
  //   setCurrentVm(vm);
  // }, [vm]);

  useEffect(() => {
    console.log(`src/renderer/Main/UpdateModal.tsx:181 useEffect`);

    getLatestConfigByHistoryIdAsync();

    return console.log(`src/renderer/Main/UpdateModal.tsx:212 cleanup`);
  }, []);

  console.log(`src/renderer/Main/UpdateModal.tsx:135 currentVm`, currentVm);
  return (
    <BootstrapDialog
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={open}
    >
      <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
        Update
      </BootstrapDialogTitle>
      <DialogContent dividers>Your current version: {vm.version}</DialogContent>
      <DialogActions>
        {!currentVm.configHistoryId === false && (
          <Button autoFocus onClick={handlePrevious}>
            Previous
          </Button>
        )}
        {isUpdatable(currentVm, vm) && (
          <Button autoFocus onClick={handleUpdate}>
            Update to {currentVm.version} version
          </Button>
        )}
      </DialogActions>
    </BootstrapDialog>
  );
}
