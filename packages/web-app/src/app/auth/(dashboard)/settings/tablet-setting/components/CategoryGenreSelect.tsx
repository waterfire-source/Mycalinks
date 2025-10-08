import { CategoryGenreList } from '@/app/auth/(dashboard)/settings/tablet-setting/hooks/useAllowedGenreCategories';
import {
  Stack,
  Typography,
  IconButton,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { Dispatch, SetStateAction, useEffect } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { GenreAPIRes } from '@/api/frontend/genre/api';
import { CategoryAPIRes } from '@/api/frontend/category/api';
import { useGetSpecialty } from '@/feature/specialty/hooks/useGetSpecialty';
interface Props {
  index: number;
  categoryList: CategoryAPIRes['getCategoryAll']['itemCategories'];
  genreList: GenreAPIRes['getGenreAll']['itemGenres'];
  categoryGenre: CategoryGenreList;
  setAllowedGenreCategories: Dispatch<SetStateAction<CategoryGenreList[]>>;
}

export const CategoryGenreSelect = ({
  index,
  categoryList,
  genreList,
  categoryGenre,
  setAllowedGenreCategories,
}: Props) => {
  const { fetchSpecialty, specialties } = useGetSpecialty();

  useEffect(() => {
    fetchSpecialty();
  }, [fetchSpecialty]);

  const targetConditionList = categoryList.find(
    (item) => item.id === categoryGenre.categoryId,
  )?.condition_options;

  // ジャンルを選択したときの処理
  const handleSetGenre = (genreId: number) => {
    setAllowedGenreCategories((prev) => {
      return prev.map((item, i) => {
        if (i === index) {
          return {
            genreId: genreId,
            categoryId: item.categoryId,
            conditionOptionId: item.conditionOptionId,
            specialtyId: item.specialtyId,
            noSpecialty: item.noSpecialty,
            limitCount: item.limitCount,
          };
        }
        return item;
      });
    });
  };

  // カテゴリを選択したときの処理
  const handleSetCategory = (categoryId: number) => {
    setAllowedGenreCategories((prev) => {
      return prev.map((item, i) => {
        if (i === index) {
          return {
            genreId: item.genreId,
            categoryId: categoryId,
            conditionOptionId: item.conditionOptionId,
            specialtyId: item.specialtyId,
            noSpecialty: item.noSpecialty,
            limitCount: item.limitCount,
          };
        }
        return item;
      });
    });
  };

  // 状態を選択したときの処理
  const handleSetConditionOption = (conditionOptionId: number | null) => {
    setAllowedGenreCategories((prev) => {
      return prev.map((item, i) => {
        if (i === index) {
          return {
            genreId: item.genreId,
            categoryId: item.categoryId,
            conditionOptionId: conditionOptionId,
            specialtyId: item.specialtyId,
            noSpecialty: item.noSpecialty,
            limitCount: item.limitCount,
          };
        }
        return item;
      });
    });
  };

  // 特殊状態を選択したときの処理
  const handleSetSpecialtyId = (specialtyId: number | null) => {
    setAllowedGenreCategories((prev) => {
      return prev.map((item, i) => {
        if (i === index) {
          if (specialtyId === -1) {
            return {
              genreId: item.genreId,
              categoryId: item.categoryId,
              conditionOptionId: item.conditionOptionId,
              specialtyId: null,
              noSpecialty: true,
              limitCount: item.limitCount,
            };
          } else if (specialtyId === 0) {
            return {
              genreId: item.genreId,
              categoryId: item.categoryId,
              conditionOptionId: item.conditionOptionId,
              specialtyId: null,
              noSpecialty: false,
              limitCount: item.limitCount,
            };
          }
          return {
            genreId: item.genreId,
            categoryId: item.categoryId,
            conditionOptionId: item.conditionOptionId,
            specialtyId: specialtyId,
            noSpecialty: false,
            limitCount: item.limitCount,
          };
        }
        return item;
      });
    });
  };

  // 注文数上限を選択したときの処理
  const handleSetLimitCount = (limitCount: number | null) => {
    setAllowedGenreCategories((prev) => {
      return prev.map((item, i) => {
        if (i === index) {
          return {
            genreId: item.genreId,
            categoryId: item.categoryId,
            conditionOptionId: item.conditionOptionId,
            specialtyId: item.specialtyId,
            noSpecialty: item.noSpecialty,
            limitCount: limitCount,
          };
        }
        return item;
      });
    });
  };

  // 削除ボタンを押したときの処理
  const handleDelete = () => {
    setAllowedGenreCategories((prev) => prev.filter((_, i) => i !== index));
  };
  return (
    <Stack direction="row" gap={2} alignItems="center">
      <Typography variant="body1">表示項目{index + 1}</Typography>
      <Stack
        direction="row"
        justifyContent="space-between" // 均等に配置
        gap={2} // 適宜間隔を調整
      >
        <FormControl
          variant="outlined"
          size="small"
          sx={{
            minWidth: 180,
            '& .MuiInputLabel-root': {
              color: 'text.primary',
            },
          }}
        >
          <InputLabel sx={{ color: 'text.primary' }}>ジャンル</InputLabel>
          <Select
            value={categoryGenre.genreId ?? ''}
            onChange={(e) => handleSetGenre(Number(e.target.value))}
            label="ジャンル"
          >
            {/* "指定なし"オプション */}
            <MenuItem value={''} sx={{ color: 'grey' }}>
              <Typography color="text.primary">指定なし</Typography>
            </MenuItem>

            {/* genre.itemGenresから選択肢を生成 */}
            {genreList.map((itemGenre) => (
              <MenuItem key={itemGenre.id} value={itemGenre.id}>
                <Typography color="text.primary">
                  {itemGenre.display_name}
                </Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl
          variant="outlined"
          size="small"
          sx={{
            minWidth: 180,
            '& .MuiInputLabel-root': {
              color: 'text.primary',
            },
          }}
        >
          <InputLabel sx={{ color: 'text.primary' }}>カテゴリ</InputLabel>
          <Select
            value={categoryGenre.categoryId ?? ''}
            onChange={(e) => handleSetCategory(Number(e.target.value))}
            label="カテゴリ"
          >
            {/* "指定なし"オプション */}
            <MenuItem value="" sx={{ color: 'grey' }}>
              <Typography color="text.primary">全て</Typography>
            </MenuItem>

            {/* category.itemCategoriesから選択肢を生成 */}
            {categoryList.map((itemCategory) => (
              <MenuItem key={itemCategory.id} value={itemCategory.id}>
                <Typography color="text.primary">
                  {itemCategory.display_name}
                </Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl
          variant="outlined"
          size="small"
          sx={{
            minWidth: 180,
          }}
        >
          <InputLabel
            sx={{
              color: 'text.primary',
              ':disabled': {
                color: '#444444',
              },
            }}
          >
            状態
          </InputLabel>
          <Select
            value={categoryGenre.conditionOptionId ?? -1}
            onChange={(e) => {
              const v = e.target.value;
              // -1 → null、それ以外は number に変換
              handleSetConditionOption(v === -1 ? null : Number(v));
            }}
            label="状態"
            disabled={!targetConditionList}
          >
            {/* "全て"オプション */}
            <MenuItem value={-1} sx={{ color: 'grey' }}>
              <Typography color="text.primary">全て</Typography>
            </MenuItem>
            {targetConditionList?.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                <Typography color="text.primary">
                  {item.display_name}
                </Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 特殊状態選択 */}
        <FormControl
          variant="outlined"
          size="small"
          sx={{
            minWidth: 180,
            '& .MuiInputLabel-root': {
              color: 'text.primary',
            },
          }}
        >
          <InputLabel sx={{ color: 'text.primary' }}>特殊状態</InputLabel>
          <Select
            value={
              categoryGenre.noSpecialty ? -1 : categoryGenre.specialtyId ?? 0
            }
            onChange={(e) => {
              const v = e.target.value;
              handleSetSpecialtyId(v === '' ? null : Number(v));
            }}
            label="特殊状態"
          >
            <MenuItem value={0}>
              <Typography color="text.primary">全て</Typography>
            </MenuItem>
            {specialties.map((specialty) => (
              <MenuItem key={specialty.id} value={specialty.id}>
                <Typography color="text.primary">
                  {specialty.display_name}
                </Typography>
              </MenuItem>
            ))}
            <MenuItem value={-1}>なし</MenuItem>
          </Select>
        </FormControl>

        {/* 注文数上限選択 */}
        <FormControl
          variant="outlined"
          size="small"
          sx={{
            minWidth: 180,
            '& .MuiInputLabel-root': {
              color: 'text.primary',
            },
          }}
        >
          <InputLabel sx={{ color: 'text.primary' }}>注文数上限</InputLabel>
          <Select
            value={categoryGenre.limitCount ?? 0}
            onChange={(e) => {
              const v = e.target.value;
              handleSetLimitCount(v === 0 ? null : Number(v));
            }}
            label="注文数上限"
          >
            <MenuItem value={0}>
              <Typography color="text.primary">上限なし</Typography>
            </MenuItem>
            {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => (
              <MenuItem key={num} value={num}>
                <Typography color="text.primary">{num}枚</Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <IconButton onClick={handleDelete}>
        <DeleteIcon />
      </IconButton>
    </Stack>
  );
};
