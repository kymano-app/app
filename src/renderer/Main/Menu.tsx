import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useEffect, useState } from 'react';
import { updateConfigInMyConfig } from 'renderer/renderer';
import CloudModal from './CloudModal';
import EditModal from './EditModal';
import UpdateModal from './UpdateModal';

export default function MainMenu({ editingVm, handleReRenderAll }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openCloudModal, setOpenCloudModal] = useState(false);
  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    setAnchorEl(editingVm.eventCurrentTarget);
  }, [editingVm]);

  const handleEdit = () => {
    setAnchorEl(null);
    setOpenEditModal(true);
  };

  const handleUpdate = () => {
    // updateConfigInMyConfigHandler(editingVm.myVmId);
    setOpenUpdateModal(true);
    setAnchorEl(null);
  };

  const handleMoveToCloud = () => {
    setAnchorEl(null);
    setOpenCloudModal(true);
  };

  console.log(`src/renderer/Main/Menu.tsx:28 editingVm`, editingVm);

  return (
    <>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        {editingVm.updated === 1 && (
          <MenuItem onClick={handleUpdate}>
            <Badge
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              variant="dot"
              color="error"
              invisible={editingVm.type === 'actual'}
            >
              Update
            </Badge>
          </MenuItem>
        )}
        <MenuItem onClick={handleMoveToCloud}>Move to cloud</MenuItem>
      </Menu>
      <EditModal
        vm={editingVm}
        openModal={openEditModal}
        setMenuOpenModal={setOpenEditModal}
        handleReRenderAll={handleReRenderAll}
      />
      <UpdateModal
        vm={editingVm}
        openModal={openUpdateModal}
        setMenuOpenModal={setOpenUpdateModal}
        handleReRenderAll={handleReRenderAll}
      />
      <CloudModal
        vm={editingVm}
        openModal={openCloudModal}
        setMenuOpenModal={setOpenCloudModal}
        handleReRenderAll={handleReRenderAll}
      />
    </>
  );
}
