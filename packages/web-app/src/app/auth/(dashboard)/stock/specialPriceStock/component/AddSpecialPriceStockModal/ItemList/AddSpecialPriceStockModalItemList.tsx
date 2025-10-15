import { TransferInfo } from '@/app/auth/(dashboard)/stock/specialPriceStock/component/AddSpecialPriceStockModal/AddSpecialPriceStockModal';
import { SelectedData } from '@/app/auth/(dashboard)/stock/specialPriceStock/component/AddSpecialPriceStockModal/AddSpecialPriceStockModalContent';
import { ItemTableComponent } from '@/app/auth/(dashboard)/stock/specialPriceStock/component/AddSpecialPriceStockModal/ItemList/ItemTableComponent';
import { NarrowDown } from '@/app/auth/(dashboard)/stock/specialPriceStock/component/AddSpecialPriceStockModal/ItemList/NarrowDown';
import { GenreTabComponent } from '@/components/tabs/GenreTabComponent';
import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';
import { Box, Stack } from '@mui/material';

interface Props {
  searchState: ItemSearchState;
  setSearchState: React.Dispatch<React.SetStateAction<ItemSearchState>>;
  setSelectedRows: React.Dispatch<
    React.SetStateAction<SelectedData | undefined>
  >;
  isReset: boolean;
  setIsReset: React.Dispatch<React.SetStateAction<boolean>>;
  setTransferInfo: React.Dispatch<
    React.SetStateAction<TransferInfo | undefined>
  >;
}

export const AddSpecialPriceStockModalItemList = ({
  searchState,
  setSearchState,
  setSelectedRows,
  isReset,
  setIsReset,
  setTransferInfo,
}: Props) => {
  return (
    <Stack sx={{ backgroundColor: 'white', flex: 1 }} height="100%" gap={0.5}>
      {/* タブの表示 */}
      <GenreTabComponent setSearchState={setSearchState} />
      {/* 絞り込みの表示 */}
      <NarrowDown
        searchState={searchState}
        setSearchState={setSearchState}
        setIsReset={setIsReset}
      />
      {/* テーブルの表示 */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ItemTableComponent
          searchState={searchState}
          setSearchState={setSearchState}
          setSelectedRows={setSelectedRows}
          isReset={isReset}
          setTransferInfo={setTransferInfo}
        />
      </Box>
    </Stack>
  );
};
