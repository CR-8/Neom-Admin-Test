import React from 'react';
import {
  TextField,
  Grid,
  Button,
  MenuItem,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Checkbox,
  Box,
  Slider,
  Typography,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const FormBuilder = ({
  fields,
  values,
  errors,
  onChange,
  onSubmit,
  submitText = 'Submit',
  submitFullWidth = false,
  loading = false,
  disabled = false
}) => {
  const handleChange = (fieldId, value) => {
    onChange(fieldId, value);
  };

  const handleDateChange = (fieldId, date) => {
    onChange(fieldId, date);
  };

  const renderField = (field) => {
    const {
      id,
      type,
      label,
      placeholder,
      options,
      required,
      fullWidth = true,
      size = 'medium',
      rows,
      multiline,
      min,
      max,
      step,
      marks,
      disabled: fieldDisabled,
      helperText,
      autoFocus
    } = field;

    const error = errors?.[id];
    const value = values?.[id] !== undefined ? values[id] : '';

    switch (type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        return (
          <TextField
            id={id}
            name={id}
            label={label}
            type={type}
            value={value}
            onChange={(e) => handleChange(id, e.target.value)}
            required={required}
            fullWidth={fullWidth}
            error={Boolean(error)}
            helperText={error || helperText}
            size={size}
            placeholder={placeholder}
            multiline={multiline}
            rows={rows}
            disabled={disabled || fieldDisabled}
            autoFocus={autoFocus}
            InputProps={{
              inputProps: {
                min: min,
                max: max,
                step: step
              }
            }}
          />
        );
      case 'select':
        return (
          <FormControl
            fullWidth={fullWidth}
            error={Boolean(error)}
            required={required}
            size={size}
            disabled={disabled || fieldDisabled}
          >
            <InputLabel id={`${id}-label`}>{label}</InputLabel>
            <Select
              labelId={`${id}-label`}
              id={id}
              name={id}
              value={value}
              label={label}
              onChange={(e) => handleChange(id, e.target.value)}
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {error && <FormHelperText>{error}</FormHelperText>}
            {helperText && !error && <FormHelperText>{helperText}</FormHelperText>}
          </FormControl>
        );
      case 'date':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={label}
              value={value || null}
              onChange={(date) => handleDateChange(id, date)}
              slotProps={{
                textField: {
                  fullWidth: fullWidth,
                  required: required,
                  error: Boolean(error),
                  helperText: error || helperText,
                  size: size
                }
              }}
              disabled={disabled || fieldDisabled}
            />
          </LocalizationProvider>
        );
      case 'switch':
        return (
          <FormControl
            fullWidth={fullWidth}
            error={Boolean(error)}
            required={required}
            disabled={disabled || fieldDisabled}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(value)}
                  onChange={(e) => handleChange(id, e.target.checked)}
                  name={id}
                />
              }
              label={label}
            />
            {error && <FormHelperText>{error}</FormHelperText>}
            {helperText && !error && <FormHelperText>{helperText}</FormHelperText>}
          </FormControl>
        );
      case 'checkbox':
        return (
          <FormControl
            fullWidth={fullWidth}
            error={Boolean(error)}
            required={required}
            disabled={disabled || fieldDisabled}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(value)}
                  onChange={(e) => handleChange(id, e.target.checked)}
                  name={id}
                />
              }
              label={label}
            />
            {error && <FormHelperText>{error}</FormHelperText>}
            {helperText && !error && <FormHelperText>{helperText}</FormHelperText>}
          </FormControl>
        );
      case 'slider':
        return (
          <Box sx={{ width: '100%', px: 2 }}>
            <Typography id={`${id}-label`} gutterBottom>
              {label} {value && `(${value})`}
            </Typography>
            <Slider
              value={value || 0}
              onChange={(_, newValue) => handleChange(id, newValue)}
              aria-labelledby={`${id}-label`}
              valueLabelDisplay="auto"
              step={step}
              marks={marks}
              min={min}
              max={max}
              disabled={disabled || fieldDisabled}
            />
            {error && <FormHelperText error>{error}</FormHelperText>}
            {helperText && !error && <FormHelperText>{helperText}</FormHelperText>}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit && onSubmit();
      }}
      sx={{ mt: 1 }}
    >
      <Grid container spacing={2}>
        {fields.map((field) => (
          <Grid item xs={12} md={field.gridSize || 12} key={field.id}>
            {renderField(field)}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FormBuilder;
