import { useRef, useEffect } from 'react';
import { SelectedProduct } from '@/app/auth/(dashboard)/purchaseTable/components/CreatePurchaseTableModal/CreatePurchaseTableModal';
import { ListedProductRow } from '@/app/auth/(dashboard)/purchaseTable/components/CreatePurchaseTableModal/ListedProductComponent/ListedProductRow';
import { Box, Typography } from '@mui/material';
import grey from '@mui/material/colors/grey';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { MultiBackend } from 'dnd-multi-backend';
import { TouchTransition, MouseTransition } from 'dnd-multi-backend';

interface Props {
  selectedProduct: SelectedProduct[];
  setSelectedProduct: React.Dispatch<React.SetStateAction<SelectedProduct[]>>;
  isShowInputField: boolean;
}

const DnDBackends = {
  backends: [
    {
      backend: HTML5Backend,
      transition: MouseTransition,
    },
    {
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      transition: TouchTransition,
    },
  ],
};

export const ListedProduct = ({
  selectedProduct,
  setSelectedProduct,
  isShowInputField,
}: Props) => {
  // 掲載価格の処理
  const handleTextFiledChange = (value: string, itemId?: number) => {
    setSelectedProduct((prev) =>
      prev.map((row) =>
        row.itemId === itemId ? { ...row, displayPrice: value } : row,
      ),
    );
  };

  // チェックボックスの処理
  const handleCheckBoxChange = (value: boolean, itemId?: number) => {
    setSelectedProduct((prev) =>
      prev.map((row) =>
        row.itemId === itemId ? { ...row, anyModelNumber: value } : row,
      ),
    );
  };

  // PSA10チェックボックスの処理
  const handlePsa10CheckBoxChange = (value: boolean, itemId?: number) => {
    setSelectedProduct((prev) =>
      prev.map((row) =>
        row.itemId === itemId ? { ...row, isPsa10: value } : row,
      ),
    );
  };

  // 行削除の処理
  const handleDeleteRow = (itemId?: number) => {
    setSelectedProduct((prev) => prev.filter((row) => row.itemId !== itemId));
  };

  // 並び替えの処理
  const handleMoveItem = (dragIndex: number, hoverIndex: number) => {
    setSelectedProduct((prev) => {
      const updated = [...prev];
      const [removed] = updated.splice(dragIndex, 1);
      updated.splice(hoverIndex, 0, removed);
      return updated;
    });
  };

  // 商品追加時のオートフォーカス処理
  const lastItemRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const prevLengthRef = useRef<number>(selectedProduct.length);
  useEffect(() => {
    // 商品の削除時には発火しないように、直前の商品リストの数と比較して増えている場合のみ下までスクロールする
    if (
      selectedProduct.length > prevLengthRef.current &&
      lastItemRef.current &&
      scrollContainerRef.current
    ) {
      scrollContainerRef.current.scrollTo({
        top: lastItemRef.current.offsetTop,
        behavior: 'smooth',
      });
    }
    prevLengthRef.current = selectedProduct.length; // 比較用に現在の商品リスト数を保存
  }, [selectedProduct.length]);

  return (
    <DndProvider backend={MultiBackend} options={DnDBackends}>
      <Box
        sx={{
          backgroundColor: 'white',
          boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.2)',
          borderRadius: '4px',
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ヘッダー */}
        <Box
          sx={{
            height: '60px',
            width: '100%',
            minHeight: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Typography sx={{ ml: 2.5, fontWeight: 'bold' }}>掲載商品</Typography>
          <Typography sx={{ mr: 2.5, fontWeight: 'bold' }}>
            {selectedProduct.length}件
          </Typography>
        </Box>

        {/* メインコンテンツ */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            minHeight: 0,
          }}
        >
          {selectedProduct.length > 0 ? (
            <Box sx={{ overflow: 'auto' }} ref={scrollContainerRef}>
              {selectedProduct.map((product, index) => (
                <div
                  key={product.itemId ?? index}
                  ref={
                    index === selectedProduct.length - 1 ? lastItemRef : null
                  }
                >
                  <ListedProductRow
                    key={product.itemId ?? index}
                    product={product}
                    index={index}
                    isShowInputField={isShowInputField}
                    handleTextFiledChange={handleTextFiledChange}
                    handleCheckBoxChange={handleCheckBoxChange}
                    handlePsa10CheckBoxChange={handlePsa10CheckBoxChange}
                    handleDeleteRow={handleDeleteRow}
                    handleMoveItem={handleMoveItem}
                  />
                </div>
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: grey[500],
              }}
            ></Box>
          )}
        </Box>
      </Box>
    </DndProvider>
  );
};
