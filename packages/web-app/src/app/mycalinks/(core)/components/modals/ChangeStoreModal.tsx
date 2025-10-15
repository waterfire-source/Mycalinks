import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
  List,
  ListItem,
  ListItemButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import { TransitionProps } from '@mui/material/transitions';
import { forwardRef } from 'react';
import { PosCustomerInfo } from '@/app/mycalinks/(core)/types/customer';
interface Props {
  open: boolean;
  onClose: () => void;
  selectedStore: PosCustomerInfo | null;
  setSelectedStore: React.Dispatch<
    React.SetStateAction<PosCustomerInfo | null>
  >;
  posCustomerInfo: PosCustomerInfo[];
}
const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function ChangeStoreModal({
  open,
  onClose,
  posCustomerInfo,
  selectedStore,
  setSelectedStore,
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: 3,
          width: '100vw',
          m: 0,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          '@media (max-width: 663.95px)': {
            maxWidth: 'none',
          },
        },
      }}
      scroll="body"
    >
      <DialogTitle
        sx={{
          fontWeight: 'bold',
          fontSize: '16px!important',
          textAlign: 'center',
          py: 2,
        }}
      >
        店舗変更
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: 'grey.500',
            position: 'absolute',
            right: 5,
            top: 10,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box
          sx={{
            width: '100%',
            backgroundColor: 'white',
            maxHeight: 'calc(100vh - 200px)',
          }}
        >
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => setSelectedStore(null)}
                sx={{
                  display: 'flex',
                  gap: 2,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {/* 左側画像 */}
                <Box sx={{ width: 30, height: 30 }} />
                {/* 中央：店舗名＋ポイント */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  flex={1}
                  gap={2}
                >
                  <Typography
                    sx={{ fontSize: '14px!important', maxWidth: '80%' }}
                    noWrap
                  >
                    すべて
                  </Typography>
                </Box>

                {/* 右側：チェックアイコン or 空白スペース */}
                {!selectedStore ? (
                  <CheckIcon
                    sx={{ color: 'primary.main', width: 20, height: 20 }}
                  />
                ) : (
                  <Box sx={{ width: 20, height: 20 }} />
                )}
              </ListItemButton>
            </ListItem>
            {posCustomerInfo?.map((customerInfo) => {
              const isSelected = selectedStore?.id === customerInfo.id;
              return (
                <>
                  <ListItem key={customerInfo.id} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        if (isSelected) {
                          setSelectedStore(null);
                          return;
                        }
                        setSelectedStore(customerInfo);
                      }}
                      sx={{
                        display: 'flex',
                        gap: 2,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      {/* 左側画像 */}
                      <Box
                        component="img"
                        src={
                          customerInfo.store?.receipt_logo_url ||
                          '/images/ec/noimage.png'
                        }
                        alt="store logo"
                        sx={{ width: 30, height: 30, objectFit: 'contain' }}
                      />

                      {/* 中央：店舗名＋ポイント */}
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        flex={1}
                        gap={2}
                      >
                        <Typography
                          sx={{ fontSize: '14px!important', maxWidth: '80%' }}
                          noWrap
                        >
                          {customerInfo.store?.display_name || ''}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '16px!important',
                            fontWeight: 'bold',
                          }}
                        >
                          {customerInfo.owned_point ?? 0}PT
                        </Typography>
                      </Box>

                      {/* 右側：チェックアイコン or 空白スペース */}
                      {isSelected ? (
                        <CheckIcon
                          sx={{ color: 'primary.main', width: 20, height: 20 }}
                        />
                      ) : (
                        <Box sx={{ width: 20, height: 20 }} />
                      )}
                    </ListItemButton>
                  </ListItem>
                </>
              );
            })}
          </List>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
