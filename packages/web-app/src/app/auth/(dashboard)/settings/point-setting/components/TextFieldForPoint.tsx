import { StorePointSettingUpdateState } from '@/feature/store/hooks/useUpdateStorePointInfo';
import { TextField } from '@mui/material';

interface Props {
  value?: number;
  settingKey: keyof StorePointSettingUpdateState;
  setPointSettings: React.Dispatch<
    React.SetStateAction<StorePointSettingUpdateState>
  >;
}

export const TextFieldForPoint = ({
  value,
  settingKey,
  setPointSettings,
}: Props) => {
  const handleInputChange = (
    key: keyof StorePointSettingUpdateState,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const value = Number(event.target.value);
    setPointSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <TextField
      type="number"
      value={value || ''}
      required
      size="small"
      sx={{
        width: '150px',
        '& .MuiInputBase-root': {
          height: '35px', // ルート部分の高さを指定
        },
        '& .MuiInputBase-input': {
          height: '100%', // 入力フィールドをルートに合わせる
          textAlign: 'center',
        },
      }}
      onChange={(event) => handleInputChange(settingKey, event)}
      inputProps={{ min: 0 }}
    />
  );
};
