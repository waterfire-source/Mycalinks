import React, { useState } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Box,
  TextField,
  Stack,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';
import { ImagePicker } from '@/components/cards/ImagePicker';
import { RegisterItemFormData } from '@/app/auth/(dashboard)/item/components/ItemRegisterModal';
import { useLabelPrinterHistory } from '@/contexts/LabelPrinterContext';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import PrintIcon from '@mui/icons-material/Print';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { LabelPrinterHistoryModal } from '@/components/layouts/header/components/LabelPrinterHistoryModal';
import { getConditionDisplayName } from '@/feature/products/utils/conditionDisplayName';
import Image from 'next/image';

interface Props {
  products?: BackendItemAPI[0]['response']['200']['items'][0]['products'];
  formData: RegisterItemFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegisterItemFormData>>;
  isEdit: boolean;
  stockNumber?: number;
  setProductId: React.Dispatch<React.SetStateAction<number | undefined>>;
  setIsDetailModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  infiniteStock: boolean;
}

export const ItemProductDetail: React.FC<Props> = ({
  products,
  formData,
  setFormData,
  stockNumber,
  setProductId,
  setIsDetailModalOpen,
  infiniteStock,
}) => {
  const { pushQueue, setModalOpen, printQueue } = useLabelPrinterHistory();

  // 印刷用数量の管理
  const [printQuantities, setPrintQuantities] = useState<{
    [key: number]: number;
  }>({});

  // 全体共通の印刷設定
  const [globalPrintSetting, setGlobalPrintSetting] = useState<'one' | 'stock'>(
    'one',
  );

  // 印刷用数量の更新
  const handlePrintQuantityChange = (productId: number, quantity: number) => {
    setPrintQuantities((prev) => ({
      ...prev,
      [productId]: quantity,
    }));
  };

  // 印刷数量入力のハンドラー
  const handlePrintQuantityInputChange = (productId: number, value: string) => {
    if (value === '') {
      // 空文字の場合は印刷数量をクリア
      setPrintQuantities((prev) => {
        const newQuantities = { ...prev };
        delete newQuantities[productId];
        return newQuantities;
      });
    } else {
      const numericValue = parseInt(value, 10);
      if (!isNaN(numericValue) && numericValue > 0) {
        handlePrintQuantityChange(productId, numericValue);
      }
    }
  };

  const handlePrintLabels = (
    productId: number,
    stockNumber: number,
    infiniteStock: boolean = false,
  ) => {
    // 印刷数量の計算
    let printQuantity = 1;
    if (globalPrintSetting === 'stock') {
      // 在庫数（入力数）が選択されている場合
      printQuantity = printQuantities[productId] || stockNumber;
    } else {
      // 1枚ずつが選択されている場合
      printQuantity = 1;
    }

    // 在庫数が0の場合は印刷しない（無限在庫の場合は除く）
    if (globalPrintSetting === 'stock' && stockNumber <= 0 && !infiniteStock) {
      console.warn(
        `商品ID: ${productId} の在庫数が0のため印刷をスキップします`,
      );
      return;
    }

    // 印刷数量が在庫数を超える場合は在庫数分印刷（無限在庫の場合は制限なし）
    const actualPrintQuantity = infiniteStock
      ? printQuantity
      : Math.min(printQuantity, stockNumber);

    // 印刷数量が0以下の場合は印刷しない
    if (actualPrintQuantity <= 0) {
      console.warn(
        `商品ID: ${productId} の印刷数量が0以下のため印刷をスキップします`,
      );
      return;
    }

    // 在庫数=印刷数量の場合→価格ありラベル1枚+残り価格無しラベル
    // 在庫数>印刷数量の場合→価格無しラベルのみ
    let isFirstStock = stockNumber <= actualPrintQuantity;

    for (let i = 0; i < actualPrintQuantity; i++) {
      pushQueue({
        template: 'product',
        data: productId,
        meta: {
          isFirstStock,
          isManual: true,
        },
      });
      isFirstStock = false; // 2枚目以降はfalseで
    }
  };

  // 入力値変更ハンドラー
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // テーブルのカラム設定を配列で定義
  const tableColumns = [
    {
      label: '状態',
      width: '10%',
      align: 'center' as const,
      render: (product: any) => {
        return getConditionDisplayName(product);
      },
    },
    // {
    //   label: '鑑定',
    //   width: '15%',
    //   align: 'center' as const,
    //   render: (product: any) =>
    //     product.tags
    //       .filter((tag: any) => tag.genre1 === 'appraisal_option')
    //       .map((tag: any) => tag.tag_name)
    //       .join(', '),
    // },
    {
      label: '管理番号・委託者',
      width: '15%',
      align: 'left' as const,
      render: (
        product: BackendItemAPI[0]['response']['200']['items'][0]['products'][number],
      ) => (
        <Stack>
          <Typography>
            {product.management_number === ''
              ? '未入力'
              : product.management_number || ''}
          </Typography>
          <Typography>
            {product.consignment_client__full_name
              ? product?.consignment_client__full_name
              : ''}
          </Typography>
        </Stack>
      ),
    },
    {
      label: '販売価格',
      width: '15%',
      align: 'left' as const,
      render: (product: any) =>
        product.actual_sell_price !== null
          ? `${product.actual_sell_price.toLocaleString()}円`
          : '価格未設定',
    },
    {
      label: '買取価格',
      width: '15%',
      align: 'left' as const,
      render: (product: any) =>
        product.actual_buy_price !== null
          ? `${product.actual_buy_price.toLocaleString()}円`
          : '価格未設定',
    },
    {
      label: '平均仕入れ値',
      width: '15%',
      align: 'left' as const,
      render: (product: any) =>
        product.average_wholesale_price !== null
          ? `${product.average_wholesale_price.toLocaleString()}円`
          : '-',
    },
    {
      label: '在庫数',
      width: '10%',
      align: 'left' as const,
      render: (product: any) =>
        infiniteStock ? '∞' : product.stock_number?.toLocaleString() || '0',
    },
    {
      label: '印刷',
      width: '20%',
      align: 'center' as const,
      render: (product: any) => (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="center"
        >
          <TextField
            value={printQuantities[product.id] || ''}
            onChange={(e) => {
              e.stopPropagation();
              handlePrintQuantityInputChange(product.id, e.target.value);
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            size="small"
            sx={{ width: '60px' }}
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*',
              min: 1,
              max: infiniteStock ? 999 : product.stock_number || 1,
            }}
          />
          <PrimaryButtonWithIcon
            onClick={(e) => {
              e.stopPropagation();
              handlePrintLabels(
                product.id,
                product.stock_number || 0,
                infiniteStock,
              );
            }}
            disabled={!infiniteStock && (product.stock_number || 0) <= 0}
            sx={{
              minWidth: '40px',
              height: '32px',
              fontSize: '10px',
            }}
            icon={<PrintIcon />}
            iconSize={16}
          >
            印刷
          </PrimaryButtonWithIcon>
        </Stack>
      ),
    },
  ];

  const handleRowClick = (productId: number) => {
    setProductId(productId);
    setIsDetailModalOpen(true);
  };

  return (
    <>
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
                setFormData((prevData) => ({
                  ...prevData,
                  image_url: url,
                }));
              }}
            />
          </Box>

          {/* 共通項目描画 */}
          {[
            { label: '販売価格', name: 'sell_price', type: 'input' },
            { label: '買取価格', name: 'buy_price', type: 'input' },
            {
              label: '在庫数',
              name: 'stock_count',
              type: 'static',
              value: formData.infinite_stock ? '∞' : stockNumber,
            },
          ].map((field) =>
            field.type === 'input' ? (
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
                  <TextField
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
        </Grid>
        <Grid item xs={9}>
          <Box
            sx={{
              backgroundColor: 'white',
              height: 610,
              boxShadow:
                '0px -4px 10px rgba(0, 0, 0, 0.1), 0px 4px 10px rgba(0, 0, 0, 0.1)',
              position: 'relative',
            }}
          >
            {/* 右上にラベル印刷ボタンとラジオボタン */}
            <Box
              sx={{
                position: 'absolute',
                right: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                zIndex: 10,
                p: 1,
              }}
            >
              <RadioGroup
                row
                value={globalPrintSetting}
                onChange={(e) =>
                  setGlobalPrintSetting(e.target.value as 'one' | 'stock')
                }
                sx={{ mr: 2 }}
              >
                <SecondaryButton
                  onClick={() => setModalOpen(true)}
                  sx={{ mr: 2 }}
                >
                  ラベル印刷設定
                  {printQueue.length > 0 && `(${printQueue.length})`}
                </SecondaryButton>
                <FormControlLabel
                  value="one"
                  control={<Radio size="small" />}
                  label="1枚ずつ"
                />
                <FormControlLabel
                  value="stock"
                  control={<Radio size="small" />}
                  label="在庫数(入力数)"
                />
              </RadioGroup>
            </Box>
            <TableContainer
              component={Paper}
              sx={{
                boxShadow: 'none',
                maxHeight: 610,
                overflowY: 'auto',
                '& .MuiTableHead-root': {
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  backgroundColor: 'white',
                },
                '& .MuiTableHead-root .MuiTableRow-root': {
                  backgroundColor: 'white',
                },
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      colSpan={tableColumns.length}
                      sx={{
                        backgroundColor: 'white',
                        borderBottom: '2px solid #e0e0e0',
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography>商品在庫状況</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    {tableColumns.map((col, index) => (
                      <TableCell
                        key={index}
                        align={col.align}
                        sx={{
                          width: col.width,
                          color: 'grey.500',
                          backgroundColor: 'white',
                          borderBottom: '2px solid #e0e0e0',
                          fontWeight: 'bold',
                        }}
                      >
                        {col.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products?.map((product, rowIndex) => (
                    <TableRow
                      key={rowIndex}
                      onClick={() => handleRowClick(product.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      {tableColumns.map((col, colIndex) => (
                        <TableCell
                          key={colIndex}
                          align={col.align}
                          sx={{ width: col.width }}
                          onClick={
                            col.label === '印刷'
                              ? (e) => e.stopPropagation()
                              : undefined
                          }
                        >
                          {col.render(product)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Grid>
      </Grid>
      <LabelPrinterHistoryModal />
    </>
  );
};

export default ItemProductDetail;
