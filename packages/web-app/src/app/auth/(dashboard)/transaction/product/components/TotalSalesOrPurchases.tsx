import TextField from '@mui/material/TextField';

interface Props {
  totalAmount: { sell: number; buy: number };
  type: 'sell' | 'buy';
  handleStartDateChange: React.ChangeEventHandler<HTMLInputElement>;
}

export const TotalSalesOrPurchases = ({
  totalAmount,
  type,
  handleStartDateChange,
}: Props) => {
  const formatLabel = () => {
    const typeLabel = type === 'sell' ? '販売' : '買取';
    return `${typeLabel}合計`;

    // 横幅の関係で期間を省略した
    // const formattedStartDate = dayjs(searchDate.startDate).format('YYYY/MM/DD');
    // const formattedEndDate = dayjs(searchDate.endDate).format('YYYY/MM/DD');
    // if (searchDate.startDate === '') {
    //   return `～${formattedEndDate}の${typeLabel}合計`;
    // } else if (searchDate.endDate === '') {
    //   return `${formattedStartDate}～の${typeLabel}合計`;
    // } else if (formattedStartDate === formattedEndDate) {
    //   return `${formattedStartDate}の${typeLabel}合計`;
    // } else {
    //   return `${formattedStartDate}~${formattedEndDate} の${typeLabel}合計`;
    // }
  };

  const value = type === 'sell' ? totalAmount.sell : totalAmount.buy;

  return (
    <TextField
      label={formatLabel()}
      size="small"
      value={Number(value).toLocaleString() + '円'}
      onChange={handleStartDateChange}
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
          color: type === 'sell' ? 'secondary.main' : 'primary.main',
        },
      }}
    />
  );
};
