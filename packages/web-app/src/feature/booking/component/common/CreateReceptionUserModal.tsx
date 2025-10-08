import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { useAlert } from '@/contexts/AlertContext';
import { CustomerSearchField } from '@/feature/customer/components/CustomerSearchField';
import {
  CustomerType,
  useCustomer,
} from '@/feature/customer/hooks/useCustomer';
import { Box, Stack, TextField, Typography } from '@mui/material';
import { Store } from '@prisma/client';
import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  store: Store;
  setCustomer: React.Dispatch<React.SetStateAction<CustomerType | undefined>>;
  handleOpenCreateReceptionModal: () => void;
}

export const CreateReceptionUserModal = ({
  open,
  onClose,
  store,
  setCustomer,
  handleOpenCreateReceptionModal,
}: Props) => {
  const { setAlertState } = useAlert();

  const {
    customer,
    resetCustomer,
    fetchCustomerByMycaID,
    fetchCustomerByCustomerID,
  } = useCustomer();

  useEffect(() => {
    const fetchCustomer = async () => {
      if (fetchCustomerByCustomerID && customer?.id && store?.id) {
        try {
          await fetchCustomerByCustomerID(store.id, customer.id, true);
        } catch (error) {
          console.error('顧客情報の取得に失敗しました。');
          setAlertState({
            message: '顧客情報の取得に失敗しました。',
            severity: 'error',
          });
        }
      }
    };
    fetchCustomer();
  }, [customer?.id, fetchCustomerByCustomerID, store?.id, setAlertState]);

  useEffect(() => {
    setCustomer(customer);
  }, [customer]);

  const handleCloseModal = () => {
    resetCustomer();
    onClose();
  };
  const receptionInfo = useMemo(() => {
    return [
      { label: '氏名', value: customer?.full_name },
      {
        label: 'フリガナ',
        value: customer?.full_name_ruby,
      },
      {
        label: '生年月日',
        value: customer?.birthday
          ? dayjs(customer?.birthday).format('YYYY/MM/DD')
          : '',
      },
      {
        label: '郵便番号',
        value: customer?.zip_code,
      },
      {
        label: '住所',
        value: [
          customer?.prefecture,
          customer?.city,
          customer?.address2,
          customer?.building,
        ]
          .filter(Boolean)
          .join(''),
      },
      {
        label: '電話番号',
        value: customer?.phone_number,
      },
      {
        label: 'メモ',
        value: customer && 'memo' in customer ? customer.memo : '',
        isMultiline: true,
      },
    ];
  }, [customer]);

  return (
    <ConfirmationDialog
      open={open}
      onClose={handleCloseModal}
      title="予約内容詳細"
      confirmButtonText="予約商品の選択へ進む"
      confirmButtonDisable={!customer}
      onConfirm={handleOpenCreateReceptionModal}
      cancelButtonText="キャンセル"
      content={
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          gap={2}
          width="100%"
        >
          <CustomerSearchField
            store={store}
            fetchCustomerByMycaID={fetchCustomerByMycaID}
            isShowInputField={true}
          />
          <Box width="500px" display="flex" flexDirection="column" gap={2}>
            {receptionInfo.map((item) => (
              <Stack flexDirection="row" alignItems="center" key={item.label}>
                <Typography variant="body2" sx={{ width: '120px' }}>
                  {item.label}
                </Typography>
                <TextField
                  value={item.value}
                  variant="outlined"
                  size="small"
                  fullWidth
                  multiline={item.isMultiline}
                  rows={item.isMultiline ? 4 : 1}
                  sx={{
                    backgroundColor: 'white',
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'rgba(0, 0, 0, 0.23)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(0, 0, 0, 0.23)',
                      },
                    },
                    '& .MuiInputBase-root': {
                      overflow: 'auto',
                    },
                  }}
                  InputProps={{
                    readOnly: true,
                    sx: {
                      color: 'text.primary',
                    },
                  }}
                />
              </Stack>
            ))}
          </Box>
        </Box>
      }
    />
  );
};
