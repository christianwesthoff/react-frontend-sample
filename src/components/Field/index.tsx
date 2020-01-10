import React from 'react';
import { Checkbox, FormControlLabel, TextField } from '@material-ui/core';

interface FieldProps {
  type: 'string' | 'date' | 'number' | 'boolean';
  onChange: any;
  onBlur: any;
  value: any;
  label: string;
}

const Field = ({ type, onChange, onBlur, value, label }: FieldProps) => {
  switch (type) {
    case 'string':
    case 'date':
    case 'number': {
      return (
        <TextField
          fullWidth
          onBlur={onBlur}
          onChange={event => {
            onChange(event.target.value);
          }}
          value={value}
          label={label}
          type={type === 'string' ? 'text' : type}
          variant="outlined"
          InputLabelProps={
            type === 'date'
              ? {
                  shrink: true,
                }
              : {}
          }
        />
      );
    }
    case 'boolean': {
      return (
        <FormControlLabel
          control={
            <Checkbox
              onChange={() => {
                onChange(!value);
              }}
              checked={value}
              color="primary"
            />
          }
          label={label}
        />
      );
    }
    default: {
      return null;
    }
  }
};

export default Field;
