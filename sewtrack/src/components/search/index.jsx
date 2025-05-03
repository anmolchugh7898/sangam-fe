import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchInput = ({
  value,
  onChange,
  placeholder = "Search...",
  width = "230px",
  size = "small",
  showIconWhenEmpty = true,
  sx = {},
  ...rest
}) => {
  return (
    <TextField
      type="search"
      size={size}
      value={value}
      onChange={onChange}
      className='custom-search-main'
      placeholder={placeholder}
      sx={{ width,
        fontFamily: '"Be Vietnam Pro", sans-serif',
        '& input::placeholder': {
          color: '#96a0b5 !important', // or any custom color
          opacity: 1,
          fontSize: 14,
          fontWeight: '500 !important'
        },
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderWidth: 1,
            borderColor: '#e2e7f1 !important', // remove default border
          },
          '&:hover fieldset': {
            borderColor: 'none', // remove on hover
          },
          '&.Mui-focused fieldset': {
            borderWidth: 1,
            borderColor: '#e2e7f1 !important', // remove on focus
          },
        },
        '& input': {
          outline: 'none', // remove native outline (just in case)
        },
        ...sx }}
      InputProps={{
        endAdornment: showIconWhenEmpty && value.length === 0 ? (
          <InputAdornment position="end">
          </InputAdornment>
        ) : null,
      }}
      {...rest}
    />
  );
};

export default SearchInput;
