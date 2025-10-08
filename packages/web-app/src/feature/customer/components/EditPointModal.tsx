import { createClientAPI, CustomError } from '@/api/implement';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import TertiaryButtonWithIcon from '@/components/buttons/TertiaryButtonWithIcon';
import { HelpIcon } from '@/components/common/HelpIcon';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { CustomerSearchField } from '@/feature/customer/components/CustomerSearchField';
import {
  CustomerType,
  useCustomer,
} from '@/feature/customer/hooks/useCustomer';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  Modal,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FaTimes } from 'react-icons/fa';

interface Props {
  open: boolean;
  onClose: () => void;
  setCustomerInfo: React.Dispatch<
    React.SetStateAction<CustomerType | undefined>
  >;
  customerInfo: CustomerType | undefined;
  onTertiaryButtonClick: () => void;
}

export const EditPointModal = ({
  open,
  onClose,
  setCustomerInfo,
  customerInfo,
  onTertiaryButtonClick,
}: Props) => {
  const { store } = useStore();
  const { customer, fetchCustomerByMycaID, resetCustomer } = useCustomer();

  const [editPoint, setEditPoint] = useState<string>('add');
  const [point, setPoint] = useState<number>();
  const [confirm, setConfirm] = useState(false);

  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditPoint(event.target.value);
  };

  const membershipNumberRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (membershipNumberRef.current) {
          membershipNumberRef.current.focus();
        }
      }, 0);
    }
  }, [open]);

  useEffect(() => {
    if (customer) {
      setCustomerInfo(customer);
    }
  }, [customer, setCustomerInfo]);

  const onPrimaryButtonClick = async () => {
    if (!customerInfo) return;
    if (!point) return;
    if (!confirm) return;

    // 削除の場合はマイナスの数値を渡す
    const res = await clientAPI.customer.changeCustomerPoint({
      store_id: store.id,
      customer_id: customerInfo.id,
      point: editPoint === 'add' ? point : -point,
    });
    if (res instanceof CustomError) {
      setAlertState({
        message: res.message,
        severity: 'error',
      });
      return;
    }
    setAlertState({
      message: 'ポイントを変更しました',
      severity: 'success',
    });
    onClose();
    resetCustomer();
    setPoint(0);
    setEditPoint('add');
    setConfirm(false);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'white',
          borderRadius: 2,
          boxShadow: 24,
          pt: 1,
          pr: 2,
          pl: 2,
          pb: 2,
        }}
      >
        <FaTimes
          size={20}
          onClick={onClose}
          style={{
            position: 'absolute',
            right: '5px',
            color: 'black',
            backgroundColor: 'white',
            cursor: 'pointer',
            borderRadius: '50%',
            padding: '5px',
          }}
        />

        {/* タイトル */}
        <Box display="flex" alignItems="center" gap={1}>
          <Typography
            variant="h1"
            fontWeight="bold"
            color="primary.main"
            mt={2}
          >
            ポイント付与
          </Typography>
          <HelpIcon helpArchivesNumber={876} sx={{ mt: 2 }} />
        </Box>

        {/* 会員情報 */}

        {/* 会員証をスキャン*/}
        <Stack mt={2}>
          <CustomerSearchField
            store={store}
            fetchCustomerByMycaID={fetchCustomerByMycaID}
            isShowInputField={true}
            ref={membershipNumberRef}
          />
        </Stack>

        {/* 必須項目入力なしの場合の注意書き */}
        {customerInfo ? (
          <Stack
            direction="column"
            spacing={2}
            alignItems="flex-start"
            ml={3}
            mt={1}
          >
            {/* 1行目 */}
            <Stack
              direction="row"
              spacing={2}
              flexWrap="wrap"
              alignItems="center"
            >
              <Typography>会員番号：</Typography>
              <Typography>
                {customerInfo.myca_user_id ? (
                  customerInfo.id
                ) : (
                  <Typography color="primary">非会員</Typography>
                )}
              </Typography>
            </Stack>
            {/* 2行目 */}
            <Stack
              direction="row"
              spacing={2}
              flexWrap="wrap"
              alignItems="center"
            >
              <Typography>会員名：</Typography>
              <Typography>{customerInfo?.full_name}</Typography>
            </Stack>
            {/* 3行目 */}
            <Stack
              direction="row"
              spacing={2}
              flexWrap="wrap"
              alignItems="center"
            >
              <Typography>フリガナ：</Typography>
              <Typography>{customerInfo?.full_name_ruby}</Typography>
            </Stack>
            {/* 4行目 */}
            <Stack
              direction="row"
              spacing={2}
              flexWrap="wrap"
              alignItems="center"
            >
              <Typography>ポイント：</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Typography>
                  {customerInfo?.owned_point.toLocaleString()}pt
                </Typography>
                <Typography>
                  ({customerInfo?.owned_point.toLocaleString()}円分)
                </Typography>
              </Stack>
            </Stack>
            {/* 5行目 */}
            <Stack
              direction="row"
              spacing={2}
              flexWrap="wrap"
              alignItems="center"
            >
              <FormControl>
                <RadioGroup row value={editPoint} onChange={handleChange}>
                  <FormControlLabel
                    value="add"
                    control={
                      <Radio
                        sx={{
                          color: 'black',
                          '&.Mui-checked': {
                            color: 'primary.main',
                          },
                        }}
                      />
                    }
                    label="ポイント付与"
                  />
                  <FormControlLabel
                    value="remove"
                    control={
                      <Radio
                        sx={{
                          color: 'black',
                          '&.Mui-checked': {
                            color: 'primary.main',
                          },
                        }}
                      />
                    }
                    label="ポイント削除"
                  />
                </RadioGroup>
              </FormControl>
            </Stack>
            {/* 6行目 */}
            <Stack
              direction="row"
              spacing={2}
              flexWrap="wrap"
              alignItems="center"
            >
              <Typography>
                {editPoint === 'add'
                  ? '付与ポイント：'
                  : editPoint === 'remove'
                  ? '削除ポイント：'
                  : ''}
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                alignItems="center"
              >
                <TextField
                  size="small"
                  type="text"
                  required
                  value={point ?? ''}
                  onChange={(event) => setPoint(Number(event.target.value))}
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    style: {
                      height: '15px',
                    },
                  }}
                  sx={{ width: '100px' }}
                  InputProps={{
                    endAdornment: <Typography>pt</Typography>,
                  }}
                />
                <Typography>({point?.toString()}円分)</Typography>
              </Stack>
            </Stack>
            {/* 7行目 */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 2 }}
              alignItems="center"
              alignSelf="center"
            >
              <Checkbox
                onChange={() => setConfirm(!confirm)}
                sx={{
                  color: 'black',
                  padding: 0,
                  margin: 0,
                  '&.Mui-checked': {
                    color: 'primary.main',
                  },
                }}
              />
              <Typography>会員情報・付与ポイントを確認した</Typography>
            </Stack>
          </Stack>
        ) : undefined}
        {/* ボタン */}
        <Box display="flex" justifyContent="flex-end" mt={2} gap={2}>
          <TertiaryButtonWithIcon onClick={onTertiaryButtonClick}>
            キャンセル
          </TertiaryButtonWithIcon>
          <PrimaryButtonWithIcon
            onClick={onPrimaryButtonClick}
            disabled={!confirm}
          >
            {editPoint === 'add'
              ? 'ポイントを付与'
              : editPoint === 'remove'
              ? 'ポイントを削除'
              : ''}
          </PrimaryButtonWithIcon>
        </Box>
      </Box>
    </Modal>
  );
};
