import React from 'react';
import {
  Box,
  Checkbox,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { CustomModalWithHeader } from '@/components/modals/CustomModalWithHeader';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { ImagePicker } from '@/components/cards/ImagePicker';
import ProductDetailCard from '@/app/auth/(dashboard)/item/[item_id]/ProductDetailCard';
import { FormattedItem } from '@/components/dataGrid/RightClickDataGrid';

const editableProps = [
  { propName: 'displayName', type: 'text', displayName: '商品名' },
  { propName: 'displayNameRuby', type: 'text', displayName: '商品名カナ' },
  { propName: 'sellPrice', type: 'number', displayName: '販売価格' },
  { propName: 'buyPrice', type: 'number', displayName: '買取価格' },
  { propName: 'rarity', type: 'text', displayName: 'レアリティ' },
  { propName: 'packName', type: 'text', displayName: 'パック名' },
  { propName: 'description', type: 'text', displayName: '概要' },
  {
    propName: 'isBuyOnly',
    type: 'checkbox',
    displayName: '買取専用',
  },
  {
    propName: 'orderNumber',
    type: 'number',
    displayName: '表示順（番号が高い順に表示、規定値は0',
  },
  {
    propName: 'readonlyProductCode',
    type: 'text',
    displayName: 'JANコード（カンマ区切りで複数）',
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
  itemData: FormattedItem;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleCheckBoxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmitUpdateItem: () => void;
  handleImageUploaded: (image_url: any) => void;
  isLoading: boolean;
}

export const ItemDetailModal: React.FC<Props> = ({
  open,
  onClose,
  itemData,
  handleInputChange,
  handleCheckBoxChange,
  handleSubmitUpdateItem,
  isLoading,
  handleImageUploaded,
}) => {
  return (
    <CustomModalWithHeader
      open={open}
      onClose={onClose}
      title="商品詳細"
      width={'85%'}
      height={'85%'}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          gap: '20px',
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={2}>
            {itemData.imageUrl ? (
              <Box sx={{ width: '100%' }}>
                <img
                  src={itemData.imageUrl}
                  alt="Card"
                  style={{ width: '100%', objectFit: 'cover' }}
                />
              </Box>
            ) : (
              <Typography variant="body1" sx={{ textAlign: 'center' }}>
                画像未設定
              </Typography>
            )}
            <ImagePicker kind="item" onImageUploaded={handleImageUploaded} />
          </Grid>
          <Grid item xs={5}>
            <TableContainer component={Paper}>
              <Table>
                <TableBody>
                  {itemData && (
                    <>
                      <TableRow key="mycaItemId">
                        <TableCell
                          sx={{
                            textAlign: 'center',
                            width: '30%',
                            backgroundColor: 'grey.700',
                            color: 'text.secondary',
                          }}
                        >
                          MycaID
                        </TableCell>
                        <TableCell sx={{ width: '70%', color: 'text.primary' }}>
                          {itemData.mycaItemId}
                        </TableCell>
                      </TableRow>

                      {editableProps.map((prop) => (
                        <TableRow key={prop.propName}>
                          <TableCell
                            sx={{
                              textAlign: 'center',
                              width: '30%',
                              backgroundColor: 'grey.700',
                              color: 'text.secondary',
                            }}
                            size={'small'}
                          >
                            {prop.displayName}
                          </TableCell>
                          <TableCell sx={{ width: '70%' }} size={'small'}>
                            {prop.type === 'checkbox' ? (
                              <Checkbox
                                sx={{
                                  '& .MuiSvgIcon-root': {
                                    color: 'grey.300',
                                  },
                                }}
                                name={prop.propName}
                                checked={
                                  (itemData[
                                    prop.propName as keyof FormattedItem
                                  ] as boolean) || false
                                }
                                onChange={handleCheckBoxChange}
                              />
                            ) : (
                              <TextField
                                label=""
                                type={prop.type}
                                name={prop.propName}
                                value={
                                  itemData[
                                    prop.propName as keyof FormattedItem
                                  ] || ''
                                }
                                onChange={handleInputChange}
                                fullWidth
                                size={'small'}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}

                      <TableRow key="department_id">
                        <TableCell
                          sx={{
                            textAlign: 'center',
                            width: '30%',
                            backgroundColor: 'grey.700',
                            color: 'text.secondary',
                          }}
                          size={'small'}
                        >
                          部門名
                        </TableCell>
                        <TableCell sx={{ width: '70%' }}>
                          {itemData.departmentDisplayName}
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <PrimaryButton
                onClick={handleSubmitUpdateItem}
                disabled={isLoading}
                loading={isLoading}
              >
                情報を更新
              </PrimaryButton>
            </Box>
          </Grid>
          <Grid item xs={5}>
            {itemData?.products && (
              <Box>
                {itemData.products.map((product, index) => (
                  <ProductDetailCard key={index} product={product} />
                ))}
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </CustomModalWithHeader>
  );
};
