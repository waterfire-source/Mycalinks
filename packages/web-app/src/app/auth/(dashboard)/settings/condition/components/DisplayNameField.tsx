import { TextField } from '@mui/material';
import { useEffect, useState } from 'react';

interface DisplayNameFieldProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export const DisplayNameField = ({
  value,
  onChange,
}: DisplayNameFieldProps) => {
  const [inputValue, setInputValue] = useState<string>(
    value !== undefined ? value : '',
  );

  useEffect(() => {
    setInputValue(value !== undefined ? value : '');
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleBlurOrEnter = () => {
    onChange(inputValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleBlurOrEnter();
    }
  };

  return (
    <TextField
      fullWidth
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlurOrEnter}
      onKeyDown={handleKeyDown}
      size="small"
    />
  );
};
