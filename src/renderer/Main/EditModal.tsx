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
import { changeVmName } from 'renderer/renderer';

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

export default function EditModal({
  vm,
  openModal,
  setMenuOpenModal,
  handleReRenderAll,
}) {
  console.log('EditModal');

  const [open, setOpen] = useState(openModal);
  const handleClose = () => {
    setOpen(false);
    setMenuOpenModal(false);
  };
  const textRef = useRef();

  const changeVmNameHandler = () => {
    console.log('newVmName', textRef.current.value);

    async function runVmAsync() {
      await changeVmName(textRef.current.value, vm.myVmId);
      handleReRenderAll();
    }
    runVmAsync();
  };

  const handleSave = () => {
    changeVmNameHandler();
    handleClose();
  };

  useEffect(() => {
    console.log('EditModal openModal', openModal);
    setOpen(openModal);
  }, [openModal]);

  return (
    <BootstrapDialog
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={open}
    >
      <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
        Edit Virtual Machine
      </BootstrapDialogTitle>
      <DialogContent dividers>
        <FormControl fullWidth variant="standard">
          <TextField
            id="standard-basic"
            label="Name"
            variant="standard"
            defaultValue={vm.vmName}
            inputRef={textRef}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
}
