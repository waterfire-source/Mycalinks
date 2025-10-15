import { RelationSettingItem } from '@/app/auth/(dashboard)/store-shipment/components/RelationSettingItem';
import Loader from '@/components/common/Loader';
import { Box, Grid, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useGetRelationSetting } from '@/app/auth/(dashboard)/store-shipment/hooks/useGetRelationSetting';
import {
  FieldKey,
  FieldType,
  FormValue,
} from '@/app/auth/(dashboard)/store-shipment/type';

interface Props {
  selectedTab?: number;
}

export const RelationSettingContent = ({ selectedTab }: Props) => {
  // FormProviderからform制御オブジェクトを取得
  const { control, setValue } = useFormContext<FormValue>();
  // 選択肢データをフェッチするためのフック
  const {
    conditionFromOptions,
    conditionToOptions,
    genreFromOptions,
    genreToOptions,
    specialtyFromOptions,
    specialtyToOptions,
    categoryFromOptions,
    categoryToOptions,
    isLoading,
    fetchOptions,
  } = useGetRelationSetting({ selectedTab });

  // selectedTabが入ってきたら、データをフェッチ
  useEffect(() => {
    if (!selectedTab) return;
    fetchOptions();
  }, [fetchOptions, selectedTab]);

  // 各フィールドのuseFieldArrayを個別に定義
  const conditionArray = useFieldArray({
    control,
    name: 'condition_option',
  });

  const genreArray = useFieldArray({
    control,
    name: 'genre',
  });

  const specialtyArray = useFieldArray({
    control,
    name: 'specialty',
  });

  const categoryArray = useFieldArray({
    control,
    name: 'category',
  });

  // 共通のchange処理
  const handleFieldChange = (
    fieldName: keyof FormValue,
    index: number,
    field: FieldKey,
    value: number | null,
  ) => {
    setValue(`${fieldName}.${index}.${field}` as any, value);
  };

  // 共通のadd処理
  const handleAdd = (append: (value: any) => void, fieldType: FieldType) => {
    const defaultItem: {
      condition_option: { from_option_id: null; to_option_id: null };
      genre: { from_genre_id: null; to_genre_id: null };
      specialty: { from_specialty_id: null; to_specialty_id: null };
      category: { from_category_id: null; to_category_id: null };
    } = {
      condition_option: { from_option_id: null, to_option_id: null },
      genre: { from_genre_id: null, to_genre_id: null },
      specialty: { from_specialty_id: null, to_specialty_id: null },
      category: { from_category_id: null, to_category_id: null },
    };
    append(defaultItem[fieldType]);
  };

  if (isLoading)
    return (
      <Box
        sx={{
          height: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Loader
          sx={{
            bgcolor: 'transparent',
          }}
        />
      </Box>
    );

  return (
    <Box p={2}>
      <Typography>
        この店舗と出荷先の店舗の状態等の紐づけを行ってください。出荷先では自動で変換されます。
      </Typography>

      <Grid container mt={2} spacing={3}>
        {/* 状態のマッピング */}
        <RelationSettingItem
          typeTitle="状態"
          fields={conditionArray.fields}
          onAdd={() => handleAdd(conditionArray.append, 'condition_option')}
          onRemove={conditionArray.remove}
          onChange={(index, field, value) =>
            handleFieldChange('condition_option', index, field, value)
          }
          fromOptions={conditionFromOptions}
          toOptions={conditionToOptions}
          fieldName="condition_option"
        />

        {/* 独自ジャンルのマッピング */}
        <RelationSettingItem
          typeTitle="独自ジャンル"
          fields={genreArray.fields}
          onAdd={() => handleAdd(genreArray.append, 'genre')}
          onRemove={genreArray.remove}
          onChange={(index, field, value) =>
            handleFieldChange('genre', index, field, value)
          }
          fromOptions={genreFromOptions}
          toOptions={genreToOptions}
          fieldName="genre"
        />

        {/* 特殊状態のマッピング */}
        <RelationSettingItem
          typeTitle="特殊状態"
          fields={specialtyArray.fields}
          onAdd={() => handleAdd(specialtyArray.append, 'specialty')}
          onRemove={specialtyArray.remove}
          onChange={(index, field, value) =>
            handleFieldChange('specialty', index, field, value)
          }
          fromOptions={specialtyFromOptions}
          toOptions={specialtyToOptions}
          fieldName="specialty"
        />

        {/* 独自カテゴリのマッピング */}
        <RelationSettingItem
          typeTitle="独自カテゴリ"
          fields={categoryArray.fields}
          onAdd={() => handleAdd(categoryArray.append, 'category')}
          onRemove={categoryArray.remove}
          onChange={(index, field, value) =>
            handleFieldChange('category', index, field, value)
          }
          fromOptions={categoryFromOptions}
          toOptions={categoryToOptions}
          fieldName="category"
        />
      </Grid>
    </Box>
  );
};
