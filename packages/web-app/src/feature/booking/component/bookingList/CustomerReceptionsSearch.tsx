import { Stack, TextField, IconButton } from '@mui/material';
import { ChangeEvent, SetStateAction } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { CustomerReceptionsSearchState } from '@/feature/booking';
import { CustomerSearchField } from '@/feature/customer/components/CustomerSearchField';
import { Store } from '@prisma/client';
import RefreshIcon from '@mui/icons-material/Refresh';

type Props = {
  store: Store;
  fetchCustomerByMycaID: (
    storeID: number,
    mycaID?: number,
    mycaBarCode?: string,
  ) => Promise<void>;
  searchInput: string;
  setSearchInput: React.Dispatch<SetStateAction<string>>;
  setSearchState: (
    value: SetStateAction<CustomerReceptionsSearchState>,
  ) => void;
  handleResetSearch: () => void;
};
export const CustomerReceptionsSearch = ({
  store,
  fetchCustomerByMycaID,
  searchInput,
  setSearchInput,
  setSearchState,
  handleResetSearch,
}: Props) => {
  const onSearch = () => {
    setSearchState((prev) => {
      return {
        ...prev,
        searchCurrentPage: 0,
        customerName: searchInput ?? undefined,
      };
    });
  };

  return (
    <Stack
      direction="row"
      gap="16px"
      mt={2}
      component="form"
      alignItems="center"
    >
      <TextField
        value={searchInput}
        placeholder="お客様名"
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setSearchInput(e.target.value ?? '')
        }
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSearch();
          }
        }}
        size="small"
        sx={{ width: '400px', backgroundColor: 'white' }}
      />
      <PrimaryButtonWithIcon onClick={onSearch} icon={<SearchIcon />}>
        検索
      </PrimaryButtonWithIcon>

      <CustomerSearchField
        store={store}
        fetchCustomerByMycaID={fetchCustomerByMycaID}
        isShowInputField={true}
      />
      <IconButton onClick={handleResetSearch}>
        <RefreshIcon />
      </IconButton>
    </Stack>
  );
};
