'use client';

import React, { useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
  Checkbox,
  FormControlLabel,
  Grid,
} from '@mui/material';
import { useStore } from '@/contexts/StoreContext';
import { ImagePicker } from '@/components/cards/ImagePicker';
import { RegisterItemFormData } from '@/app/auth/(dashboard)/item/components/ItemRegisterModal';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { useGenre } from '@/feature/genre/hooks/useGenre';
import { NoSpinTextField } from '@/components/common/NoSpinTextField';
import { toHalfWidthOnly } from '@/utils/convertToHalfWidth';
import Image from 'next/image';
import { CartonCreateButton } from '@/app/auth/(dashboard)/item/components/CartonCreateButton';
import { FormattedItem } from '@/components/dataGrid/RightClickDataGrid';
import { ItemCategoryHandle } from '@prisma/client';
import NumericTextField from '@/components/inputFields/NumericTextField';

interface RegisterFormProps {
  formData: RegisterItemFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegisterItemFormData>>;
  item: FormattedItem | null;
  isEdit: boolean;
  stockNumber?: number;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  formData,
  setFormData,
  item,
  isEdit,
  stockNumber,
}) => {
  const { store } = useStore();
  const { genre, fetchGenreList } = useGenre();
  const { category, fetchCategoryList } = useCategory();
  //初回読み込み
  useEffect(() => {
    if (!store.id) return;

    fetchGenreList();
    fetchCategoryList();
  }, []);

  //入力値変更ハンドラー
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // 共通のチェックボックス変更処理
  const handleCheckboxChange = (
    name: keyof RegisterItemFormData,
    checked: boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // NumericTextField用のハンドラー関数
  const handleNumericChange = (
    fieldName: keyof RegisterItemFormData,
    value: number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // 独自商品を登録の場合は、システムで作られるカテゴリを抜く
  const EXCLUDED_HANDLES: ItemCategoryHandle[] = [
    ItemCategoryHandle.ORIGINAL_PACK,
    ItemCategoryHandle.LUCKY_BAG,
    ItemCategoryHandle.DECK,
    ItemCategoryHandle.BUNDLE,
  ];

  const filteredCategories = category?.itemCategories?.filter((category) => {
    if (isEdit) return true;
    // 独自カテゴリは表示する
    if (!category.handle) return true;
    return !EXCLUDED_HANDLES.includes(category.handle);
  });

  return (
    <Box sx={{ display: 'flex', gap: '20px', mb: 3 }}>
      <Grid container spacing={4}>
        <Grid item xs={3}>
          {/* 画像部分 */}
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
              mb: 4,
            }}
          >
            {formData.image_url ? (
              <Image
                src={formData.image_url}
                alt="Selected"
                width={150}
                height={200}
              />
            ) : (
              <Box
                sx={{
                  width: '150px',
                  height: '200px',
                  border: '1px dashed gray',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: 'gray',
                }}
              >
                画像を選択
              </Box>
            )}
            <ImagePicker
              kind="item"
              onImageUploaded={(url: string | null) => {
                setFormData((prev: RegisterItemFormData) => ({
                  ...prev,
                  image_url: url,
                }));
              }}
            />
          </Box>

          {/* 共通項目描画関数 */}
          {[
            { label: '販売価格', name: 'sell_price', type: 'numeric' },
            { label: '買取価格', name: 'buy_price', type: 'numeric' },
            ...(!isEdit
              ? []
              : [
                  {
                    label: '在庫数',
                    name: 'stock_count',
                    type: 'static',
                    value: formData.infinite_stock ? '∞' : stockNumber, // 無限在庫なら"∞"を表示
                  },
                ]),
          ].map((field) =>
            field.type === 'numeric' ? (
              <Box
                key={field.name}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Box sx={{ width: 80 }}>
                  <Typography>{field.label}</Typography>
                </Box>
                <Box sx={{ width: 'calc(100% - 120px)' }}>
                  <NumericTextField
                    value={
                      (formData[
                        field.name as keyof RegisterItemFormData
                      ] as number) || 0
                    }
                    onChange={(value) =>
                      handleNumericChange(
                        field.name as keyof RegisterItemFormData,
                        value,
                      )
                    }
                    min={0}
                    noSpin={true}
                    endSuffix="円"
                    size="small"
                    sx={{ width: '100%' }}
                  />
                </Box>
              </Box>
            ) : field.type === 'input' ? (
              <Box
                key={field.name}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Box sx={{ width: 80 }}>
                  <Typography>{field.label}</Typography>
                </Box>
                <Box sx={{ width: 'calc(100% - 120px)' }}>
                  <NoSpinTextField
                    type="number"
                    fullWidth
                    size="small"
                    name={field.name}
                    value={
                      formData[field.name as keyof RegisterItemFormData] ?? ''
                    }
                    onChange={handleChange}
                    required={false}
                    sx={{
                      '& input': {
                        textAlign: 'left',
                        padding: '8px',
                        backgroundColor: 'white',
                      },
                    }}
                  />
                </Box>
              </Box>
            ) : (
              <Box
                key={field.name}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Box sx={{ width: 80 }}>
                  <Typography>{field.label}</Typography>
                </Box>
                <Box sx={{ width: 'calc(100% - 120px)' }}>
                  <Typography>{field.value}</Typography>
                </Box>
              </Box>
            ),
          )}

          {/* カートンマスタ追加ボタン */}
          {item && <CartonCreateButton itemId={item.id} />}
        </Grid>

        <Grid item xs={6}>
          {[
            { label: '商品名', name: 'display_name', required: true },
            { label: '商品名カナ', name: 'display_name_ruby', required: false },
            {
              label: 'レアリティ',
              name: 'rarity',
              required: false,
            },
            { label: '封入パック', name: 'pack_name', required: false },
            {
              label: '表示順',
              name: 'order_number',
              required: false,
              type: 'number',
            },
            {
              label: 'エキスパンション',
              name: 'expansion',
              required: false,
            },
            {
              label: 'カード番号',
              name: 'cardnumber',
              required: false,
              type: 'half',
            },
            { label: 'キーワード', name: 'keyword', required: false },
            {
              label: 'JANコード',
              name: 'readonly_product_code',
              required: false,
              type: 'half',
            }, // JANコード（カンマ区切りで複数登録）
          ].map((field) => (
            <Box
              key={field.name}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Box
                sx={{
                  width: 150,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'left',
                }}
              >
                <Typography>
                  {field.label}
                  {field.required && (
                    <Typography
                      sx={{
                        backgroundColor: 'grey.500',
                        color: 'white',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        display: 'inline-block',
                        ml: 1,
                      }}
                      variant="caption"
                    >
                      必須
                    </Typography>
                  )}
                </Typography>
              </Box>

              <Box sx={{ width: 'calc(100% - 100px)' }}>
                <TextField
                  fullWidth
                  name={field.name}
                  value={
                    formData[field.name as keyof RegisterItemFormData] ?? ''
                  }
                  onChange={(e) => {
                    const value =
                      field.type === 'half' || field.type === 'number'
                        ? toHalfWidthOnly(e.target.value)
                        : e.target.value;

                    const name = e.target.name;

                    setFormData((prevData) => ({
                      ...prevData,
                      [name]: value,
                    }));
                  }}
                  required={field.required}
                  sx={{
                    '& input': {
                      textAlign: 'left',
                      padding: '8px',
                      backgroundColor: 'white',
                    },
                  }}
                />
              </Box>
            </Box>
          ))}

          {/* ジャンル */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Box sx={{ width: 150 }}>
              <Typography>
                ジャンル
                <Typography
                  sx={{
                    backgroundColor: 'grey.500',
                    color: 'white',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    display: 'inline-block',
                    ml: 1,
                  }}
                  variant="caption"
                >
                  必須
                </Typography>
              </Typography>
            </Box>
            <Box sx={{ width: 'calc(100% - 100px)' }}>
              <FormControl fullWidth size="small" disabled={isEdit}>
                <Select
                  labelId="genre-select-label"
                  name="genre_id"
                  value={formData.genre_id?.toString() ?? ''} // number を string に変換
                  onChange={(e: SelectChangeEvent<string>) => {
                    setFormData((prev) => ({
                      ...prev,
                      genre_id: e.target.value
                        ? Number(e.target.value)
                        : undefined, // 型を合わせる
                    }));
                  }}
                  sx={{
                    backgroundColor: 'white',
                  }}
                >
                  {genre?.itemGenres.map((genre) => (
                    <MenuItem key={genre.id} value={genre.id.toString()}>
                      {genre.display_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* カテゴリ */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Box sx={{ width: 150 }}>
              <Typography>
                カテゴリ
                <Typography
                  sx={{
                    backgroundColor: 'grey.500',
                    color: 'white',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    display: 'inline-block',
                    ml: 1,
                  }}
                  variant="caption"
                >
                  必須
                </Typography>
              </Typography>
            </Box>
            <Box sx={{ width: 'calc(100% - 100px)' }}>
              <FormControl fullWidth size="small" disabled={isEdit}>
                <Select
                  labelId="category-select-label"
                  name="category_id"
                  value={formData.category_id?.toString() ?? ''} // number を string に変換
                  onChange={(e: SelectChangeEvent<string>) => {
                    setFormData((prev) => ({
                      ...prev,
                      category_id: e.target.value
                        ? Number(e.target.value)
                        : undefined, // 型を合わせる
                    }));
                  }}
                  sx={{
                    backgroundColor: 'white',
                  }}
                >
                  {filteredCategories?.map((category) => (
                    <MenuItem key={category.id} value={category.id.toString()}>
                      {category.display_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={3}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* 買取専用 */}
            <FormControl fullWidth>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_buy_only}
                    onChange={(e) =>
                      handleCheckboxChange('is_buy_only', e.target.checked)
                    }
                    sx={{
                      '& .MuiSvgIcon-root': { color: 'grey.700' },
                      '&.Mui-disabled .MuiSvgIcon-root': {
                        opacity: 0.3,
                      },
                    }}
                  />
                }
                label="買取専用"
              />
              <Typography variant="caption">
                ※チェックをつけると、買取終了時に自動でラベルが印刷されなくなります
              </Typography>
            </FormControl>

            {/* 端数処理を行う 入力時は値を反転 端数処理を行いたくない場合はチェックが付くように*/}
            <FormControl fullWidth>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!formData.allow_round} // 反転させる
                    onChange={
                      (e) =>
                        handleCheckboxChange('allow_round', !e.target.checked) // 反転した値をセット
                    }
                    sx={{
                      '& .MuiSvgIcon-root': { color: 'grey.700' },
                      '&.Mui-disabled .MuiSvgIcon-root': {
                        opacity: 0.3,
                      },
                    }}
                  />
                }
                label="端数処理を無効にする"
              />
            </FormControl>

            {/* 自動印刷 */}
            <FormControl fullWidth>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.allow_auto_print_label}
                    onChange={(e) =>
                      handleCheckboxChange(
                        'allow_auto_print_label',
                        e.target.checked,
                      )
                    }
                    sx={{
                      '& .MuiSvgIcon-root': { color: 'grey.700' },
                      '&.Mui-disabled .MuiSvgIcon-root': {
                        opacity: 0.3,
                      },
                    }}
                  />
                }
                label="自動印刷"
              />
            </FormControl>

            {/* 在庫数無限商品 */}
            <FormControl fullWidth>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.infinite_stock}
                    onChange={
                      () => handleCheckboxChange('infinite_stock', true) // trueにしかできない
                    }
                    // マイカ商品の場合は無限在庫を変更できないようにする。無限商品を元に戻ることもできない
                    disabled={Boolean(formData.myca_item_id)}
                    sx={{
                      '& .MuiSvgIcon-root': { color: 'grey.700' },
                      '&.Mui-disabled .MuiSvgIcon-root': {
                        opacity: 0.3,
                      },
                    }}
                  />
                }
                label="在庫数無限商品"
              />
              <Typography variant="caption">
                ※大会参加費などにご利用頂けます。
                <br />
                ※mycalinksから追加した商品の場合は設定できません。
                <br />
                ※一度無限商品に設定したら元に戻すことはできません。
              </Typography>
            </FormControl>
            {
              <FormControl fullWidth>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!formData.tablet_allowed}
                      onChange={(e) =>
                        handleCheckboxChange(
                          'tablet_allowed',
                          !e.target.checked,
                        )
                      }
                      sx={{
                        '& .MuiSvgIcon-root': { color: 'grey.700' },
                        '&.Mui-disabled .MuiSvgIcon-root': {
                          opacity: 0.3,
                        },
                      }}
                    />
                  }
                  label="店舗タブレットに表示しない"
                />
              </FormControl>
            }

            {isEdit && (
              <>
                {/* 商品一覧に表示しない */}
                <FormControl fullWidth>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.hide}
                        onChange={(e) =>
                          handleCheckboxChange('hide', e.target.checked)
                        }
                        sx={{
                          '& .MuiSvgIcon-root': { color: 'grey.700' },
                          '&.Mui-disabled .MuiSvgIcon-root': {
                            opacity: 0.3,
                          },
                        }}
                      />
                    }
                    label="商品マスタに表示しない"
                  />
                </FormControl>
              </>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
