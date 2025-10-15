import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { Store } from '@prisma/client';
import { CustomerSearchField } from '@/feature/customer/components/CustomerSearchField';
import { ReceptionsSearchState, ReceptionStatus } from '@/feature/booking';
import RefreshIcon from '@mui/icons-material/Refresh';
import { ChangeEvent } from 'react';

interface Props {
  store: Store;
  fetchCustomerByMycaID: (
    storeID: number,
    mycaID?: number,
    mycaBarCode?: string,
  ) => Promise<void>;
  receptionsSearchState: ReceptionsSearchState;
  handleChangeReservationId: (newValue: number) => void;
  handleChangeCustomerName: (newValue: string) => void;
  handleChangeStatus: (newValue: ReceptionStatus) => void;
  handleChangeOrderBy: (newValue: string) => void;
  handleResetSearch: () => void;
}

export const ReservationStatusReceptionTableSearch = ({
  store,
  fetchCustomerByMycaID,
  receptionsSearchState,
  handleChangeReservationId,
  handleChangeCustomerName,
  handleChangeStatus,
  handleChangeOrderBy,
  handleResetSearch,
}: Props) => {
  return (
    <Box
      sx={{
        borderBottom: '1px solid',
        borderBottomColor: 'grey.200',
        backgroundColor: 'white',
      }}
    >
      <Stack direction="column" p={2} gap={1}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h2">受付済み予約</Typography>

          <Stack direction="row" gap={1} alignItems="center">
            <Typography>並び替え</Typography>
            <FormControl
              size="small"
              sx={{
                minWidth: 100,
                '@media (min-width: 1400px)': {
                  minWidth: 120,
                },
              }}
            >
              <InputLabel id="createAt" sx={{ color: 'text.primary' }}>
                受付日時
              </InputLabel>
              <Select
                labelId="createAt"
                label="受付日時"
                value={receptionsSearchState.orderBy || ''}
                onChange={(e) => {
                  handleChangeOrderBy(e.target.value as string);
                }}
              >
                <MenuItem value="">指定なし</MenuItem>
                <MenuItem value="created_at_asc">昇順</MenuItem>
                <MenuItem value="created_at_desc">降順</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>
        <Stack direction="row" gap={2} alignItems="center">
          <NumericTextField
            placeholder="予約番号"
            value={receptionsSearchState.reservationId}
            onChange={(val) => handleChangeReservationId(val)}
            FormHelperTextProps={{
              sx: {
                backgroundColor: '#f5f5f5',
                margin: 0,
                paddingTop: '4px',
              },
            }}
            noSpin
            sx={{ width: '100px', backgroundColor: 'white' }}
          />
          <TextField
            value={receptionsSearchState.customerName}
            placeholder="お客様名"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChangeCustomerName(e.target.value ?? '')
            }
            size="small"
            sx={{ width: '200px', backgroundColor: 'white' }}
          />
          <FormControl
            size="small"
            sx={{
              minWidth: 100,
              '@media (min-width: 1400px)': {
                minWidth: 120,
              },
            }}
          >
            <InputLabel id="status">受け渡し</InputLabel>
            <Select
              value={receptionsSearchState.status}
              onChange={(e) =>
                handleChangeStatus(e.target.value as ReceptionStatus)
              }
            >
              <MenuItem value={ReceptionStatus.ALL}>
                <Typography>すべて</Typography>
              </MenuItem>
              <MenuItem value={ReceptionStatus.RECEIVED}>
                <Typography>済</Typography>
              </MenuItem>
              <MenuItem value={ReceptionStatus.PENDING}>
                <Typography>未</Typography>
              </MenuItem>
            </Select>
          </FormControl>
          <CustomerSearchField
            store={store}
            fetchCustomerByMycaID={fetchCustomerByMycaID}
            isShowInputField={true}
          />
          <IconButton onClick={handleResetSearch}>
            <RefreshIcon />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
};
