import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, TextFieldProps } from '@mui/material';
import { NoSpinTextField } from '@/components/common/NoSpinTextField';

interface NumericTextFieldProps
  extends Omit<TextFieldProps, 'onChange' | 'value'> {
  value: number | undefined;
  onChange?: (value: number) => void;
  suffix?: string;
  suffixSx?: object;
  startSuffix?: string;
  endSuffix?: string;
  isReadOnly?: boolean;
  min?: number;
  max?: number;
  dataTestId?: string;
  noSpin?: boolean;
  disabled?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
}

const NumericTextField: React.FC<NumericTextFieldProps> = ({
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
  min = 0,
  max,
  dataTestId,
  noSpin = false,
  disabled = false,
  inputRef,
  ...rest
}) => {
  const [inputValue, setInputValue] = useState<string>(
    value !== undefined ? value.toString() : '',
  );

  useEffect(() => {
    setInputValue(value !== undefined ? value.toString() : '');
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    // 小数点を除去して整数のみを許可
    const filteredValue = inputValue.replace(/[^0-9]/g, '');
    setInputValue(filteredValue);
    onChange?.(Number(filteredValue));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (inputValue === '0') {
      setInputValue('');
    }
    e.target.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
      },
      { passive: false },
    );
  };

  const handleBlurOrEnter = () => {
    // 半角に変換するタイミングで色々起きてそうなのでコメントアウト
    // const halfWidthValue = toHalfWidth(inputValue);
    // const cleanedValue = halfWidthValue
    //   .replace(/[^0-9]/g, '')
    //   .replace(/^0+/, '');

    const numericValue = inputValue === '' ? 0 : Number(inputValue);

    if (min !== undefined && numericValue < min) {
      setInputValue(min.toString());
      onChange?.(min);
      return;
    }
    if (max !== undefined && numericValue > max) {
      setInputValue(max.toString());
      onChange?.(max);
      return;
    }

    setInputValue(numericValue.toString());
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleBlurOrEnter();
    }
  };
  const Component = noSpin ? NoSpinTextField : TextField;
  const onWheelHandler = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
    e.stopPropagation();
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
      {startSuffix && <Typography sx={suffixSx}>{startSuffix}</Typography>}

      <Component
        data-testid={dataTestId}
        type="number"
        onWheel={onWheelHandler}
        fullWidth
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlurOrEnter}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        label={label}
        placeholder={placeholder}
        size={size}
        disabled={disabled}
        inputRef={inputRef}
        inputProps={{
          min,
          max,
          'data-testid': dataTestId,
        }}
        InputLabelProps={{
          sx: { color: 'black' }, // ラベルの色を黒に設定
        }}
        InputProps={{
          endAdornment: suffix && (
            <Typography sx={suffixSx}>{suffix}</Typography>
          ),
          readOnly: isReadOnly,
          ...InputProps,
          inputProps: {
            ...InputProps?.inputProps,
            onWheel: onWheelHandler,
          },
        }}
        {...rest}
      />

      {endSuffix && <Typography sx={suffixSx}>{endSuffix}</Typography>}
    </Box>
  );
};

export default NumericTextField;
