import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, Button, TextField } from '@mui/material';
import { FaTimes } from 'react-icons/fa';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import Image from 'next/image';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { Store } from '@prisma/client';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';

interface Props {
  open: boolean;
  onClose: () => void;
  noStockProduct?: BackendProductAPI[0]['response']['200']['products'][0];
  storeId: Store['id'];
}

export const EditProductModal: React.FC<Props> = ({
  open,
  onClose,
  noStockProduct,
  storeId,
}) => {
  const clientAPI = createClientAPI();
  const { setAlertState } = useAlert();

  // updatedFormDataのstate管理
  const [updatedFormData, setUpdatedFormData] = useState({
    stock_number: noStockProduct?.stock_number || 1, // 在庫数デフォルト1
    wholesale_price: noStockProduct?.wholesale_price || '',
    description: noStockProduct?.description || '',
  });

  // noStockProductが更新された際にフォームデータを更新
  useEffect(() => {
    if (noStockProduct) {
      setUpdatedFormData({
        stock_number: noStockProduct.stock_number || 1, // 在庫数デフォルト1
        wholesale_price: noStockProduct.wholesale_price || '',
        description: noStockProduct.description || '',
      });
    }
  }, [noStockProduct]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdatedFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    if (storeId && noStockProduct) {
      const response = await clientAPI.product.postAdjustStock({
        storeID: storeId,
        productID: noStockProduct.id,
        body: {
          changeCount: Number(updatedFormData.stock_number),
          reason: updatedFormData.description,
          wholesalePrice: Number(updatedFormData.wholesale_price),
        },
      });

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
      onClose();
    } else {
      setAlertState({
        message: '必要な情報がありません。',
        severity: 'error',
      });
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          bgcolor: 'background.paper',
          borderRadius: '4px',
          boxShadow: 24,
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
            width: '100%',
          }}
        >
          <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
            <Typography variant="h6">在庫にない商品です</Typography>
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
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <Image
            src="/images/dangerous_icon.png"
            alt="Dangerous icon"
            width={80}
            height={80}
          />
          <Typography
            variant="body1"
            sx={{
              marginTop: '20px',
              marginBottom: '20px',
            }}
          >
            在庫にない商品がスキャンされました。
          </Typography>
          <TextField
            label="在庫数"
            name="stock_number"
            value={updatedFormData.stock_number}
            onChange={handleInputChange}
            type="number"
            sx={{
              marginBottom: '20px',
            }}
            InputLabelProps={{
              shrink: true,
              sx: {
                color: 'black',
              },
            }}
            fullWidth
          />
          <TextField
            label="仕入れ値"
            name="wholesale_price"
            value={updatedFormData.wholesale_price}
            onChange={handleInputChange}
            type="number"
            sx={{
              marginBottom: '20px',
            }}
            InputLabelProps={{
              shrink: true,
              sx: {
                color: 'black',
              },
            }}
            fullWidth
          />
          <TextField
            label="備考"
            name="description"
            value={updatedFormData.description}
            onChange={handleInputChange}
            sx={{
              marginBottom: '20px',
            }}
            multiline
            rows={4}
            InputLabelProps={{
              shrink: true,
              sx: {
                color: 'black',
              },
            }}
            fullWidth
          />
          <PrimaryButton
            variant="contained"
            sx={{
              marginTop: '10px',
              width: '200px',
            }}
            onClick={handleUpdate}
          >
            登録
          </PrimaryButton>
          <SecondaryButton
            variant="contained"
            sx={{
              marginTop: '10px',
              marginBottom: '20px',
              width: '200px',
            }}
            onClick={onClose}
          >
            戻る
          </SecondaryButton>
        </Box>
      </Box>
    </Modal>
  );
};
