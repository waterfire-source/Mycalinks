import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SxProps,
} from '@mui/material';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { LabelPrinter } from '@/utils/labelPrinter';
import DeleteIcon from '@mui/icons-material/Delete';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { useLabelPrinterHistory } from '@/contexts/LabelPrinterContext';
import { StyleUtil } from '@/utils/style';

const statusDict = {
  printing: '印刷中',
  pending: '待機中',
  error: 'エラー',
};

interface Props {
  sx?: SxProps;
}

export const LabelPrinterHistoryModal: React.FC<Props> = ({ sx }) => {
  const {
    setModalOpen: setOpen,
    modalOpen: open,
    setRunning,
    printQueue,
    setPrintQueue,
    running,
    setOptions,
    options,
    templates,
    handleSizeChange,
  } = useLabelPrinterHistory();

  return (
    <>
      <SecondaryButton onClick={() => setOpen(true)} sx={sx}>
        ラベル印刷設定
        {printQueue.length > 0 && `(${printQueue.length})`}
      </SecondaryButton>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: 80,
            right: 150,
            width: 700,
            bgcolor: 'background.paper',
            borderRadius: '4px',
            boxShadow: 24,
            py: 3,
            px: 2,
          }}
        >
          <Box
            sx={{
              ...StyleUtil.flex.row,
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h6">ラベル印刷設定</Typography>
            <Box
              sx={{
                ...StyleUtil.flex.row,
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <FormControl
                fullWidth
                sx={{
                  width: 150,
                  ...StyleUtil.flex.row,
                }}
              >
                <InputLabel sx={{ color: 'text.primary' }}>
                  在庫ラベル
                </InputLabel>
                <Select
                  value={options.product.price}
                  label="在庫ラベル"
                  onChange={(e) =>
                    setOptions({
                      product: {
                        price: e.target.value as typeof options.product.price,
                      },
                    })
                  }
                  sx={{
                    backgroundColor: 'common.white',
                    width: 150,
                  }}
                >
                  <MenuItem value="auto">自動振り分け</MenuItem>
                  <MenuItem value="noPrice">価格なし</MenuItem>
                  <MenuItem value="withPrice">価格あり</MenuItem>
                </Select>
              </FormControl>
              <FormControl
                fullWidth
                sx={{
                  width: 170,
                  ...StyleUtil.flex.row,
                }}
              >
                <InputLabel sx={{ color: 'text.primary' }}>サイズ</InputLabel>
                <Select
                  value={options.size}
                  label="サイズ"
                  onChange={(e) => handleSizeChange(e.target.value)}
                  sx={{
                    backgroundColor: 'common.white',
                    width: 170,
                  }}
                >
                  <MenuItem value="62x29">62x29</MenuItem>
                  <MenuItem value="29x42">29x42</MenuItem>
                  <MenuItem value="29x42_largePrice">29x42(価格大)</MenuItem>
                  <MenuItem value="39x48">39x48</MenuItem>
                  <MenuItem value="52x29">52x29</MenuItem>
                  {/* アップロードしたテンプレート.lbx */}
                  {templates.length > 0 &&
                    templates
                      .filter((template) => template.url) // urlがあるもののみ
                      .map((template) => {
                        return (
                          <MenuItem
                            key={template.id}
                            value={template.url || ''}
                          >
                            {template.display_name}
                          </MenuItem>
                        );
                      })}
                </Select>
              </FormControl>
              <FormControl
                fullWidth
                sx={{
                  width: 80,
                  ...StyleUtil.flex.row,
                }}
              >
                <InputLabel sx={{ color: 'text.primary' }}>カット</InputLabel>
                <Select
                  value={options.cut}
                  label="カット"
                  onChange={(e) =>
                    setOptions({
                      cut: e.target.value as typeof options.cut,
                    })
                  }
                  sx={{
                    backgroundColor: 'common.white',
                    width: 80,
                  }}
                >
                  <MenuItem value="do">自動</MenuItem>
                  <MenuItem value="not">手動</MenuItem>
                  <MenuItem value="auto">取引ごと</MenuItem>
                </Select>
              </FormControl>
              <FormControl
                fullWidth
                sx={{
                  width: 120,
                  ...StyleUtil.flex.row,
                }}
              >
                <InputLabel sx={{ color: 'text.primary' }}>
                  在庫仕入れ値
                </InputLabel>
                <Select
                  value={options.wholesalePrice}
                  label="在庫仕入れ値"
                  onChange={(e) =>
                    setOptions({
                      wholesalePrice: e.target
                        .value as typeof options.wholesalePrice,
                    })
                  }
                  sx={{
                    backgroundColor: 'common.white',
                    width: 120,
                  }}
                >
                  <MenuItem value="do">あり</MenuItem>
                  <MenuItem value="not">なし</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box
            sx={{
              overflowX: 'scroll',
              display: 'flex',
              flexDirection: 'row',
              gap: 1,
              mt: 1,
            }}
          >
            {printQueue.map((queue) => {
              return (
                <Box key={queue.id}>
                  <Box sx={{ width: 100, backgroundColor: 'grey.200', p: 1 }}>
                    <Typography
                      sx={{ fontSize: '0.8rem', textAlign: 'center' }}
                    >
                      {LabelPrinter.getTemplateName(queue.template)}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.7rem',
                        textAlign: 'center',
                      }}
                    >
                      ID:{queue.data}
                    </Typography>
                    <Typography
                      sx={{
                        color:
                          queue.status == 'pending' ? 'black' : 'primary.main',
                        fontSize: '0.7rem',
                        textAlign: 'center',
                      }}
                    >
                      {statusDict[queue.status]}
                    </Typography>
                    <Box>
                      {queue.status != 'printing' && (
                        <DeleteIcon
                          onClick={() =>
                            //キューから取り除く
                            setPrintQueue((prev) =>
                              prev.filter((e) => e.id != queue.id),
                            )
                          }
                          sx={{ fontSize: 20 }}
                        ></DeleteIcon>
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
          <Box
            sx={{
              mt: 2,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 2,
              justifyContent: 'space-between',
            }}
          >
            <Typography>合計印刷数 {printQueue.length}件</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
              {printQueue.length ? (
                <SecondaryButton
                  onClick={() =>
                    setPrintQueue((prev) =>
                      prev.filter((e) => e.status == 'printing'),
                    )
                  }
                >
                  全て削除
                </SecondaryButton>
              ) : null}
              {running ? (
                <SecondaryButton onClick={() => setRunning(false)}>
                  印刷中止
                </SecondaryButton>
              ) : (
                <PrimaryButton onClick={() => setRunning(true)}>
                  印刷開始
                </PrimaryButton>
              )}
            </Box>
          </Box>
        </Box>
      </Modal>
    </>
  );
};
