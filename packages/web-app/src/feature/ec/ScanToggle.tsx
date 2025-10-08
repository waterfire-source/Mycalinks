import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';

interface Props {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

// ピッキング時のスキャン機能
export const ScanToggle = ({ enabled, onChange }: Props) => {
  return (
    <Box
      sx={{
        alignItems: 'center',
        gap: 1,
        width: '200px',
      }}
    >
      <Typography variant="body2" sx={{ textAlign: 'center', width: '200px' }}>
        ピッキング時のスキャン機能
      </Typography>
      <RadioGroup
        row
        value={enabled} // 現在のスキャン機能の状態を反映
        onChange={(e) => onChange(e.target.value === 'true')} // イベントから取得した値をbooleanに変換
        sx={{ display: 'flex', justifyContent: 'center', ml: 1 }}
      >
        <FormControlLabel
          value={true} // スキャン機能をONにするための値
          control={<Radio size="small" />}
          label={
            <Typography
              variant="caption"
              color={enabled ? 'primary.main' : 'grey.500'}
            >
              ON
            </Typography>
          }
          sx={{ mr: 1 }}
        />
        <FormControlLabel
          value={false} // スキャン機能をOFFにするための値
          control={<Radio size="small" />}
          label={
            <Typography
              variant="caption"
              color={!enabled ? 'primary.main' : 'grey.500'}
            >
              OFF
            </Typography>
          }
        />
      </RadioGroup>
    </Box>
  );
};
