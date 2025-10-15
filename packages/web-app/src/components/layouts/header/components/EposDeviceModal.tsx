import React, { useMemo, useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  FormControl,
  TextField,
  SxProps,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { useEposDevice } from '@/contexts/EposDeviceContext';
import { StyleUtil } from '@/utils/style';

interface Props {
  sx?: SxProps;
}
export const EposDeviceModal: React.FC<Props> = ({ sx }) => {
  const {
    setModalOpen: setOpen,
    modalOpen: open,
    status,
    setSerialCode,
    serialCode,
    setUpEpos,
    connectionMode,
    setConnectionMode,
    mycalinksConnectorPort,
    setMycalinksConnectorPort,
    registerAsParentDevice,
    parentDeviceId,
    remoteDeviceId,
  } = useEposDevice();

  const isAllOk = useMemo(
    () => Object.values(status).every((e) => e == '利用可能'),
    [status],
  );

  const isParent = useMemo(
    () => parentDeviceId === remoteDeviceId,
    [parentDeviceId, remoteDeviceId],
  );

  const handleSerialCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 全角入力されたら削除する
    const halfWidthStr = e.target.value.replace(/[^\x00-\x7F]/g, '');
    setSerialCode(halfWidthStr);
  };

  const [inEdit, setInEdit] = useState<boolean>(false);

  const handleConnectionModeChange = (
    event: SelectChangeEvent<'connector' | 'lan' | 'child'>,
  ) => {
    setConnectionMode(event.target.value as 'connector' | 'lan' | 'child');
  };

  const handleMycalinksConnectorPortChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setMycalinksConnectorPort(e.target.value);
  };

  return (
    <>
      <SecondaryButton onClick={() => setOpen(true)} sx={sx}>
        プリンター設定{isAllOk ? '' : '（未接続あり）'}
      </SecondaryButton>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: 80,
            right: 150,
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: '4px',
            boxShadow: 24,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontSize: 14 }}>
              接続モード
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={connectionMode}
                onChange={handleConnectionModeChange}
              >
                <MenuItem value="lan">ネットワーク</MenuItem>
                <MenuItem value="connector">コネクタ</MenuItem>
                <MenuItem value="child">子機</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {!isAllOk && connectionMode !== 'child' && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <PrimaryButton onClick={setUpEpos}>再セットアップ</PrimaryButton>
            </Box>
          )}
          {connectionMode !== 'child' && (
            <>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <PrimaryButton
                  onClick={registerAsParentDevice}
                  disabled={isParent}
                >
                  {isParent ? '親機として設定済み' : 'この端末を親機にする'}
                </PrimaryButton>
              </Box>
              {/* <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <OpenDrawerButton />
              </Box> */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {connectionMode === 'lan' ? (
                  <>
                    <Typography variant="h6" sx={{ fontSize: 14 }}>
                      シリアルコードまたは
                      <br />
                      IPアドレス
                    </Typography>
                    <FormControl
                      fullWidth
                      sx={{
                        width: 220,
                        ...StyleUtil.flex.row,
                      }}
                    >
                      <TextField
                        size="small"
                        placeholder="シリアルコード"
                        disabled={!inEdit}
                        value={serialCode}
                        onChange={handleSerialCodeChange}
                      />
                      <PrimaryButton onClick={() => setInEdit((p) => !p)}>
                        {inEdit ? '確定' : '編集'}
                      </PrimaryButton>
                    </FormControl>
                  </>
                ) : connectionMode === 'connector' ? (
                  <>
                    <Typography variant="h6" sx={{ fontSize: 14 }}>
                      ポート番号
                    </Typography>
                    <FormControl
                      fullWidth
                      sx={{
                        width: 220,
                        ...StyleUtil.flex.row,
                      }}
                    >
                      <TextField
                        size="small"
                        placeholder="ポート番号"
                        value={mycalinksConnectorPort}
                        onChange={handleMycalinksConnectorPortChange}
                      />
                    </FormControl>
                  </>
                ) : (
                  <></>
                )}
              </Box>
            </>
          )}
          <Box>
            <Typography variant="h6" sx={{ fontSize: 15 }}>
              接続状況
            </Typography>
            <Typography sx={{ fontSize: 11, marginBottom: 2 }}>
              ※接続できない時はページを再読み込みしたらうまくいくことがあります
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2,1fr)',
                gap: 1,
              }}
            >
              {connectionMode !== 'child' ? (
                <>
                  <Typography sx={{ fontSize: 13 }}>
                    EPOSネットワーク
                  </Typography>
                  <Typography sx={{ fontSize: 13 }}>
                    {status.ePosDev}
                  </Typography>
                  <Typography sx={{ fontSize: 13 }}>
                    レシートプリンター
                  </Typography>
                  <Typography sx={{ fontSize: 13 }}>
                    {status.printer}
                  </Typography>
                  <Typography sx={{ fontSize: 13 }}>
                    カスタマーディスプレイ
                  </Typography>
                  <Typography sx={{ fontSize: 13 }}>
                    {status.display}
                  </Typography>
                </>
              ) : (
                <>
                  <Typography sx={{ fontSize: 13 }}>親機</Typography>
                  <Typography sx={{ fontSize: 13 }}>
                    {remoteDeviceId ? '設定済み' : '未設定'}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Modal>
    </>
  );
};
