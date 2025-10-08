import { FindOptionSelectItem } from '@/feature/item/components/select/FindOptionSelectItem';
import { useGetItemFindOption } from '@/feature/item/hooks/useGetItemFindOption';
import {
  ChangeFindOptionType,
  FindOptionType,
} from '@/feature/item/hooks/useSearchItemByFindOption';
import { Box } from '@mui/material';
import { useEffect } from 'react';

interface Props {
  storeID?: number;
  selectedGenreId?: number | null;
  selectedCategoryId?: number | null;
  selectedFindOption: FindOptionType[];
  handleChangeFindOption: (values: ChangeFindOptionType) => void;
  cardCategoryId?: number;
}

export const FindOptionSelect = ({
  storeID,
  selectedGenreId,
  selectedCategoryId,
  selectedFindOption,
  handleChangeFindOption,
  cardCategoryId,
}: Props) => {
  const { findOptions, fetchItemFindOption } = useGetItemFindOption();

  useEffect(() => {
    fetchItemFindOption(
      storeID,
      selectedGenreId,
      selectedCategoryId,
      cardCategoryId,
    );
  }, [
    storeID,
    selectedGenreId,
    selectedCategoryId,
    fetchItemFindOption,
    cardCategoryId,
  ]);

  return (
    <Box
      display="flex"
      justifyContent="space-between" // 均等に配置
      gap={2} // 適宜間隔を調整
    >
      {!!findOptions &&
        findOptions?.map((findOption) => (
          <FindOptionSelectItem
            key={`${selectedGenreId}-${selectedCategoryId}-${findOption.metaLabel}`}
            findOption={findOption}
            selectedFindOption={selectedFindOption}
            handleChangeFindOption={handleChangeFindOption}
          />
        ))}
    </Box>
  );
};
