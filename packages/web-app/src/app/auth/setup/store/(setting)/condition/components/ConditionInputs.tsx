import { ConditionSettingType } from '@/app/auth/setup/store/(setting)/condition/hooks/useConditionsSetup';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { TextField } from '@mui/material';
import { Stack } from '@mui/material';
import { ChangeEvent, Dispatch, SetStateAction } from 'react';

interface Props {
  index: number;
  width: string;
  condition: ConditionSettingType;
  setConditions: Dispatch<SetStateAction<ConditionSettingType[]>>;
}

export const ConditionInputs = ({
  width,
  condition,
  setConditions,
  index,
}: Props) => {
  const changeConditionName = (e: ChangeEvent<HTMLInputElement>) => {
    setConditions((prev) =>
      // 新規作成したものはidがundefinedなので、indexを使って判断
      prev.map((c, i) => (i === index ? { ...c, name: e.target.value } : c)),
    );
  };
  const changeConditionSellPercent = (value: number) => {
    setConditions((prev) =>
      // 新規作成したものはidがundefinedなので、indexを使って判断
      prev.map((c, i) => (i === index ? { ...c, sellPercent: value } : c)),
    );
  };
  const changeConditionBuyPercent = (value: number) => {
    setConditions((prev) =>
      // 新規作成したものはidがundefinedなので、indexを使って判断
      prev.map((c, i) => (i === index ? { ...c, buyPercent: value } : c)),
    );
  };
  // indexが0の時は100%固定で変更できない
  return (
    <Stack direction="row" gap={2} width={width}>
      <TextField
        value={condition.name}
        onChange={changeConditionName}
        sx={{ flexGrow: 1 }}
        size="small"
      />
      <NumericTextField
        value={condition.sellPercent}
        onChange={(value) => changeConditionSellPercent(value)}
        sx={{ flexGrow: 1 }}
        size="small"
        disabled={index === 0}
        max={100}
        min={0}
      />
      <NumericTextField
        value={condition.buyPercent}
        onChange={(value) => changeConditionBuyPercent(value)}
        sx={{ flexGrow: 1 }}
        size="small"
        disabled={index === 0}
        max={100}
        min={0}
      />
    </Stack>
  );
};
