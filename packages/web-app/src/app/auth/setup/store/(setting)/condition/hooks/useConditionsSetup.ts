import { useState } from 'react';

export interface ConditionSettingType {
  id: number | undefined;
  name: string;
  sellPercent: number;
  buyPercent: number;
}

export const useConditionsSetup = () => {
  const [conditions, setConditions] = useState<ConditionSettingType[]>([
    {
      id: undefined,
      name: '',
      sellPercent: 100,
      buyPercent: 100,
    },
  ]);
  // 状態を追加
  const addCondition = () => {
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
  return { conditions, addCondition, setConditions };
};
