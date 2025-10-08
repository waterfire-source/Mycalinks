import { useFieldNameMap } from '@/contexts/FormErrorContext';
import { toHalfWidthOnly } from '@/utils/convertToHalfWidth';
import { TextField } from '@mui/material';
import { Typography } from '@mui/material';
import { Stack } from '@mui/material';
import { useFormContext } from 'react-hook-form';

interface Props {
  name: string;
  titleWidth: string;
  type?: string;
}
export const FormTextField = ({ name, titleWidth, type }: Props) => {
  const { setValue, watch } = useFormContext();

  const fieldNameMap = useFieldNameMap();
  const fieldDisplayName = fieldNameMap[name] || name;

  return (
    <Stack direction="row" alignItems="center">
      <Typography fontWeight="bold" sx={{ width: titleWidth }}>
        {fieldDisplayName}
      </Typography>
      <TextField
        size="small"
        value={watch(name)}
        onChange={(e) => {
          const value = ['number', 'email', 'tel'].includes(type || '')
            ? toHalfWidthOnly(e.target.value)
            : e.target.value;
          setValue(name, value);
        }}
        sx={{ width: `calc(100% - ${titleWidth})` }}
      />
    </Stack>
  );
};
