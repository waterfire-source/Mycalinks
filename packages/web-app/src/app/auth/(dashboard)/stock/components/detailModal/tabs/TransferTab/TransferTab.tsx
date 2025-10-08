import { StockTransfer } from '@/app/auth/(dashboard)/stock/components/detailModal/contents/StockChange/StockChange';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';
import { CategoryAPIRes } from '@/api/frontend/category/api';
import { GenreAPIRes } from '@/api/frontend/genre/api';
import { transferProduct } from '@/app/auth/(dashboard)/stock/components/detailModal/StockDetailModal';

interface TransferTabProps {
  storeId: number;
  detailData: BackendProductAPI[0]['response']['200']['products'][0][];
  searchItemState: ItemSearchState;
  setSearchItemState: React.Dispatch<React.SetStateAction<ItemSearchState>>;
  transferItems: transferProduct[];
  setTransferItems: React.Dispatch<React.SetStateAction<transferProduct[]>>;
  performSearch: (isPageSkip?: boolean) => Promise<void>;
  category: CategoryAPIRes['getCategoryAll'];
  genre: GenreAPIRes['getGenreAll'];
  isReset: boolean;
  setIsReset: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TransferTab = ({
  storeId,
  detailData,
  searchItemState,
  setSearchItemState,
  transferItems,
  setTransferItems,
  performSearch,
  category,
  genre,
  isReset,
  setIsReset,
}: TransferTabProps) => {
  return (
    <StockTransfer
      storeId={storeId}
      detailData={detailData}
      searchItemState={searchItemState}
      setSearchItemState={setSearchItemState}
      transferItems={transferItems}
      setTransferItems={setTransferItems}
      performSearch={performSearch}
      category={category}
      genre={genre}
      isReset={isReset}
      setIsReset={setIsReset}
    />
  );
};
