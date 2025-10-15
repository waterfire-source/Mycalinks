import { ConditionInputs } from '@/app/auth/setup/store/(setting)/condition/components/ConditionInputs';
import { ConditionSettingType } from '@/app/auth/setup/store/(setting)/condition/hooks/useConditionsSetup';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { palette } from '@/theme/palette';
import { Stack, Typography } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';

interface Props {
  conditions: ConditionSettingType[];
  setConditions: Dispatch<SetStateAction<ConditionSettingType[]>>;
}
export const ConditionSetting = ({ conditions, setConditions }: Props) => {
  const addCondition = () => {
    // 該当のカテゴリーに状態を追加
    setConditions([
      ...conditions,
      {
        id: undefined,
        name: '',
        sellPercent: 0,
        buyPercent: 0,
      },
    ]);
  };
  return (
    <Stack>
      <Typography variant="body1" textAlign="center">
        カードの状態とパーセンテージを設定してください。
        <br />
        パーセンテージは100%の状態の販売額・買取額を基準に設定してください
        <br />
        (※販売額に対する買取額の割合ではありません)
        <br />
        後から商品ごとに価格を設定することもできます
      </Typography>
      <Stack
        direction="row"
        borderBottom="1px solid"
        borderColor={palette.grey[300]}
        p={1}
        textAlign="center"
        width="100%"
      >
        <Typography variant="body1" width="25%">
          カテゴリ
        </Typography>
        <Typography variant="body1" width="25%">
          状態名
        </Typography>
        <Typography variant="body1" width="25%">
          販売％
        </Typography>
        <Typography variant="body1" width="25%">
          買取％
        </Typography>
      </Stack>
      <Stack
        direction="row"
        p={1}
        textAlign="center"
        width="100%"
        alignItems="start"
      >
        <Typography variant="body1" minWidth="25%" mt={1}>
          カード
        </Typography>
        <Stack gap={2} width="75%">
          {conditions.map((condition, index) => (
            <ConditionInputs
              key={index}
              width="100%"
              condition={condition}
              setConditions={setConditions}
              index={index}
            />
          ))}
          <SecondaryButton onClick={() => addCondition()}>
            状態を追加
          </SecondaryButton>
        </Stack>
      </Stack>
    </Stack>
  );
};
