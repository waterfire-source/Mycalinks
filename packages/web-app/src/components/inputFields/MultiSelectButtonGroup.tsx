import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { SxProps, Theme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface Option {
  label: string;
  value: string;
}

interface Props {
  options: Option[]; // ボタンのラベルとバリューの配列
  selectedValues?: string[]; // 初期選択済みのバリュー一覧
  onChange: (selected: string[]) => void; // 変更時に選択済みのバリュー一覧を渡す関数
  sx?: SxProps<Theme>; // スタイルのカスタマイズ用
}

const MultiSelectButtonGroup = ({
  options,
  selectedValues = [],
  onChange,
  sx,
}: Props) => {
  const handleClick = (value: string) => {
    const newSelected = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];

    onChange(newSelected);
  };

  return (
    <Grid container spacing={2} sx={{ justifyContent: 'flex-start', ...sx }}>
      {options.map(({ label, value }) => (
        <Grid
          item
          key={value}
          sx={{ display: 'flex', justifyContent: 'center' }}
        >
          <Button
            variant={selectedValues.includes(value) ? 'contained' : 'text'}
            sx={{
              backgroundColor: selectedValues.includes(value)
                ? 'grey.600'
                : 'grey.300',
              color: selectedValues.includes(value) ? 'white' : 'black',
              paddingX: '12px',
              paddingY: '4px',
              height: 'auto',
              minWidth: `${label.length * 14 + 75}px`, // ラベルの長さに応じて幅を調整
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: selectedValues.includes(value)
                  ? 'grey.700'
                  : 'grey.200',
              },
            }}
            onClick={() => handleClick(value)}
          >
            <Typography
              variant="body2"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              {label}{' '}
              {selectedValues.includes(value) && (
                <CheckCircleIcon fontSize="small" />
              )}
            </Typography>
          </Button>
        </Grid>
      ))}
    </Grid>
  );
};

export default MultiSelectButtonGroup;
