'use client';

import { useMemo, useState } from 'react';
import {
  FormControl,
  FormLabel,
  RadioGroup,
  Box,
  Button,
  Stack,
} from '@mui/material';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import Grey500whiteButton from '@/components/buttons/grey500whiteButton';
import { useStore } from '@/contexts/StoreContext';
import { Store } from '@prisma/client';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { TooltipRadio } from '@/components/radios/TooltipRadio';
import { TooltipFormControlLabel } from '@/components/tooltips/TooltipFormControlLabel';

export interface FormData {
  useWholesalePriceOrderColumn?: Store['use_wholesale_price_order_column']; //出庫順：仕入れ値の使い方のカラム指定 unit_price:値段  arrived_at:仕入れ日時
  useWholesalePriceOrderRule?: Store['use_wholesale_price_order_rule']; //出庫順：仕入れ値の使い方の並び替えルール  desc or asc
  returnWholesalePriceOrderColumn?: Store['return_wholesale_price_order_column']; //在庫復活順：仕入れ値の戻し方のカラム指定　unit_price:値段  arrived_at:仕入れ日時
  returnWholesalePriceOrderRule?: Store['return_wholesale_price_order_rule']; //在庫復活順：仕入れ値の戻し方の並び替えルール desc or asc
  wholesalePriceKeepRule?: 'individual' | 'average'; //仕入れ値決定方針：仕入れ値の保持ルール   individual:個別  average:整数
}

export default function WholesalePrice() {
  const { store } = useStore();
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    useWholesalePriceOrderColumn: store.use_wholesale_price_order_column,
    useWholesalePriceOrderRule: store.use_wholesale_price_order_rule,
    returnWholesalePriceOrderColumn: store.return_wholesale_price_order_column,
    returnWholesalePriceOrderRule: store.return_wholesale_price_order_rule,
    wholesalePriceKeepRule: store.wholesale_price_keep_rule,
  });

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSetDefault = () => {
    // デフォルト設定のボタン押下時に store の値を反映
    setFormData({
      wholesalePriceKeepRule: 'individual',
      useWholesalePriceOrderColumn: 'arrived_at',
      useWholesalePriceOrderRule: 'asc',
      returnWholesalePriceOrderColumn: 'arrived_at',
      returnWholesalePriceOrderRule: 'desc',
    });
  };

  //変更登録処理
  const handleRegister = async () => {
    const res = await clientAPI.store.updateWholesalePrice({
      storeID: store.id,
      ...formData,
    });
    if (res instanceof CustomError) {
      console.error('仕入れ値設定の変更に失敗しました。');
      setAlertState({
        message: `${res.status}:${res.message}`,
        severity: 'error',
      });
      return;
    }
    setAlertState({
      message: '仕入れ値設定の変更に成功しました。',
      severity: 'success',
    });
    setEditMode(false);
  };

  return (
    <ContainerLayout
      title="仕入れ値設定"
      actions={
        editMode ? (
          <Stack
            direction="row"
            gap="16px"
            sx={{ alignItems: 'center', display: 'flex' }}
          >
            <PrimaryButton onClick={handleRegister}>変更を確定</PrimaryButton>
            <Grey500whiteButton onClick={handleSetDefault}>
              デフォルト設定
            </Grey500whiteButton>
          </Stack>
        ) : (
          <Button variant="text" onClick={() => setEditMode(true)}>
            編集
          </Button>
        )
      }
    >
      <Box display="flex" flexDirection="column" gap={3} sx={{ ml: 2 }}>
        <FormControl component="fieldset">
          <FormLabel component="legend" sx={{ color: 'black' }}>
            仕入れ値決定方針
          </FormLabel>
          <RadioGroup
            row
            name="wholesalePriceKeepRule"
            value={formData.wholesalePriceKeepRule || ''}
            onChange={handleRadioChange}
          >
            <TooltipRadio
              value="individual"
              label="個別"
              tooltip="仕入れ値の値をそのまま用います。"
              disabled={!editMode}
              onChange={handleRadioChange}
              checked={formData.wholesalePriceKeepRule === 'individual'}
            />
            <TooltipRadio
              value="average"
              label="平均値（整数値）"
              tooltip="仕入れ値の合計を保持したまま最も平均値に近い整数値に設定します。商品間で誤差が生じる可能性があります。"
              disabled={!editMode}
              onChange={handleRadioChange}
              checked={formData.wholesalePriceKeepRule === 'average'}
            />
          </RadioGroup>
        </FormControl>

        <FormControl component="fieldset">
          <FormLabel component="legend" sx={{ color: 'black' }}>
            出庫順
          </FormLabel>
          <RadioGroup
            row
            name="useWholesalePricePolicy"
            value={`${formData.useWholesalePriceOrderColumn}_${formData.useWholesalePriceOrderRule}`}
            onChange={(event) => {
              const match = event.target.value.match(/^(.*)_(asc|desc)$/);
              if (match) {
                const [_, column, rule] = match; // match[1]: column, match[2]: rule
                setFormData((prev) => ({
                  ...prev,
                  useWholesalePriceOrderColumn:
                    column as Store['use_wholesale_price_order_column'],
                  useWholesalePriceOrderRule:
                    rule as Store['use_wholesale_price_order_rule'],
                }));
              }
            }}
          >
            <TooltipFormControlLabel
              value="arrived_at_asc"
              label="仕入れ時期古い順"
              tooltip="仕入れた時期の古いものから出庫します。"
              disabled={!editMode}
            />
            <TooltipFormControlLabel
              value="arrived_at_desc"
              label="仕入れ時期新しい順"
              tooltip="仕入れた時期の新しいものから出庫します。"
              disabled={!editMode}
            />
            <TooltipFormControlLabel
              value="unit_price_asc"
              label="仕入れ値低い順"
              tooltip="仕入れ値の低いものから出庫します。"
              disabled={!editMode}
            />
            <TooltipFormControlLabel
              value="unit_price_desc"
              label="仕入れ値高い順"
              tooltip="仕入れ値の高いものから出庫します。"
              disabled={!editMode}
            />
          </RadioGroup>
        </FormControl>

        {/* <FormControl component="fieldset">
          <FormLabel component="legend" sx={{ color: 'black' }}>
            在庫復活順
          </FormLabel>
          <RadioGroup
            row
            name="returnWholesalePricePolicy"
            value={`${formData.returnWholesalePriceOrderColumn}_${formData.returnWholesalePriceOrderRule}`}
            onChange={(event) => {
              const match = event.target.value.match(/^(.*)_(asc|desc)$/);
              if (match) {
                const [_, column, rule] = match; // match[1]: column, match[2]: rule
                setFormData((prev) => ({
                  ...prev,
                  returnWholesalePriceOrderColumn:
                    column as Store['return_wholesale_price_order_column'],
                  returnWholesalePriceOrderRule:
                    rule as Store['return_wholesale_price_order_rule'],
                }));
              }
            }}
          >
            <TooltipFormControlLabel
              value="arrived_at_asc"
              label="仕入れ時期古い順"
              tooltip="仕入れた時期の古いものから在庫復活します。"
              disabled={!editMode}
            />
            <TooltipFormControlLabel
              value="arrived_at_desc"
              label="仕入れ時期新しい順"
              tooltip="仕入れた時期の新しいものから在庫復活します。"
              disabled={!editMode}
            />
            <TooltipFormControlLabel
              value="unit_price_asc"
              label="仕入れ値低い順"
              tooltip="仕入れ値の低いものから在庫復活します。"
              disabled={!editMode}
            />
            <TooltipFormControlLabel
              value="unit_price_desc"
              label="仕入れ値高い順"
              tooltip="仕入れ値の高いものから在庫復活します。"
              disabled={!editMode}
            />
          </RadioGroup>
        </FormControl> */}
      </Box>
    </ContainerLayout>
  );
}
