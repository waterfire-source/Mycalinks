import { StorePointSettingUpdateState } from '@/feature/store/hooks/useUpdateStorePointInfo';
import {
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { PointOpportunity } from '@prisma/client';

interface Props {
  value?: PointOpportunity;
  settingKey: keyof StorePointSettingUpdateState;
  setPointSettings: React.Dispatch<
    React.SetStateAction<StorePointSettingUpdateState>
  >;
}

export const SelectForPoint = ({
  value,
  settingKey,
  setPointSettings,
}: Props) => {
  const handleSelectChange = (
    key: keyof StorePointSettingUpdateState,
    event: SelectChangeEvent<PointOpportunity>,
  ) => {
    const value = event.target.value as PointOpportunity;
    setPointSettings((prev) => ({ ...prev, [key]: value }));
  };
  return (
    <FormControl sx={{ width: '90px' }}>
      <Select
        value={value || ''}
        onChange={(event) => handleSelectChange(settingKey, event)}
        sx={{ height: '35px' }}
        displayEmpty
      >
        <MenuItem value="transaction">1会計</MenuItem>
        <MenuItem value="visit">1来店</MenuItem>
      </Select>
    </FormControl>
  );
};
