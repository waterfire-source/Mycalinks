import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  TextFieldProps,
  IconButton,
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { toHalfWidth } from '@/utils/convertToHalfWidth';

interface NumericTextFieldProps
  extends Omit<TextFieldProps, 'onChange' | 'value'> {
  value: number | undefined;
  onChange: (value: number) => void;
  suffix?: string;
  suffixSx?: object;
  startSuffix?: string;
  endSuffix?: string;
  isReadOnly?: boolean;
  maxValue?: number;
}

const AddRemoveNumericText: React.FC<NumericTextFieldProps> = ({
  value,
  onChange,
  label,
  placeholder,
  sx,
  InputProps,
  suffix = '',
  suffixSx,
  startSuffix = '',
  endSuffix = '',
  size = 'small',
  isReadOnly = false,
  maxValue,
  ...rest
}) => {
  const [inputValue, setInputValue] = useState<string>(
    value !== undefined ? value.toString() : '',
  );

  useEffect(() => {
    setInputValue(value !== undefined ? value.toString() : '');
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleFocus = () => {
    if (inputValue === '0') {
      setInputValue('');
    }
  };

  const handleBlurOrEnter = () => {
    const halfWidthValue = toHalfWidth(inputValue);
    const cleanedValue = halfWidthValue
      .replace(/[^0-9]/g, '')
      .replace(/^0+/, '');

    let numericValue = cleanedValue === '' ? 0 : Number(cleanedValue);

    if (maxValue !== undefined && numericValue > maxValue) {
      numericValue = maxValue;
    }

    setInputValue(numericValue.toString());
    onChange(numericValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleBlurOrEnter();
    }
  };

  const handleIncrement = () => {
    const currentValue = Number(inputValue) || 0;
    if (maxValue !== undefined && currentValue >= maxValue) {
      return;
    }
    const newValue = currentValue + 1;
    setInputValue(newValue.toString());
    onChange(newValue);
  };

  const handleDecrement = () => {
    const currentValue = Number(inputValue) || 0;
    if (currentValue <= 0) {
      return;
    }
    const newValue = currentValue - 1;
    setInputValue(newValue.toString());
    onChange(newValue);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '5px',
        ...sx,
      }}
    >
      <IconButton
        onClick={handleDecrement}
        disabled={isReadOnly || Number(inputValue) <= 0}
        size="small"
        sx={{ padding: 0, color: 'black' }}
      >
        <Remove
          fontSize="small"
          sx={{ padding: 0, color: 'black', width: '10px', height: '10px' }}
        />
      </IconButton>

      {startSuffix && <Typography sx={suffixSx}>{startSuffix}</Typography>}

      <TextField
        type="number"
        fullWidth
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlurOrEnter}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        label={label}
        placeholder={placeholder}
        size={size}
        InputProps={{
          endAdornment: (
            <>
              {suffix && <Typography sx={suffixSx}>{suffix}</Typography>}
              <Typography sx={suffixSx}>点</Typography>
            </>
          ),
          readOnly: isReadOnly,
          ...InputProps,
          inputProps: {
            min: 0,
            max: maxValue,
            ...InputProps?.inputProps,
          },
        }}
        sx={{ flexGrow: 1 }}
        {...rest}
      />

      {endSuffix && <Typography sx={suffixSx}>{endSuffix}</Typography>}

      <IconButton
        onClick={handleIncrement}
        disabled={
          isReadOnly ||
          (maxValue !== undefined && Number(inputValue) >= maxValue)
        }
        size="small"
        sx={{ padding: 0, color: 'black' }}
      >
        <Add
          fontSize="small"
          sx={{ padding: 0, color: 'black', width: '10px', height: '10px' }}
        />
      </IconButton>
    </Box>
  );
};

export default AddRemoveNumericText;
