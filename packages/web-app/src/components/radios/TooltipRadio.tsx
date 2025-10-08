import { Tooltip, Radio, FormControlLabel } from '@mui/material';

interface TooltipRadioProps {
  value: string;
  label: string;
  tooltip: string;
  disabled: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  checked: boolean;
}

export const TooltipRadio: React.FC<TooltipRadioProps> = ({
  value,
  label,
  tooltip,
  disabled,
  onChange,
  checked,
}) => {
  return (
    <Tooltip title={tooltip} arrow placement="top">
      <FormControlLabel
        value={value}
        control={<Radio />}
        label={label}
        disabled={disabled}
        checked={checked}
        onChange={(event, checked) => {
          if (event.target instanceof HTMLInputElement) {
            onChange(event as React.ChangeEvent<HTMLInputElement>);
          }
        }}
      />
    </Tooltip>
  );
};
