import React from 'react';
import Button from '@mui/material/Button';

const CustomButton = ({
  label,
  onClick,
  variant = 'contained',
  color = 'primary',
  startIcon = null,
  endIcon = null,
  fullWidth = false,
  disabled = false,
  size = 'medium',
  sx = {},
  type = 'button',
  ...rest
}) => {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      color={color}
      startIcon={startIcon}
      endIcon={endIcon}
      fullWidth={fullWidth}
      disabled={disabled}
      size={size}
      sx={{
        ...sx,
        boxShadow: 'none',
        backgroundColor: 'rgba(137, 67, 67, 1)',
        color: 'white',
        paddingX: '.95rem',
        paddingY: '.517rem',
        fontSize: '.812rem',
        borderRadius: '.4rem',
        '&:hover': {
          boxShadow: 'none',
          backgroundColor: 'rgba(137, 67, 67, .825) !important'
        }
      }}
      type={type}
      {...rest}
    >
      {label}
    </Button>
  );
};

export default CustomButton;
