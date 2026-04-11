// src/components/common/CommonDatePicker.jsx
import React from 'react';
import { DatePicker, TimePicker, DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import TextField from '@mui/material/TextField';

const CommonDatePicker = ({
  type = 'date', // 'date', 'time', or 'datetime'
  label,
  value,
  onChange,
  disabled = false,
  fullWidth = true,
  minDate,
  maxDate,
  disablePast = true, // 👈 default to true to block past time
  ...rest
}) => {
  const PickerComponent =
    type === 'time' ? TimePicker :
    type === 'datetime' ? DateTimePicker :
    DatePicker;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <PickerComponent
        label={label}
        value={value}
        onChange={onChange}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        disablePast={disablePast} // 👈 disable past dates/times
        {...rest}
        renderInput={(params) => <TextField {...params} fullWidth={fullWidth} />}
      />
    </LocalizationProvider>
  );
};

export default CommonDatePicker;
