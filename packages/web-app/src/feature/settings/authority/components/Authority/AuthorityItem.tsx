import { Stack, Radio, FormControlLabel, RadioGroup } from '@mui/material';
import { useFormContext } from 'react-hook-form';

interface Props {
  property: string;
}
export const AuthorityIsEnable = ({ property }: Props) => {
  const { watch, setValue } = useFormContext();
  const isEnable = watch(property);
  return (
    <Stack direction="row" sx={{ flex: 2 }}>
      <RadioGroup
        row
        value={isEnable}
        onChange={(event) => {
          setValue(property, event.target.value === 'true');
        }}
        sx={{ flex: 4, justifyContent: 'center' }}
      >
        <FormControlLabel value={true} control={<Radio />} label="可" />
        <FormControlLabel value={false} control={<Radio />} label="不可" />
      </RadioGroup>
    </Stack>
  );
};
