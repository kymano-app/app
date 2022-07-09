import CloudIcon from '@mui/icons-material/Cloud';
import MuiMonitorIcon from '@mui/icons-material/Monitor';
import SettingsIcon from '@mui/icons-material/Settings';
import MuiStorageIcon from '@mui/icons-material/Storage';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import { styled } from '@mui/material/styles';
import MuiTooltip from '@mui/material/Tooltip';
import { Box } from '@mui/system';
import { useEffect } from 'react';
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
  { path: '/volumes', tipTitle: 'Volumes', icon: <StorageIcon /> },
  { path: '/repos', tipTitle: 'Repos', icon: <CloudIcon /> },
];
const menuSettings = [
  { path: '/settings', tipTitle: 'Settings', icon: <SettingsIcon /> },
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
      <Box sx={{ flexGrow: 1 }}>
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
      </Box>
      <Box>
        <List style={{ padding: 0 }}>
          {menuSettings.map((item) => (
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
      </Box>
    </Drawer>
  );
}
