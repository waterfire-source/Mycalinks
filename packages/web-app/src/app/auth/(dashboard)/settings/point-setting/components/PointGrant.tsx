import { StorePointSettingUpdateState } from '@/feature/store/hooks/useUpdateStorePointInfo';
import { Box, Typography } from '@mui/material';
import { PointOpportunity, TransactionPaymentMethod } from '@prisma/client';
import { RadioForPoint } from '@/app/auth/(dashboard)/settings/point-setting/components/RadioForPoint';
import { TextFieldForPoint } from '@/app/auth/(dashboard)/settings/point-setting/components/TextFieldForPoint';
import { useRegister } from '@/contexts/RegisterContext';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';

interface Props {
  canEnableVisitPoint?: boolean;
  visitPointPer?: PointOpportunity;
  visitPointAmount?: number;
  canEnableSellPoint?: boolean;
  sellPointPer?: number;
  canEnableSellPointLimit?: boolean;
  sellPointLimitPer?: PointOpportunity;
  sellPointLimitAmount?: number;
  canEnableBuyPoint?: boolean;
  buyPointPer?: number;
  canEnableBuyPointLimit?: boolean;
  buyPointLimitPer?: PointOpportunity;
  buyPointLimitAmount?: number;
  setPointSettings: React.Dispatch<
    React.SetStateAction<StorePointSettingUpdateState>
  >;
  sellPaymentMethod?: TransactionPaymentMethod[];
  buyPaymentMethod?: TransactionPaymentMethod[];
}

export const PointGrant = ({
  canEnableVisitPoint,
  visitPointPer,
  visitPointAmount,
  canEnableSellPoint,
  sellPointPer,
  canEnableSellPointLimit,
  sellPointLimitPer,
  sellPointLimitAmount,
  canEnableBuyPoint,
  buyPointPer,
  canEnableBuyPointLimit,
  buyPointLimitPer,
  buyPointLimitAmount,
  setPointSettings,
  sellPaymentMethod,
  buyPaymentMethod,
}: Props) => {
  const { register } = useRegister();
  // レジの支払い方法（販売）を配列化
  const availableSellPaymentMethods = register?.sell_payment_method
    ?.split(',')
    .map((m) => m.trim())
    .filter((m): m is TransactionPaymentMethod =>
      Object.values(TransactionPaymentMethod).includes(
        m as TransactionPaymentMethod,
      ),
    );

  // レジの支払い方法（買取）を配列化
  const availableBuyPaymentMethods = register?.buy_payment_method
    ?.split(',')
    .map((m) => m.trim())
    .filter((m): m is TransactionPaymentMethod =>
      Object.values(TransactionPaymentMethod).includes(
        m as TransactionPaymentMethod,
      ),
    );

  // 表示用のラベル定義（販売）
  const sellPaymentMethodOptions: {
    method: TransactionPaymentMethod;
    label: string;
  }[] = [
    { method: TransactionPaymentMethod.cash, label: '現金' },
    { method: TransactionPaymentMethod.square, label: 'カード' },
    { method: TransactionPaymentMethod.paypay, label: 'QR決済' },
    { method: TransactionPaymentMethod.felica, label: '電子マネー' },
    { method: TransactionPaymentMethod.bank, label: '銀行振込' },
  ];

  // 表示用のラベル定義（買取）
  const buyPaymentMethodOptions: {
    method: TransactionPaymentMethod;
    label: string;
  }[] = [
    { method: TransactionPaymentMethod.cash, label: '現金' },
    { method: TransactionPaymentMethod.bank, label: '銀行振込' },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h3">ポイント付与設定</Typography>
      <Box
        sx={{
          bgcolor: 'white',
          mt: 2,
          p: 0.2,
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
          borderRadius: '4px',
        }}
      >
        <Box sx={{ m: 2 }}>
          {/* <Box>
            <Typography variant="body1">来店ポイント</Typography>
            <RadioForPoint
              canEnable={canEnableVisitPoint}
              trueLabel={'付与する'}
              falseLabel={'付与しない'}
              settingKey={'visitPointEnabled'}
              setPointSettings={setPointSettings}
            />
            {canEnableVisitPoint && (
              <Box
                sx={{
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 0,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 0.5,
                    alignItems: 'center',
                  }}
                >
                  <SelectForPoint
                    value={visitPointPer}
                    settingKey={'visitPointPer'}
                    setPointSettings={setPointSettings}
                  />
                  <Typography variant="body1">につき</Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 0.5,
                      alignItems: 'center',
                    }}
                  >
                    <TextFieldForPoint
                      value={visitPointAmount}
                      settingKey={'visitPointAmount'}
                      setPointSettings={setPointSettings}
                    />
                    <Typography variant="body1">ポイント</Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Box> */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">販売ポイント</Typography>
            <RadioForPoint
              canEnable={canEnableSellPoint}
              trueLabel={'付与する'}
              falseLabel={'付与しない'}
              settingKey={'sellPointEnabled'}
              setPointSettings={setPointSettings}
            />
            {canEnableSellPoint && (
              <Box
                sx={{
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 0,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 0.5,
                    alignItems: 'center',
                  }}
                >
                  <TextFieldForPoint
                    value={sellPointPer}
                    settingKey={'sellPointPer'}
                    setPointSettings={setPointSettings}
                  />
                  <Typography variant="body1">円につき1ポイント</Typography>
                </Box>
              </Box>
            )}
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">販売ポイント付与対象決算</Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                alignItems: 'center',
                mt: 1.5,
              }}
            >
              {sellPaymentMethodOptions
                .filter(
                  ({ method }) => availableSellPaymentMethods?.includes(method),
                )
                .map(({ method, label }) => {
                  const isSelected =
                    sellPaymentMethod?.includes(method) ?? false;
                  const ButtonComponent = isSelected
                    ? PrimaryButtonWithIcon
                    : SecondaryButtonWithIcon;

                  return (
                    <ButtonComponent
                      key={method}
                      onClick={() => {
                        setPointSettings((prev) => {
                          const current = prev.sellPaymentMethod ?? [];
                          const next = current.includes(method)
                            ? // 押して外したいときは除外
                              current.filter((m) => m !== method)
                            : // 押して追加したいときはスプレッドで追加
                              [...current, method];
                          return { ...prev, sellPaymentMethod: next };
                        });
                      }}
                      sx={{ minWidth: '0px' }}
                    >
                      {label}
                    </ButtonComponent>
                  );
                })}
            </Box>
          </Box>
          {/* <Box sx={{ mt: 2 }}>
            <Typography variant="body1">販売ポイント付与上限</Typography>
            <RadioForPoint
              canEnable={canEnableSellPointLimit}
              trueLabel={'設定する'}
              falseLabel={'設定しない'}
              settingKey={'sellPointLimitEnabled'}
              setPointSettings={setPointSettings}
            />
            {canEnableSellPointLimit && (
              <Box
                sx={{
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 0,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 0.5,
                    alignItems: 'center',
                  }}
                >
                  <SelectForPoint
                    value={sellPointLimitPer}
                    settingKey={'sellPointLimitPer'}
                    setPointSettings={setPointSettings}
                  />
                  <Typography variant="body1">につき</Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 0.5,
                      alignItems: 'center',
                    }}
                  >
                    <TextFieldForPoint
                      value={sellPointLimitAmount}
                      settingKey={'sellPointLimitAmount'}
                      setPointSettings={setPointSettings}
                    />
                    <Typography variant="body1">ポイントまで</Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Box> */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">買取ポイント</Typography>
            <RadioForPoint
              canEnable={canEnableBuyPoint}
              trueLabel={'付与する'}
              falseLabel={'付与しない'}
              settingKey={'buyPointEnabled'}
              setPointSettings={setPointSettings}
            />
            {canEnableBuyPoint && (
              <Box
                sx={{
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 0,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 0.5,
                    alignItems: 'center',
                  }}
                >
                  <TextFieldForPoint
                    value={buyPointPer}
                    settingKey={'buyPointPer'}
                    setPointSettings={setPointSettings}
                  />
                  <Typography variant="body1">円につき1ポイント</Typography>
                </Box>
              </Box>
            )}
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">買取ポイント付与対象決済</Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                alignItems: 'center',
                mt: 1.5,
              }}
            >
              {buyPaymentMethodOptions
                .filter(
                  ({ method }) => availableBuyPaymentMethods?.includes(method),
                )
                .map(({ method, label }) => {
                  const isSelected =
                    buyPaymentMethod?.includes(method) ?? false;
                  const ButtonComponent = isSelected
                    ? PrimaryButtonWithIcon
                    : SecondaryButtonWithIcon;

                  return (
                    <ButtonComponent
                      key={method}
                      onClick={() => {
                        setPointSettings((prev) => {
                          const current = prev.buyPaymentMethod ?? [];
                          const next = current.includes(method)
                            ? current.filter((m) => m !== method)
                            : [...current, method];
                          return { ...prev, buyPaymentMethod: next };
                        });
                      }}
                      sx={{ minWidth: '0px' }}
                    >
                      {label}
                    </ButtonComponent>
                  );
                })}
            </Box>
          </Box>
          {/* <Box sx={{ mt: 2 }}>
            <Typography variant="body1">買取ポイント付与上限</Typography>
            <RadioForPoint
              canEnable={canEnableBuyPointLimit}
              trueLabel={'設定する'}
              falseLabel={'設定しない'}
              settingKey={'buyPointLimitEnabled'}
              setPointSettings={setPointSettings}
            />
            {canEnableBuyPointLimit && (
              <Box
                sx={{
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 0,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 0.5,
                    alignItems: 'center',
                  }}
                >
                  <SelectForPoint
                    value={buyPointLimitPer}
                    settingKey={'buyPointLimitPer'}
                    setPointSettings={setPointSettings}
                  />
                  <Typography variant="body1">につき</Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 0.5,
                      alignItems: 'center',
                    }}
                  >
                    <TextFieldForPoint
                      value={buyPointLimitAmount}
                      settingKey={'buyPointLimitAmount'}
                      setPointSettings={setPointSettings}
                    />
                    <Typography variant="body1">ポイントまで</Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Box> */}
        </Box>
      </Box>
    </Box>
  );
};
