import CloseIcon from '@mui/icons-material/Close';
import { Box, FormControl, MenuItem, Select, Typography } from '@mui/material';
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

export default function CloudModal({
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
        Move Virtual Machine to the cloud
      </BootstrapDialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" gutterBottom>
          This feature has not yet been implemented.
        </Typography>
        <Typography variant="body1" gutterBottom>
          We are interested in your opinion on the price:
        </Typography>

        <Typography variant="body1" gutterBottom>
          <Box component="div" display="inline">
            I think <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              value={4}
              label="Age"
              style={{ height: 30, margin:3 }}
            >
              {[...Array(11).keys()].map((e) => (
                <MenuItem value={e}>${e} /month</MenuItem>
              ))}
            </Select> for <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              value={200}
              label="Age"
              style={{ height: 30, margin:3 }}
            >
              {[100, 200, 500, 1000, 2000].map((e) => (
                <MenuItem value={e}>{e} GB</MenuItem>
              ))}
            </Select> is a good price.
          </Box>
        </Typography>
        <FormControl fullWidth variant="standard">
          <TextField
            id="standard-basic"
            label="E-Mail"
            variant="standard"
            inputRef={textRef}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" autoFocus onClick={handleSave}>
          Let me know when it's implemented
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
}
