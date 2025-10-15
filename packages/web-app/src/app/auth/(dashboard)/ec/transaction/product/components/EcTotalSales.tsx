import TextField from '@mui/material/TextField';

interface Props {
  totalAmount: number;
}

export const EcTotalSales = ({ totalAmount }: Props) => {
  return (
    <TextField
      label="表示中の合計売上"
      size="small"
      value={Number(totalAmount).toLocaleString() + '円'}
      sx={{
        backgroundColor: 'white',
        color: 'primary.main',
        width: '150px',
      }}
      InputLabelProps={{
        shrink: true,
        sx: {
          color: 'text.primary',
        },
      }}
      InputProps={{
        readOnly: true,
        sx: {
          color: 'secondary.main',
        },
      }}
    />
  );
};
