import React from 'react';
import { Autocomplete, TextField } from '@mui/material';

export default function SearchableAutocomplete({ options, formData, setFormData }) {
  const handleChange = (_, selectedOption) => {
    setFormData({ ...formData, app_type: selectedOption?.value || '' });
  };

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.label}
      value={options.find((option) => option.value === formData.app_type) || null}
      onChange={handleChange}
      renderInput={(params) => <TextField {...params} label="Select Type" />}
      isOptionEqualToValue={(option, value) => option.value === value.value}
    />
  );
}
