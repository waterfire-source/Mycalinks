import { TransferInfo } from '@/app/auth/(dashboard)/stock/specialPriceStock/component/AddSpecialPriceStockModal/AddSpecialPriceStockModal';
import { SelectedData } from '@/app/auth/(dashboard)/stock/specialPriceStock/component/AddSpecialPriceStockModal/AddSpecialPriceStockModalContent';
import { SpecialPriceStockDetailContent } from '@/app/auth/(dashboard)/stock/specialPriceStock/component/AddSpecialPriceStockModal/SpecialPriceStockDetail/SpecialPriceStockDetailContent';
import { Box, Typography } from '@mui/material';

interface Props {
  selectedRows: SelectedData | undefined;
  transferInfo: TransferInfo | undefined;
  setTransferInfo: React.Dispatch<
    React.SetStateAction<TransferInfo | undefined>
  >;
}

export const SpecialPriceStockDetail = ({
  selectedRows,
  transferInfo,
  setTransferInfo,
}: Props) => {
  return (
    <Box
      sx={{
        backgroundColor: 'white',
        boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.2)',
        borderRadius: '4px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* ヘッダー */}
      <Box
        sx={{
          textAlign: 'left',
          height: '60px',
          width: '100%',
          minHeight: '50px',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Typography
          sx={{
            textAlign: 'left',
            ml: 2.5,
            fontWeight: 'bold',
          }}
        >
          特価在庫詳細
        </Typography>
      </Box>

      {/* メインコンテンツ */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {selectedRows ? (
          <>
            <Box sx={{ m: 2, flexGrow: 1, overflow: 'auto' }}>
              <SpecialPriceStockDetailContent
                selectedRows={selectedRows}
                transferInfo={transferInfo}
                setTransferInfo={setTransferInfo}
              />
            </Box>
          </>
        ) : (
          <>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography sx={{ mt: 2, mb: 2 }}>選択して詳細を表示</Typography>
            </Box>
          </>
        )}
      </Box>

      {/* フッター */}
      <Box
        sx={{
          height: '60px',
          width: '100%',
          minHeight: '50px',
          boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.2)',
        }}
      />
    </Box>
  );
};
