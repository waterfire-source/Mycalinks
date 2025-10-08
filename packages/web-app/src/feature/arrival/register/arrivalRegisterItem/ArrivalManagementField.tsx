import { CustomArrivalProductSearchType } from '@/app/auth/(dashboard)/arrival/register/page';
import { TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';

type Props = {
  id: string;
  onChange: <K extends keyof CustomArrivalProductSearchType>(
    customId: string,
    key: K,
    value: CustomArrivalProductSearchType[K],
  ) => void;
  initValue: string;
};

//なぜか(a, i, u, e, o)以外日本語にならずに確定してしまうのでこのコンポーネント内でState管理してonChangeに渡している。
export const ArrivalManagementField = ({ id, onChange, initValue }: Props) => {
  const [inputValue, setInputValue] = useState(initValue);

  useEffect(() => {
    onChange(id, 'management_number', inputValue);
  }, [inputValue]);

  useEffect(() => {
    setInputValue(initValue);
  }, [initValue]);

  return (
    <TextField
      size="small"
      type="text"
      label="管理番号"
      value={inputValue}
      InputLabelProps={{
        shrink: true,
        sx: {
          color: 'grey.700', // フォーカスしてないときの色
        },
      }}
      onChange={(e) => {
        setInputValue(e.target.value);
      }}
    />
  );
};
