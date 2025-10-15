import { MenuItem, Radio, Select, Stack, Typography } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { RoundRule, TaxMode } from '@prisma/client';
interface Props {
  tax: TaxMode;
  setTax: Dispatch<SetStateAction<TaxMode>>;
  round: number;
  setRound: Dispatch<SetStateAction<number>>;
  roundType: RoundRule;
  setRoundType: Dispatch<SetStateAction<RoundRule>>;
}
export const PriceSetting = ({
  tax,
  setTax,
  round,
  setRound,
  roundType,
  setRoundType,
}: Props) => {
  const roundResult = (price: number) => {
    switch (roundType) {
      case RoundRule.UP:
        return Math.ceil(price / round) * round;
      case RoundRule.DOWN:
        return Math.floor(price / round) * round;
      case RoundRule.ROUND:
        return Math.round(price / round) * round;
      default:
        return price;
    }
  };

  return (
    <Stack>
      <Typography variant="h1">表示金額設定</Typography>
      <Stack px={3} py={2}>
        <Typography variant="body1">税込・税抜</Typography>
        <Stack direction="row" alignItems="center" gap={4}>
          <Stack direction="row" gap={1} alignItems="center">
            <Radio
              checked={tax === TaxMode.INCLUDE}
              onChange={() => setTax(TaxMode.INCLUDE)}
              value={TaxMode.INCLUDE}
            />
            <Typography variant="body1">税込</Typography>
          </Stack>
          <Stack direction="row" gap={1} alignItems="center">
            <Radio
              checked={tax === TaxMode.EXCLUDE}
              onChange={() => setTax(TaxMode.EXCLUDE)}
              value={TaxMode.EXCLUDE}
            />
            <Typography variant="body1">税抜</Typography>
          </Stack>
        </Stack>
        <Stack gap={1}>
          <Typography variant="body1">端数処理</Typography>
          <Stack direction="row" gap={1} alignItems="center">
            <Select
              size="small"
              value={round}
              onChange={(e) => setRound(Number(e.target.value))}
            >
              <MenuItem value={10}>1の位</MenuItem>
              <MenuItem value={100}>10の位</MenuItem>
              <MenuItem value={1000}>100の位</MenuItem>
            </Select>
            を
            <Select
              size="small"
              value={roundType}
              onChange={(e) => setRoundType(e.target.value as RoundRule)}
            >
              <MenuItem value={RoundRule.UP}>切り上げ</MenuItem>
              <MenuItem value={RoundRule.DOWN}>切り捨て</MenuItem>
              <MenuItem value={RoundRule.ROUND}>四捨五入</MenuItem>
            </Select>
            <Typography variant="body1">
              (555,555→{roundResult(555555).toLocaleString()}){' '}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
