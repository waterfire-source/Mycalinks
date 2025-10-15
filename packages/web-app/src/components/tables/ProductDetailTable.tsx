import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  TextField,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import dayjs from 'dayjs';
import { Product } from '@prisma/client';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { StockUpdateModal } from '@/components/modals/stock/detail/StockUpdateModal';
import { ProductAPI } from '@/api/frontend/product/api';
import TagManager from '@/feature/tag/components/TagManager';
import { useStore } from '@/contexts/StoreContext';
import { useLabelPrinterHistory } from '@/contexts/LabelPrinterContext';
import NumericTextField from '@/components/inputFields/NumericTextField';

type BackendProductAPIResponse200 =
  BackendProductAPI[0]['response']['200']['products'][0];

interface EditableTableProps {
  itemData: BackendProductAPIResponse200;
  itemID: number;
  storeId: number;
  staffAccountID: string;
  onUpdate: () => void; // 追加: 更新時に呼び出されるコールバック
  // fetchItemData: () => void;
}

const tableCellStyle = {
  width: '100px',
  backgroundColor: 'grey.700',
  textAlign: 'center',
  fontSize: '13px',
};

const TextFieldStyle = {
  width: '100%',
  '& input': {
    padding: '5px',
  },
};

export const ProductDetailTable: React.FC<EditableTableProps> = ({
  itemData,
  itemID,
  storeId,
  staffAccountID,
  onUpdate,
}) => {
  const clientAPI = createClientAPI();
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const [formData, setFormData] = useState<Partial<Product>>();
  const [newStockNumber, setNewStockNumber] = useState<number | null>(null);
  const [isStockUpdateModalOpen, setIsStockUpdateModalOpen] = useState(false);
  const [isStockAdd, setIsStockAdd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  //productの詳細情報を取得
  const fetchItemData = async () => {
    if (itemID && store) {
      setIsLoading(true);
      const response: ProductAPI['listProducts']['response'] =
        await clientAPI.product.listProducts({
          storeID: store.id,
          id: itemID,
        });
      setIsLoading(false);

      if (response instanceof CustomError) {
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        return;
      }
      console.info('取得したproduct情報', response.products[0]);
      setFormData(response.products[0]);
    }
  };

  useEffect(() => {
    fetchItemData();
  }, [itemID]);

  //在庫数が増加しているかどうかをチェック
  useEffect(() => {
    setIsStockAdd((newStockNumber ?? 0) - (formData?.stock_number ?? 0) > 0);
  }, [newStockNumber, formData?.stock_number]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleCheckboxChange = (value: boolean) => {
    setFormData((prevFormData) => ({ ...prevFormData, allowed_point: value }));
  };

  // 更新ボタンを押したら、在庫数を更新する
  const handleUpdate = () => {
    if (newStockNumber !== null && newStockNumber !== formData?.stock_number) {
      setIsStockUpdateModalOpen(true);
    } else {
      productUpdate();
    }
  };

  const handleStockUpdateConfirm = async (reason: string, cost?: number) => {
    if (newStockNumber === null) return;
    const response = await clientAPI.product.postAdjustStock({
      storeID: storeId,
      productID: itemData.id,
      body: {
        changeCount: newStockNumber - (formData?.stock_number || 0),
        reason,
        staff_account_id: Number(staffAccountID),
        wholesalePrice: cost,
      },
    });
    if (response instanceof CustomError) {
      setAlertState({
        message: `${response.status}:${response.message}`,
        severity: 'error',
      });
      return;
    }
    setFormData((prevFormData) => ({
      ...prevFormData,
      stock_number: newStockNumber,
    }));
    productUpdate();
    setNewStockNumber(null);
    setIsStockUpdateModalOpen(false);
  };

  const { pushQueue } = useLabelPrinterHistory();

  //更新処理
  const productUpdate = async (updatedFormData = formData) => {
    if (itemData && storeId) {
      const payload: ProductAPI['updateProduct']['request'] = {
        storeID: storeId,
        productID: itemData.id,
        body: {
          specific_sell_price: updatedFormData?.specific_sell_price
            ? Number(updatedFormData.specific_sell_price)
            : null,
          specific_buy_price: updatedFormData?.specific_buy_price
            ? Number(updatedFormData.specific_buy_price)
            : null,
          retail_price: updatedFormData?.retail_price
            ? Number(updatedFormData.retail_price)
            : undefined,
          display_name: updatedFormData?.display_name,
          readonly_product_code: updatedFormData?.readonly_product_code,
          image_url: updatedFormData?.image_url,
          description: updatedFormData?.description,
          staff_account_id: Number(staffAccountID),
          allowed_point: updatedFormData?.allowed_point,
        },
      };

      const response = await clientAPI.product.updateProduct(payload);
      console.log('在庫情報更新結果', response);

      if (response instanceof CustomError) {
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        return;
      }
      setAlertState({
        message: '在庫情報が更新されました',
        severity: 'success',
      });

      onUpdate(); // 更新が成功した場合にコールバックを呼び出す
      fetchItemData(); //在庫数再取得

      //このタイミングで在庫変動分だけラベルを印刷する
      if (response.productsToPrint) {
        for (const product of response.productsToPrint as Array<{
          id: Product['id'];
          stock_number: Product['stock_number'];
        }>) {
          const productId = product.id;
          const printCount = product.stock_number;

          let isFirstStock = true;

          for (let i = 0; i < printCount; i++) {
            pushQueue({
              template: 'product',
              data: productId,
              meta: {
                isFirstStock,
              },
            });
            isFirstStock = false; //2枚目以降はfalseで
          }
        }
      }
    } else {
      setAlertState({
        message: `必要な情報がありません。`,
        severity: 'error',
      });
    }
  };

  //価格リセット処理
  const handleResetPrices = () => {
    const updatedFormData = {
      ...formData,
      specific_sell_price: null,
    };
    productUpdate(updatedFormData);
  };

  return (
    <>
      <Box sx={{ pb: 4 }}>
        <TableContainer component={Paper} sx={{ marginTop: '20px' }}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell sx={tableCellStyle}>アイテム名</TableCell>
                <TableCell>
                  <TextField
                    sx={TextFieldStyle}
                    name="display_name"
                    value={formData?.display_name || ''}
                    onChange={handleChange}
                    fullWidth
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={tableCellStyle}>JANコード</TableCell>
                <TableCell>
                  <TextField
                    sx={TextFieldStyle}
                    name="readonly_product_code"
                    value={formData?.readonly_product_code || ''}
                    onChange={handleChange}
                    fullWidth
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={tableCellStyle}>コード</TableCell>
                <TableCell>{itemData.product_code}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={tableCellStyle}>販売価格</TableCell>
                <TableCell>{formData?.sell_price?.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={tableCellStyle}>状態名</TableCell>
                <TableCell>{formData?.condition_option_display_name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={tableCellStyle}>買取価格</TableCell>
                <TableCell>{formData?.buy_price?.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={tableCellStyle}>販売価格(独自)</TableCell>
                <TableCell>
                  <TextField
                    sx={TextFieldStyle}
                    name="specific_sell_price"
                    value={
                      formData?.specific_sell_price?.toLocaleString() || ''
                    }
                    onChange={handleChange}
                    fullWidth
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={tableCellStyle}>買取価格(独自)</TableCell>
                <TableCell>
                  <TextField
                    sx={TextFieldStyle}
                    name="specific_buy_price"
                    value={formData?.specific_buy_price?.toLocaleString() || ''}
                    onChange={handleChange}
                    fullWidth
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={tableCellStyle}>小売価格</TableCell>
                <TableCell>
                  <TextField
                    sx={TextFieldStyle}
                    name="retail_price"
                    value={formData?.retail_price?.toLocaleString() || ''}
                    onChange={handleChange}
                    fullWidth
                  />
                </TableCell>
              </TableRow>
              {/* <TableRow>
                <TableCell sx={tableCellStyle}>卸売価格</TableCell>
                <TableCell>
                  <TextField
                    sx={TextFieldStyle}
                    name="wholesale_price"
                    value={formData?.wholesale_price?.toLocaleString() || ''}
                    onChange={handleChange}
                    fullWidth
                  />
                </TableCell>
              </TableRow> */}
              <TableRow>
                <TableCell sx={tableCellStyle}>在庫数</TableCell>
                <TableCell>
                  <Box
                    sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                        flexGrow: 1,
                      }}
                    >
                      <Typography>
                        {`${formData?.stock_number?.toLocaleString() || ''} →`}
                      </Typography>
                      <NumericTextField
                        sx={{ ...TextFieldStyle, flex: 1 }}
                        value={newStockNumber ?? undefined}
                        onChange={(value) =>
                          setNewStockNumber(value === 0 ? 0 : value)
                        }
                      />
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={tableCellStyle}>タグ</TableCell>
                <TableCell>
                  <TagManager
                    productID={itemData.id}
                    storeID={storeId}
                    initialTags={formData?.tags}
                    fetchItemData={fetchItemData}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={tableCellStyle}>商品説明</TableCell>
                <TableCell>
                  <TextField
                    sx={TextFieldStyle}
                    name="description"
                    value={formData?.description || ''}
                    onChange={handleChange}
                    fullWidth
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={tableCellStyle}>ポイント付与</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData?.allowed_point === true}
                          onChange={() => handleCheckboxChange(true)}
                          sx={{
                            '& .MuiSvgIcon-root': {
                              border: '1px solid gray', // 枠線を追加
                            },
                          }}
                        />
                      }
                      label="有効"
                      value={true}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData?.allowed_point === false}
                          onChange={() => handleCheckboxChange(false)}
                          sx={{
                            '& .MuiSvgIcon-root': {
                              border: '1px solid gray', // 枠線を追加
                            },
                          }}
                        />
                      }
                      label="無効"
                      value={false}
                    />
                  </Box>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={tableCellStyle}>登録日</TableCell>
                <TableCell>
                  {dayjs(itemData.created_at).format('YYYY-MM-DD')}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={tableCellStyle}>更新日</TableCell>
                <TableCell>
                  {dayjs(itemData.updated_at).format('YYYY-MM-DD')}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Box
          sx={{
            mt: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            gap: 2,
          }}
        >
          {itemData.specific_sell_price || itemData.specific_buy_price ? (
            <PrimaryButton
              variant="contained"
              sx={{ width: '60%' }}
              onClick={handleResetPrices}
            >
              価格リセット
            </PrimaryButton>
          ) : null}
          <PrimaryButton
            variant="contained"
            sx={{ width: '60%' }}
            onClick={() => handleUpdate()}
          >
            更新
          </PrimaryButton>
        </Box>
      </Box>
      <StockUpdateModal
        isOpen={isStockUpdateModalOpen}
        onClose={() => setIsStockUpdateModalOpen(false)}
        onConfirm={handleStockUpdateConfirm}
        isStockAdd={isStockAdd}
      />
    </>
  );
};
