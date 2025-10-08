import {
  Grid,
  Stack,
  Typography,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import React from 'react';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { Controller, useFormContext } from 'react-hook-form';
import {
  FieldItem,
  FieldKey,
  FieldType,
  FromFieldKey,
  SelectOption,
  ToFieldKey,
} from '@/app/auth/(dashboard)/store-shipment/type';

interface Props {
  typeTitle: string;
  fields?: FieldItem[]; // マッピング設定済みのものは自動で選択されて入ってくる
  onAdd?: () => void;
  onRemove?: (index: number) => void;
  onChange?: (index: number, field: FieldKey, value: number | null) => void;
  fromOptions?: SelectOption[];
  toOptions?: SelectOption[];
  fieldName: FieldType;
}

/**
 * マッピング関係を設定するためのセレクトボックスを利用したUIコンポーネント。
 * React Hook Formと連携して動的なフィールド追加・削除・編集が可能。
 */
export const RelationSettingItem = ({
  typeTitle,
  fields = [],
  onAdd,
  onRemove,
  onChange,
  fromOptions = [],
  toOptions = [],
  fieldName,
}: Props) => {
  const { control } = useFormContext();

  /**
   * この店舗のフィールド名を動的に取得する関数
   */
  const getFromFieldName = (fieldName: FieldType): FromFieldKey => {
    const fieldMap: Record<FieldType, FromFieldKey> = {
      condition_option: 'from_option_id',
      genre: 'from_genre_id',
      specialty: 'from_specialty_id',
      category: 'from_category_id',
    };
    return fieldMap[fieldName];
  };

  /**
   * 出荷先店舗のフィールド名を動的に取得する関数
   */
  const getToFieldName = (fieldName: FieldType): ToFieldKey => {
    const fieldMap: Record<FieldType, ToFieldKey> = {
      condition_option: 'to_option_id',
      genre: 'to_genre_id',
      specialty: 'to_specialty_id',
      category: 'to_category_id',
    };
    return fieldMap[fieldName];
  };

  return (
    <Grid item xs={5} width={'100%'}>
      <Stack direction="row" py={1}>
        <Typography flex={1}>この店舗の{typeTitle}</Typography>
        <Typography flex={1}>出荷先店舗の{typeTitle}</Typography>
      </Stack>

      {fields.map((field, index) => (
        <Stack
          key={field.id}
          direction="row"
          pt={1}
          spacing={2}
          alignItems="center"
        >
          {/* この店舗の選択肢 */}
          <Stack flex={1}>
            <Controller
              name={`${fieldName}.${index}.${getFromFieldName(fieldName)}`}
              control={control}
              render={({ field: controllerField }) => (
                <Select
                  size="small"
                  value={controllerField.value ?? ''}
                  sx={{ backgroundColor: 'white' }}
                  onChange={(e) => {
                    const value =
                      e.target.value === '' ? null : Number(e.target.value);
                    controllerField.onChange(value);
                    onChange?.(index, getFromFieldName(fieldName), value);
                  }}
                >
                  <MenuItem value="">選択してください</MenuItem>
                  {fromOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </Stack>

          <Stack flex={1}>
            {/* 出荷先の選択肢 */}
            <Controller
              name={`${fieldName}.${index}.${getToFieldName(fieldName)}`}
              control={control}
              render={({ field: controllerField }) => (
                <Select
                  size="small"
                  value={controllerField.value ?? ''}
                  sx={{ backgroundColor: 'white' }}
                  onChange={(e) => {
                    const value =
                      e.target.value === '' ? null : Number(e.target.value);
                    controllerField.onChange(value);
                    onChange?.(index, getToFieldName(fieldName), value);
                  }}
                >
                  <MenuItem value="">選択してください</MenuItem>
                  {toOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </Stack>

          {/* 削除ボタン */}
          <IconButton size="small" onClick={() => onRemove?.(index)}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      ))}

      {/* 追加ボタン */}
      <Stack direction="row" pt={2}>
        <SecondaryButton onClick={onAdd}>＋</SecondaryButton>
      </Stack>
    </Grid>
  );
};
