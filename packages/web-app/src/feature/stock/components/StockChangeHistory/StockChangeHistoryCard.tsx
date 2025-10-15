import { Box, Typography } from '@mui/material';
import { blue, grey } from '@mui/material/colors';
import dayjs from 'dayjs';
import { Product_Stock_History } from '@prisma/client';
import CachedIcon from '@mui/icons-material/Cached';
import { ProductChangeHistory } from '@/feature/stock/changeHistory/useChangeHistory';

type TransactionCardProps = {
  history: ProductChangeHistory;
};

// カラーとラベルのマッピング定義
const TRANSACTION_COLORS: Partial<
  Record<Product_Stock_History['source_kind'], string>
> = {
  transaction_sell: blue[500],
  transaction_buy: '#8B0000',
};

const TRANSACTION_LABELS: Partial<
  Record<Product_Stock_History['source_kind'], string>
> = {
  transaction_sell: '販',
  transaction_buy: '買',
  transaction_sell_return: '販返',
  transaction_buy_return: '買返',
  product: '在更',
  loss: 'ロス',
  stocking: '仕入',
  transfer: '在転',
  pack_opening: '開封',
  bundle: 'バ',
  bundle_release: 'バ解',
  original_pack: '福',
  original_pack_release: '福解',
  pack_opening_unregister: '未割',
  appraisal_create: '鑑作',
  appraisal_return: '鑑戻',
};

// デフォルト値を返す関数を定義
function getTransactionColor(
  sourceKind: Product_Stock_History['source_kind'],
): string {
  return TRANSACTION_COLORS[sourceKind] || grey[500]; // 未定義のキーにはデフォルトカラー
}

function getTransactionLabel(
  sourceKind: Product_Stock_History['source_kind'],
): string {
  return TRANSACTION_LABELS[sourceKind] || '不明'; // 未定義のキーにはデフォルトラベル
}

export function StockChangeHistoryCard({ history }: TransactionCardProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        padding: '10px',
      }}
    >
      {/* アイコン */}
      <Box
        sx={{
          width: '30px',
          height: '30px',
          backgroundColor: getTransactionColor(history.source_kind),
          borderRadius: '50%', // 完全な円形にする
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0, // 親のサイズ変更で潰れないようにする
        }}
      >
        {history.source_kind === 'transfer' ? (
          <CachedIcon
            sx={{
              color: '#fff', // アイコンの色を白に設定
              fontSize: '18px',
            }}
          />
        ) : (
          <Typography
            sx={{
              color: '#fff',
              fontWeight: 'bold',
              fontSize:
                getTransactionLabel(history.source_kind).length === 1
                  ? '16px'
                  : '10px', // 一文字の場合は大きく
            }}
          >
            {getTransactionLabel(history.source_kind)}
          </Typography>
        )}
      </Box>

      {/* 左側の情報 */}
      <Box
        sx={{
          marginLeft: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flex: 1, // 横幅調整
        }}
      >
        <Typography sx={{ fontSize: '11px' }}>取引ID: {history.id}</Typography>
        <Typography
          sx={{ marginTop: '2px', fontSize: '11px', fontWeight: 'bold' }}
        >
          ¥{history.unit_price.toLocaleString()}
        </Typography>
      </Box>
      {/* 右側の情報 */}
      <Box
        sx={{
          marginLeft: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flex: 1, // 横幅調整
        }}
      >
        <Typography sx={{ fontSize: '10px' }}>
          {dayjs(history.datetime).format('YYYY/MM/DD HH:mm:ss')}
        </Typography>
        <Typography sx={{ marginTop: '2px', fontSize: '10px' }}>
          在庫変動:
          {history.item_count > 0
            ? `${(history.result_stock_number || 0) - history.item_count} → ${
                history.result_stock_number
              }`
            : `${
                (history.result_stock_number || 0) +
                Math.abs(history.item_count)
              } → ${history.result_stock_number}`}
        </Typography>
      </Box>
    </Box>
  );
}
