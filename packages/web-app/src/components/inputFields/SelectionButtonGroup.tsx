import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SxProps, Theme } from '@mui/material';

interface Props {
  labels: string[]; // ボタンのラベル一覧
  onClick: (index: number) => void; // クリック時に選択されたボタンのインデックスを渡す関数
  initialSelectedIndex: number; // 初期選択するボタンのインデックス
  sx?: SxProps<Theme>; // スタイルのカスタマイズ用
  disabled?: boolean;
}

const SelectionButtonGroup = ({
  labels,
  onClick,
  initialSelectedIndex,
  sx,
  disabled,
}: Props) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(
    initialSelectedIndex,
  );

  useEffect(() => {
    setActiveIndex(initialSelectedIndex);
  }, [initialSelectedIndex]);

  const handleClick = (index: number) => {
    if (disabled) return;
    if (index !== activeIndex) {
      setActiveIndex(index);
      onClick(index);
    }
  };

  return (
    <Stack direction="row" spacing={2} sx={sx}>
      {labels.map((label, index) => (
        <Button
          key={index}
          variant="contained"
          sx={{
            backgroundColor: activeIndex === index ? 'grey.600' : 'white',
            color: activeIndex === index ? 'white' : 'black',
            paddingX: '12px',
            paddingY: '4px',
            height: 'auto',
            gap: '8px',
            minWidth: '100px',
            display: 'flex',
            alignItems: 'center',
            cursor: activeIndex === index ? 'default' : 'pointer',
            '&:hover': {
              backgroundColor: activeIndex === index ? 'grey.600' : 'grey.200',
            },
          }}
          onClick={activeIndex === index ? undefined : () => handleClick(index)}
        >
          <Typography variant="body2">{label}</Typography>
        </Button>
      ))}
    </Stack>
  );
};

export default SelectionButtonGroup;
