import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
} from '@mui/material';

interface StockChangeCardProps {
  id: number; // ID
  stockChange: string; // 在庫変更内容
  destination: string; // 商品名など
  note: string; // 備考
  condition: string; // 状態
  onDelete: (id: number) => void; // 削除ボタンのコールバック
  onNoteChange: (id: number, newNote: string) => void; // 備考変更のコールバック
}

export function StockChangeCard(props: StockChangeCardProps) {
  const { id, stockChange, destination, condition, onDelete, onNoteChange } =
    props;

  const handleNoteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onNoteChange(id, event.target.value);
  };

  return (
    <Card
      variant="elevation"
      sx={{
        display: 'flex', // カード全体をフレックスボックスにする
        alignItems: 'center', // 縦方向の中央揃え
        boxShadow: 'none',
      }}
    >
      <CardContent
        sx={{
          flex: 1,
          padding: '8px',
          '&:last-child': { paddingBottom: '8px' },
        }}
      >
        <Typography sx={{ fontSize: '12px' }}>
          変更在庫数（在庫変動）：{stockChange}
        </Typography>
        <Typography
          component="div"
          sx={{
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>変更先：{destination}</span>
          <span>{condition}</span>
        </Typography>
        <TextField
          value={props.note}
          placeholder="備考を入力してください"
          onChange={handleNoteChange}
          fullWidth
          size="small"
          InputProps={{
            sx: { fontSize: '12px', color: 'black' },
          }}
          InputLabelProps={{
            sx: { fontSize: '10px', color: 'black' }, // ラベルのフォントサイズと文字色
          }}
          sx={{ marginTop: '8px' }}
        />
      </CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', paddingRight: '8px' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onDelete(id)}
          sx={{
            minWidth: '40px',
            padding: '2px 8px',
            fontSize: '10px',
            color: 'black',
            borderColor: 'black',
            backgroundColor: 'white',
            '&:hover': {
              borderColor: 'black',
            },
          }}
        >
          削除
        </Button>
      </Box>
    </Card>
  );
}
