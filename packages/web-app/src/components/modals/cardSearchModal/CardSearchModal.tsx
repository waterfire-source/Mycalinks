import React, { useEffect, useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  CircularProgress,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { FaTimes } from 'react-icons/fa';
import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';
import CardSearchDetail from '@/components/modals/cardSearchModal/CardSearchDetail';
import CardSearchControls from '@/components/modals/cardSearchModal/CardSearchControls';
import CardSearchResults from '@/components/modals/cardSearchModal/CardSearchResults';
import { TableRowData } from '@/components/cards/ChangeStockTableCard'; // ※インポート先を共通化して他の不ファイルからも参照したい
import { useItemSearch } from '@/feature/item/hooks/useItemSearch';

interface Props {
  open: boolean;
  storeID: number;
  tableItems: TableRowData[]; // 型を TableRowData[] に変更
  onClose: () => void;
  setTableData: React.Dispatch<React.SetStateAction<TableRowData[]>>; // 型を TableRowData[] に変更
  selectedRowIndex?: number | null;
  isChangeStock?: boolean;
  productIsActive?: boolean; //activeな商品だけ取得するかどうか
  isAddItemCloseModal?: boolean; //商品を追加した際にModalを閉じるかどうか(在庫変動の際に使用)
}

const CardSearchModal: React.FC<Props> = ({
  open,
  storeID,
  tableItems,
  onClose,
  setTableData,
  selectedRowIndex,
  isChangeStock = true,
  productIsActive = undefined,
  isAddItemCloseModal = false,
}) => {
  const [selectedItem, setSelectedItem] = useState<
    BackendItemAPI[0]['response']['200']['items'][0] | null
  >(null);

  const { searchState, setSearchState, performSearch } = useItemSearch(
    storeID!,
    {
      isActive: productIsActive,
    },
  );

  useEffect(() => {
    performSearch();
  }, []);

  const handleItemClick = (
    item: BackendItemAPI[0]['response']['200']['items'][0],
  ) => {
    setSelectedItem(item);
  };

  const handleDetailsClose = () => {
    setSelectedItem(null);
    if (isAddItemCloseModal) {
      onClose();
    }
  };

  const handlePageChange = (newPage: number) => {
    setSearchState((prevState) => ({
      ...prevState,
      currentPage: newPage,
    }));
  };

  const handleItemsPerPageChange = (event: SelectChangeEvent<number>) => {
    const newItemsPerPage = parseInt(event.target.value as string, 10);
    setSearchState((prevState) => ({
      ...prevState,
      itemsPerPage: newItemsPerPage,
      currentPage: 0,
    }));
  };

  const handleAddItemToRow = (index: number, item: any) => {
    const newData = [...tableItems];
    newData[index] = { ...newData[index], ...item };
    setTableData(newData);
  };

  const handleAddItem = (item: TableRowData) => {
    console.log('item: ', item, selectedRowIndex);
    if (selectedRowIndex !== undefined && selectedRowIndex !== null) {
      handleAddItemToRow(selectedRowIndex, item);
    } else {
      setTableData((prevData) => {
        const newId = prevData.length + 1;
        const newItem = {
          ...item,
          id: newId,
          quantity: item.quantity ?? 0,
          unitPrice: item.unitPrice ?? 0,
        };

        const existingItemIndex = prevData.findIndex(
          (row) =>
            row.productId === item.productId &&
            row.unitPrice === (item.unitPrice ?? 0),
        );

        if (existingItemIndex !== -1) {
          const updatedData = [...prevData];
          const existingItem = updatedData[existingItemIndex];
          const existingQuantity = existingItem.quantity ?? 0;
          const newQuantity = existingQuantity + (item.quantity ?? 0);
          updatedData[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity,
            totalPrice: newQuantity * (existingItem.unitPrice ?? 0),
          };
          return updatedData;
        } else {
          return [...prevData, newItem];
        }
      });
    }
    handleDetailsClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: '90%',
          bgcolor: 'background.paper',
          borderRadius: '4px',
          boxShadow: 24,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px',
            backgroundColor: 'grey.700',
            borderRadius: '4px 4px 0 0',
            color: 'text.secondary',
            position: 'relative',
            height: '60px',
          }}
        >
          <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
            <Typography variant="h6">商品検索</Typography>
          </Box>
          <Button
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: '10px',
              color: 'common.white',
              minWidth: 'auto',
            }}
          >
            <FaTimes size={20} />
          </Button>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            height: 'calc(100% - 60px)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              flex: '1',
            }}
          >
            <CardSearchControls
              onSearch={performSearch}
              setSearchState={setSearchState}
              searchState={searchState}
            />
            {searchState.isLoading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <CircularProgress />
              </Box>
            ) : searchState.searchResults.length ? (
              <CardSearchResults
                onItemClick={handleItemClick}
                items={searchState.searchResults}
              />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <Typography>商品が見つかりませんでした</Typography>
              </Box>
            )}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px',
                borderRadius: '0 0 4px 4px',
                alignItems: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ marginRight: '10px' }}>表示件数:</Typography>
                <Select
                  value={searchState.itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  sx={{ width: '80px', height: '40px' }}
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={30}>30</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </Box>
              <Box>
                <Button
                  onClick={() => handlePageChange(searchState.currentPage - 1)}
                  disabled={searchState.currentPage === 0}
                >
                  前のページ
                </Button>
                <Button
                  onClick={() => handlePageChange(searchState.currentPage + 1)}
                >
                  次のページ
                </Button>
              </Box>
            </Box>
          </Box>
          {selectedItem && (
            <Box
              sx={{
                width: '400px',
                borderLeft: '1px solid #ddd',
                flexShrink: 0,
              }}
            >
              <CardSearchDetail
                item={selectedItem}
                tableItems={tableItems}
                onClose={handleDetailsClose}
                onAddItem={handleAddItem}
                isChangeStock={isChangeStock}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default CardSearchModal;
