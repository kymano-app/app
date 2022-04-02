import DirectionsIcon from '@mui/icons-material/Directions';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import { Box } from '@mui/system';
import * as React from 'react';
import { useNavigate } from 'react-router';

export default function SearchBox() {
  const navigate = useNavigate();

  const search = () => {
    navigate(`/search?query=*.cpp`, {
      replace: true,
    });
  };
  return (
    <Box>
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search Google Maps"
        inputProps={{ 'aria-label': 'search google maps' }}
      />
      <IconButton color="primary" sx={{ p: '10px' }} aria-label="directions">
        <DirectionsIcon />
      </IconButton>
      <IconButton
        sx={{ p: '10px' }}
        aria-label="search"
        onClick={() => search()}
      >
        <SearchIcon />
      </IconButton>
    </Box>
  );
}
