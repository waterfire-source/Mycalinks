import { StorePointSettingUpdateState } from '@/feature/store/hooks/useUpdateStorePointInfo';
import { FormControlLabel, Radio, RadioGroup } from '@mui/material';

interface Props {
  canEnable?: boolean;
  trueLabel: string;
  falseLabel: string;
  settingKey: keyof StorePointSettingUpdateState;
  setPointSettings: React.Dispatch<
    React.SetStateAction<StorePointSettingUpdateState>
  >;
}

export const RadioForPoint = ({
  canEnable,
  trueLabel,
  falseLabel,
  settingKey,
  setPointSettings,
}: Props) => {
  const handleEnabledChange = (
    key: keyof StorePointSettingUpdateState,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const value = event.target.value === 'true';
    setPointSettings((prev) => ({ ...prev, [key]: value }));
  };
  return (
    <RadioGroup
      row
      value={String(canEnable) ?? 'false'}
      onChange={(event) => handleEnabledChange(settingKey, event)}
    >
      <FormControlLabel value="true" control={<Radio />} label={trueLabel} />
      <FormControlLabel value="false" control={<Radio />} label={falseLabel} />
    </RadioGroup>
  );
};
