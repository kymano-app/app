import MuiMonitorIcon from '@mui/icons-material/Monitor';
import MuiStorageIcon from '@mui/icons-material/Storage';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import { styled } from '@mui/material/styles';
import MuiTooltip from '@mui/material/Tooltip';
import { Link, useLocation } from 'react-router-dom';
import './x.css';

const WIDTH = 48;

const iconStyles = {
  fontSize: 27,
  minWidth: WIDTH,
};
const MonitorIcon = styled(MuiMonitorIcon)(() => iconStyles);
const StorageIcon = styled(MuiStorageIcon)(() => iconStyles);

const menu = [
  { path: '/index.html', tipTitle: 'Virtual machines', icon: <MonitorIcon /> },
  { path: '/guestfs', tipTitle: 'Volumes', icon: <StorageIcon /> },
];

const Drawer = styled(MuiDrawer)(() => ({
  flexShrink: 0,
  boxSizing: 'border-box',
  '& .MuiDrawer-paper': { width: WIDTH },
}));

export default function LeftMenu() {
  const location = useLocation();

  return (
    <Drawer variant="permanent">
      <List style={{ paddingTop: 0 }}>
        {menu.map((item) => (
          <MuiTooltip
            TransitionProps={{ timeout: 0 }}
            title={item.tipTitle}
            placement="right"
            arrow
          >
            <Link to={item.path}>
              <ListItemButton
                sx={{
                  minHeight: 50,
                  width: WIDTH,
                  justifyContent: 'center',
                }}
                selected={location.pathname === item.path}
              >
                <ListItemIcon
                  sx={{
                    width: WIDTH,
                    justifyContent: 'center',
                    minWidth: WIDTH,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
              </ListItemButton>
            </Link>
          </MuiTooltip>
        ))}
      </List>
    </Drawer>
  );
}
