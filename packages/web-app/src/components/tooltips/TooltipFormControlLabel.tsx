import React from 'react';
import {
  Tooltip,
  FormControlLabel,
  Radio,
  FormControlLabelProps,
} from '@mui/material';

interface Props extends Omit<FormControlLabelProps, 'control'> {
  tooltip: string;
  disabled?: boolean;
}

export const TooltipFormControlLabel: React.FC<Props> = ({
  tooltip,
  disabled,
  ...props
}) => {
  return (
    <Tooltip title={tooltip} placement="top" arrow>
      <span>
        <FormControlLabel
          {...props}
          control={<Radio disabled={disabled} />}
          sx={{ cursor: disabled ? 'not-allowed' : 'pointer', ...props.sx }}
        />
      </span>
    </Tooltip>
  );
};
