import React, { useEffect, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { SyntheticEvent } from 'react';
import { styled } from '@mui/material/styles';
import { StockChangeHistory } from '@/feature/stock/components/StockChangeHistory/StockChangeHistory';
import { ProductDetailTable } from '@/components/tables/ProductDetailTable';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { Store } from '@/contexts/StoreContext';
import { StockChange } from '@/feature/stock/components/StockChange/StockChange';
import { useAlert } from '@/contexts/AlertContext';
import { ProductAPI } from '@/api/frontend/product/api';
import { createClientAPI, CustomError } from '@/api/implement';
import { Product } from '@prisma/client';

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </Box>
  );
}

interface CustomTabProps {
  label: string;
  selected: boolean;
}

const CustomTab = styled((props: CustomTabProps) => (
  <Tab disableRipple {...props} />
))(({ selected }: CustomTabProps) => ({
  backgroundColor: selected ? '#8B0000' : 'white',
  color: selected ? 'white' : 'black',
  borderTopLeftRadius: '8px',
  borderTopRightRadius: '8px',
  fontSize: '10px',
  textAlign: 'center',
  border: '1px solid gray',
  flex: 1, // ボタン幅を最大にする
  minHeight: '31px',
  padding: '6px 12px',
  '&.Mui-selected': {
    color: 'white',
  },
  '&:hover': {
    backgroundColor: selected ? '#8B0000' : 'white',
    color: selected ? 'white' : 'black',
  },
}));

interface StockDetailsTabProps {
  editItem: BackendProductAPI[0]['response']['200']['products'][0] | null;
  store: Store | null;
  staffAccountID: string | undefined;
  setIsUpdated: React.Dispatch<React.SetStateAction<boolean>>;
}

export function StockDetailsTab({
  editItem,
  store,
  staffAccountID,
  setIsUpdated,
}: StockDetailsTabProps) {
  const [value, setValue] = useState<number>(0);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const { setAlertState } = useAlert();
  const clientAPI = createClientAPI();
  const [productId, setProductId] = useState<Product['id']>();
  const [stockNumber, setStockNumber] = useState<Product['stock_number']>();

  // 商品の詳細情報を取得
  const fetchItemData = async () => {
    if (!store) {
      setAlertState({
        message: 'ストア情報が取得できませんでした。',
        severity: 'error',
      });
      return;
    }

    const response: ProductAPI['listProducts']['response'] =
      await clientAPI.product.listProducts({
        storeID: store.id,
        id: editItem?.id,
      });

    if (response instanceof CustomError) {
      setAlertState({
        message: `${response.status}:${response.message}`,
        severity: 'error',
      });
      return;
    }

    console.info('取得したproduct情報', response.products[0]);
    setProductId(response.products[0].id);
    setStockNumber(response.products[0].stock_number);
  };

  const fetchStockChangeHistory = async () => {
    console.info('在庫変動履歴を再取得します...');
    await fetchItemData();
    setValue(0); // タブを「在庫変動履歴」に移動
  };

  useEffect(() => {
    fetchItemData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editItem?.id, store]);

  return (
    <Box
      sx={{
        padding: '16px',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0,
        width: '100%',
        height: '800px', // タブ全体の高さを固定
        overflow: 'hidden', // 全体のスクロールを防止
      }}
    >
      {/* タブヘッダー */}
      <Box
        sx={{
          backgroundColor: 'white',
          width: '100%',
          borderBottom: '5px solid #8B0000',
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          TabIndicatorProps={{ style: { display: 'none' } }}
          sx={{
            minHeight: '20px', // タブ全体の高さを調整
            height: '30px',
            margin: 0, // タブ間の余白をリセット
            padding: 0, // タブ全体の余白をリセット
          }}
        >
          <CustomTab label="在庫変動履歴" selected={value === 0} />
          <CustomTab label="在庫情報編集" selected={value === 1} />
          <CustomTab label="在庫変更" selected={value === 2} />
        </Tabs>
      </Box>

      {/* タブコンテンツ */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto', // 縦スクロールを有効化
          paddingBottom: '16px', // 下部に余白を追加
          maxHeight: 'calc(100vh - 150px)', // ダイアログの高さを制限
        }}
      >
        <TabPanel value={value} index={0}>
          <StockChangeHistory productId={productId} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          {editItem && store?.id && staffAccountID && (
            <ProductDetailTable
              itemData={editItem}
              itemID={editItem.id}
              storeId={store.id}
              staffAccountID={staffAccountID}
              onUpdate={() => setIsUpdated(true)}
            />
          )}
        </TabPanel>
        <TabPanel value={value} index={2}>
          <StockChange
            originalProductID={productId}
            stock={stockNumber}
            fetchStockChangeHistory={fetchStockChangeHistory}
          />
        </TabPanel>
      </Box>
    </Box>
  );
}
