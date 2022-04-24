import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { Box } from '@mui/system';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';

export default function SearchBox() {
  const navigate = useNavigate();
  const [value, setValue] = useState();
  const [selectValue, setSelectValue] = useState('files');

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const handleSelectChange = (event) => {
    setSelectValue(event.target.value);
  };

  const search = useCallback(() => {
    if (selectValue === 'text') {
      navigate(`/searchText?query=${value}`, {
        replace: true,
      });
    } else {
      navigate(`/searchFiles?query=${value}`, {
        replace: true,
      });
    }
  }, [value, selectValue]);

  return (
    <Box>
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search"
        onChange={handleChange}
      />
      <Select
        labelId="demo-simple-select-autowidth-label"
        id="demo-simple-select-autowidth"
        value={selectValue}
        onChange={handleSelectChange}
        autoWidth
      >
        <MenuItem value="files">Files</MenuItem>
        <MenuItem value="text">Text</MenuItem>
      </Select>
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
