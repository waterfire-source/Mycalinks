import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Popover,
  CircularProgress,
  Stack,
} from '@mui/material';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { BackendTransactionAPI } from '@/app/api/store/[store_id]/transaction/api';
import { useTransactionCart } from '@/feature/purchaseReception/hooks/useTransactionCart';
import { useCustomer } from '@/feature/customer/hooks/useCustomer';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';
import {
  NewPurchaseModalContainer,
  PurchaseReceptionFormData,
} from '@/feature/purchaseReception/components/modals/NewPurchaseModalContainer';
import { TransactionKind } from '@prisma/client';
import { useStore } from '@/contexts/StoreContext';
import { usePurchaseTransaction } from '@/feature/transaction/hooks/usePurchaseTransaction';
import { createClientAPI, CustomError } from '@/api/implement';
import { DetailTableBody } from '@/feature/purchaseReception/components/modals/DetailTableBody';
import { useAccountGroupContext } from '@/contexts/AccountGroupProvider';
import { useEposDevice } from '@/contexts/EposDeviceContext';
import { useAlert } from '@/contexts/AlertContext';
import { MycaPosApiClient } from 'api-generator/client';
import { OpenSignatureConfirmButton } from '@/feature/purchaseReception/components/modals/modalComponents/minor/component/OpenSignatureConfirmButton';
import { useLabelPrinterHistory } from '@/contexts/LabelPrinterContext';
import { CommonCheckbox } from '@/feature/purchaseReception/components/modals/modalComponents/common/CommonCheckbox';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { useSaveLocalStorage } from '@/feature/purchaseReception/hooks/useSaveLocalStorage';

interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  transaction: BackendTransactionAPI[5]['response']['200']['transactions'][0];
  onConfirmClick: () => void;
}

// 身分証明書
export const IdKind = {
  license: 'license',
  healthInsurance: 'healthInsurance',
  myNumber: 'myNumber',
  studentId: 'studentId',
  alienRegistration: 'alienRegistration',
  residentCard: 'residentCard',
  passport: 'passport',
  Unsubmitted: 'Unsubmitted',
} as const;

export enum ID_KIND_LABELS {
  license = '運転免許証',
  healthInsurance = '健康保険証',
  myNumber = 'マイナンバーカード',
  studentId = '写真付き学生証',
  alienRegistration = '外国人登録証明書',
  residentCard = '在留カード',
  passport = 'パスポート',
  Unsubmitted = '未提出',
}

export const PurchaseReceptionDetailModal: React.FC<DetailModalProps> = ({
  open,
  onClose,
  transaction,
}) => {
  const [loading, setLoading] = useState(true); // ロード状態の管理
  // 個人情報の種類が未提出かどうかの判定
  const [isUnSubmittedPersonalInfo, setIsUnSubmittedPersonalInfo] =
    useState(false);
  // 身分証明書の種類が未提出かどうかの判定
  const [isUnsubmitted, setIsUnsubmitted] = useState(false);
  const [selectedItems, setSelectedItems] = useState<
    { id: number; count: number }[]
  >([]);
  const { cartItems, setCartItems, customerCartItems, setCustomerCartItems } =
    useTransactionCart(transaction.id);
  const { setAlertState } = useAlert();
  const apiClient = createClientAPI();
  const { ePosDev } = useEposDevice();
  const {
    customer,
    fetchCustomerByCustomerID,
    resetCustomer,
    fetchCustomerByMycaID,
  } = useCustomer();

  useEffect(() => {
    if (transaction.id_kind === IdKind.Unsubmitted) {
      setIsUnsubmitted(true);
    }
    if (transaction.customer_id === null) {
      setIsUnSubmittedPersonalInfo(true);
    }
  }, [transaction]);

  // 顧客IDから顧客情報を取得
  useEffect(() => {
    if (transaction && transaction.customer_id) {
      setLoading(true);
      fetchCustomerByCustomerID(
        transaction.store_id,
        transaction.customer_id,
        true,
      ).finally(() => setLoading(false));
    } else {
      resetCustomer();
      setLoading(false);
    }
    // エラー回避のため以下ESLintのコメントでのルール制御を挿入
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction]);

  // Popoverの状態管理
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const isPopoverOpen = Boolean(anchorEl);

  const calculateAge = (birthday: string | Date | undefined) => {
    if (!birthday) return '未登録';
    const birthDate =
      typeof birthday === 'string' ? new Date(birthday) : birthday;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // 査定を再開する
  const handleRestartClick = () => {
    // 復元データがあったらモーダルをひらく
    if (isRestoreData) {
      setIsRestoreModalOpen(true);
    } else {
      handleAppraisalInputClick(transaction.id, customer?.id);
    }
  };
  const router = useRouter();
  const handleAppraisalInputClick = (
    transactionID: number,
    customerId?: number,
  ) => {
    router.push(
      `/auth/purchaseReception/${transactionID}/purchase${
        customerId ? `?customerId=${customerId}` : ''
      }`,
    );
  };

  // 買取会計に進む処理
  const transitionToPurchasePage = async () => {
    if (!transaction) return;
    // mycaアプリのユーザーの場合 署名を作成できるようにする
    if (customer?.myca_user_id) {
      try {
        await apiClient.transaction.canCreateSignature({
          storeId: store.id,
          transactionId: transaction.id,
        });
      } catch (error) {
        console.error(error);
        setAlertState({
          severity: 'error',
          message: '買取の署名を作成できませんでした',
        });
        return;
      }
    }
    const customerId = transaction.customer_id ?? customer?.id;
    const customerParam = customerId ? `&customerID=${customerId}` : '';
    router.push(
      `${PATH.PURCHASE}?transactionID=${transaction.id}${customerParam}`,
    );
  };

  // 買取受付を更新し、買取会計に進む処理
  const transitionUpdateAndToPurchasePage = async ({
    id_kind,
    id_number,
    parental_consent_image_url,
    parental_contact,
  }: PurchaseReceptionFormData) => {
    if (customer && customer.id) {
      try {
        const res = await apiClient.transaction.putTransaction({
          storeId: transaction.store_id,
          customerId: transaction.customer_id ?? customer.id,
          transactionId: transaction.id,
          idKind: id_kind,
          idNumber: id_number,
          parentalConsentImageUrl: parental_consent_image_url,
          parentalContact: parental_contact,
        });

        if (res instanceof CustomError) {
          console.error('取引の更新に失敗しました。');
          setAlertState({
            message: `${res.status}:${res.message}`,
            severity: 'error',
          });
          return;
        }
        handleCloseNewPurchaseModal();
        transitionToPurchasePage();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const { pushQueue } = useLabelPrinterHistory();
  // 会計後ラベルを印刷する処理
  const handleLabelPrint = () => {
    if (!selectedItems.length) return;
    selectedItems.forEach((item) => {
      let isFirst = true;
      for (let i = 0; i < item.count; i++) {
        pushQueue({
          template: 'product',
          data: item.id,
          meta: { isFirstStock: isFirst },
        });

        isFirst = false;
      }
    });
  };

  // 個人情報、身分証明書確認に進む処理
  const transitionToIDVerification = () => {
    handleOpenNewPurchaseModal();
  };

  //会員情報読み取りモーダル
  const [isNewPurchaseModalOpen, setNewPurchaseModalOpen] = useState(false);
  const handleOpenNewPurchaseModal = () => {
    setNewPurchaseModalOpen(true);
  };
  const handleCloseNewPurchaseModal = () => {
    setNewPurchaseModalOpen(false);
    resetCustomer();
    onClose();
    setIsUnsubmitted(false);
    setIsUnSubmittedPersonalInfo(false);
    setCartItems(null);
    setCustomerCartItems(null);
  };
  const { store } = useStore();
  const { createDraftUnappreciatedPurchaseTransaction } =
    usePurchaseTransaction();

  // 新規買取モーダル内で買取番号発行ボタンが押された後に実行される関数。
  const handleFormSubmit = async ({
    id_kind,
    id_number,
    parental_consent_image_url,
    description,
    parental_contact,
  }: PurchaseReceptionFormData) => {
    if (!store?.id) {
      return;
    }

    if (customer && customer.id) {
      try {
        const res = await createDraftUnappreciatedPurchaseTransaction({
          id: null,
          store_id: store.id,
          customer_id: customer.id,
          total_price: 0,
          subtotal_price: 0,
          tax: 0,
          discount_price: 0,
          carts: [],
          transaction_kind: TransactionKind.buy,
          payment_method: null,
          recieved_price: null,
          change_price: null,
          id_kind,
          id_number,
          parental_consent_image_url,
          description,
          parental_contact,
        });

        if (res && !(res instanceof CustomError) && res.reception_number) {
          handleCloseNewPurchaseModal();
        }
      } catch (error) {
        console.error(error);
      }
    }
  };
  // 査定ができるかどうか
  const { accountGroup } = useAccountGroupContext();
  const canAssess = accountGroup?.assess_buy_transaction;

  const modalTitleAdditionText = useMemo(() => {
    // 個人情報、身分証の提示がない場合
    if (isUnsubmitted && isUnSubmittedPersonalInfo) {
      return '※個人情報、身分証明書 未確認';
    }
    // 身分証の提示がない場合
    if (isUnsubmitted) {
      return '※身分証明書未確認';
    }
    // 個人情報の提示がない場合
    if (isUnSubmittedPersonalInfo) {
      return '※個人情報未確認';
    }
    return undefined;
  }, [isUnsubmitted, isUnSubmittedPersonalInfo]);

  const newPurchaseModalTitle = useMemo(() => {
    // 個人情報、身分証の提示がない場合
    if (isUnsubmitted && isUnSubmittedPersonalInfo) {
      return '個人情報、身分証明書確認';
    }
    // 身分証の提示がない場合
    if (isUnsubmitted) {
      return '身分証明書確認';
    }
    // 個人情報の提示がない場合
    if (isUnSubmittedPersonalInfo) {
      return '個人情報確認';
    }
    return undefined;
  }, [isUnsubmitted, isUnSubmittedPersonalInfo]);

  const actionButtonText = () => {
    // すでに会計済みの場合
    if (transaction.payment) {
      return '選択した商品のラベルを印刷する';
    }

    // 査定が未完了
    if (!transaction.buy__is_assessed) {
      return canAssess ? '査定を再開する' : '';
    }

    // 身分証と個人情報のどちらも未提出
    if (isUnsubmitted && isUnSubmittedPersonalInfo) {
      return '個人情報、身分証明書を確認して買取会計へ進む';
    }

    // 身分証のみ未提出
    if (isUnsubmitted) {
      return '身分証明書を確認して買取会計へ進む';
    }

    // 個人情報のみ未提出
    if (isUnSubmittedPersonalInfo) {
      return '個人情報を確認して買取会計へ進む';
    }

    // 署名があって myca ユーザー
    if (transaction.signature_image_url && customer?.myca_user_id) {
      return '買取会計へ進む';
    }

    // mycaユーザーで署名が必要な場合
    if (customer?.myca_user_id) {
      return '署名を受領して買取会計へ進む';
    }

    // その他すべてOKな場合
    return '買取会計へ進む';
  };

  const onActionButtonClick = () => {
    // 会計済みならラベル印刷へ
    if (transaction.payment) {
      return handleLabelPrint();
    }

    // 査定が未完了なら査定を再開
    if (!transaction.buy__is_assessed) {
      return handleRestartClick();
    }

    // 身分証もしくは個人情報が未確認なら確認画面へ
    if (isUnsubmitted || isUnSubmittedPersonalInfo) {
      return transitionToIDVerification();
    }

    // すべて確認済みなら会計へ
    return transitionToPurchasePage();
  };

  /**
   * 復元確認モーダル
   */
  const { removeLocalStorageItemById, getLocalStorageItem } =
    useSaveLocalStorage();
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState<boolean>(false); // 復元しない
  const handleRestoreModalCancel = () => {
    removeLocalStorageItemById(transaction.id);
    handleAppraisalInputClick(transaction.id, customer?.id);
  };
  //復元するデータがあるかどうか
  const isRestoreData = getLocalStorageItem(transaction.id).length !== 0;

  if (loading) {
    // ロード中の場合はローディングインジケータを表示
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  return (
    <CustomModalWithIcon
      open={open}
      onClose={handleCloseNewPurchaseModal}
      title={`買取番号：${transaction.reception_number}`}
      titleAddition={modalTitleAdditionText}
      width="90%"
      height="90%"
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
      onActionButtonClick={onActionButtonClick}
      actionButtonText={actionButtonText()}
      secondActionButtonText="受付番号を再発行"
      onSecondActionButtonClick={async () => {
        const apiClient = new MycaPosApiClient({
          BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
        });
        const { forCustomer, forStaff } =
          await apiClient.transaction.getTransactionReceptionNumberCommand({
            transactionId: transaction.id,
            storeId: store!.id,
          });

        if (ePosDev) {
          // 買取番号を再印刷する
          await ePosDev.printWithCommand(forCustomer, store!.id);
          setAlertState({
            severity: 'success',
            message: '買取番号を再発行しました',
          });

          if (forStaff) {
            await ePosDev.printWithCommand(forStaff, store!.id);
          }
        }
      }}
      cancelButtonText="買取受付一覧に戻る"
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          gap: '10px',
          borderRadius: '8px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            borderRadius: '8px',
            paddingX: '10px',
            marginBottom: '10px',
            alignItems: 'center',
          }}
        >
          <Stack direction="row" gap={2}>
            <Stack direction="column">
              <Typography sx={{ margin: 0 }}>お客様氏名</Typography>
              <Typography sx={{ margin: 0 }}>
                {customer?.full_name_ruby}
              </Typography>
            </Stack>
            <Stack direction="column">
              <Typography sx={{ margin: 0 }}>連絡先</Typography>
              <Typography sx={{ margin: 0 }}>
                {customer?.phone_number}
              </Typography>
            </Stack>
            <SecondaryButtonWithIcon onClick={handlePopoverOpen}>
              その他の情報
            </SecondaryButtonWithIcon>
            <Popover
              open={isPopoverOpen}
              anchorEl={anchorEl}
              onClose={handlePopoverClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
            >
              <Box
                sx={{
                  padding: '20px',
                  maxWidth: '800px',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  rowGap: '10px',
                  columnGap: '10px',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  氏名
                </Typography>
                <Typography variant="body2">
                  {customer ? customer?.full_name_ruby : '未提出'}
                </Typography>

                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  フリガナ
                </Typography>
                <Typography variant="body2">
                  {customer ? customer?.full_name : '未提出'}
                </Typography>

                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  生年月日
                </Typography>
                <Typography variant="body2">
                  {customer
                    ? customer?.birthday
                      ? `${new Date(
                          customer.birthday,
                        ).toLocaleDateString()} (${calculateAge(
                          customer.birthday,
                        )}歳)`
                      : '未登録'
                    : '未提出'}
                </Typography>

                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  郵便番号
                </Typography>
                <Typography variant="body2">
                  {customer ? customer?.zip_code : '未提出'}
                </Typography>

                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  住所
                </Typography>
                <Typography variant="body2">
                  {customer
                    ? (customer?.prefecture || '') +
                      (customer?.city || '') +
                      (customer?.address2 || '') +
                      (customer?.building || '')
                    : '未提出'}
                </Typography>

                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  電話番号
                </Typography>
                <Typography variant="body2">
                  {customer ? customer?.phone_number : '未提出'}
                </Typography>

                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  身分証明書類
                </Typography>
                <Typography variant="body2">
                  {transaction?.id_kind
                    ? transaction.id_kind.startsWith('other:')
                      ? `${transaction.id_kind.split(':')[1]}${
                          transaction.id_number
                            ? ` (${transaction.id_number})`
                            : ''
                        }`
                      : ID_KIND_LABELS[
                          transaction.id_kind as keyof typeof ID_KIND_LABELS
                        ]
                      ? `${
                          ID_KIND_LABELS[
                            transaction.id_kind as keyof typeof ID_KIND_LABELS
                          ]
                        }${
                          transaction.id_number
                            ? ` (${transaction.id_number})`
                            : ''
                        }`
                      : '未登録'
                    : '未登録'}
                </Typography>
              </Box>
            </Popover>
            <OpenSignatureConfirmButton
              signatureURL={transaction.signature_image_url}
            />
          </Stack>
          <Stack direction="row" gap={2}>
            <Stack direction="column">
              <Typography>買取担当</Typography>
              <Typography>
                {transaction.reception_staff_account_name}
              </Typography>
            </Stack>
            <Stack direction="column">
              <Typography>査定</Typography>
              <Typography>{transaction.input_staff_account_name}</Typography>
            </Stack>
            <Stack direction="column">
              <Typography>会計</Typography>
              <Typography>{transaction.staff_account_name}</Typography>
            </Stack>
          </Stack>
        </Box>

        {transaction.transaction_carts.length > 0 ? (
          <TableContainer
            component={Paper}
            sx={{
              height: '100%',
              overflowY: 'auto',
              border: '1px solid gray',
              borderTop: '15px solid rgb(184, 42, 42)',
            }}
          >
            <Table
              component="table"
              sx={{
                tableLayout: 'fixed',
                width: '100%',
              }}
            >
              <TableHead component="thead">
                <TableRow component="tr">
                  {transaction.payment && (
                    <TableCell
                      component="td"
                      width="4%"
                      align="center"
                      sx={{
                        padding: '8px',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '100%',
                        }}
                      >
                        <CommonCheckbox
                          label=""
                          checked={!!selectedItems.length}
                          onChange={() => {
                            const isReset = !!selectedItems.length;
                            const allItems = transaction.transaction_carts.map(
                              (item) => ({
                                id: item.product_id,
                                count: item.item_count,
                              }),
                            );
                            setSelectedItems(isReset ? [] : allItems);
                          }}
                        />
                      </Box>
                    </TableCell>
                  )}
                  <TableCell
                    component="td"
                    width="10%"
                    align="center"
                    style={{ fontWeight: 'bold', color: 'gray' }}
                  >
                    画像
                  </TableCell>
                  <TableCell
                    component="td"
                    width="30%"
                    align="center"
                    style={{ fontWeight: 'bold', color: 'gray' }}
                  >
                    商品名
                  </TableCell>
                  <TableCell
                    component="td"
                    width="10%"
                    align="center"
                    style={{ fontWeight: 'bold', color: 'gray' }}
                  >
                    状態
                  </TableCell>
                  <TableCell
                    component="td"
                    width="10%"
                    align="center"
                    style={{ fontWeight: 'bold', color: 'gray' }}
                  >
                    査定金額
                  </TableCell>
                  <TableCell
                    component="td"
                    width="10%"
                    align="center"
                    style={{ fontWeight: 'bold', color: 'gray' }}
                  >
                    枚数
                  </TableCell>
                  <TableCell
                    component="td"
                    width="10%"
                    align="center"
                    style={{ fontWeight: 'bold', color: 'gray' }}
                  >
                    販売価格
                  </TableCell>
                  <TableCell
                    component="td"
                    width="15%"
                    align="center"
                    style={{ fontWeight: 'bold', color: 'gray' }}
                  >
                    仕入れ値平均額
                  </TableCell>
                  {transaction.payment ? (
                    <TableCell
                      component="td"
                      width="30%"
                      align="center"
                      style={{ fontWeight: 'bold', color: 'grey' }}
                    >
                      管理番号
                    </TableCell>
                  ) : (
                    <TableCell
                      component="td"
                      width="30%"
                      align="center"
                      style={{ fontWeight: 'bold', color: 'gray' }}
                    >
                      備考
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>

              <DetailTableBody
                cartItems={cartItems}
                setCartItems={setCartItems}
                customerCartItems={customerCartItems}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
                transaction={transaction}
              />
            </Table>
          </TableContainer>
        ) : (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <TableContainer
              component={Paper}
              sx={{
                height: '100%',
                overflowY: 'auto',
                border: '1px solid gray',
                borderTop: '15px solid rgb(184, 42, 42)',
              }}
            >
              <Table
                component="table"
                sx={{
                  tableLayout: 'fixed',
                  width: '100%',
                }}
              >
                <TableHead component="thead">
                  <TableRow component="tr">
                    <TableCell
                      component="td"
                      width="10%"
                      align="center"
                      style={{ fontWeight: 'bold', color: 'gray' }}
                    >
                      画像
                    </TableCell>
                    <TableCell
                      component="td"
                      width="25%"
                      style={{ fontWeight: 'bold', color: 'gray' }}
                    >
                      商品名
                    </TableCell>
                    <TableCell
                      component="td"
                      width="15%"
                      style={{ fontWeight: 'bold', color: 'gray' }}
                    >
                      状態
                    </TableCell>
                    <TableCell
                      component="td"
                      width="15%"
                      style={{ fontWeight: 'bold', color: 'gray' }}
                    >
                      査定金額
                    </TableCell>
                    <TableCell
                      component="td"
                      width="15%"
                      style={{ fontWeight: 'bold', color: 'gray' }}
                    >
                      枚数
                    </TableCell>
                    <TableCell
                      component="td"
                      width="10%"
                      align="center"
                      style={{ fontWeight: 'bold', color: 'gray' }}
                    >
                      販売価格
                    </TableCell>
                    <TableCell
                      component="td"
                      width="15%"
                      align="center"
                      style={{ fontWeight: 'bold', color: 'gray' }}
                    >
                      仕入れ値平均
                    </TableCell>
                    {transaction.payment ? (
                      <TableCell
                        component="td"
                        width="20%"
                        style={{ fontWeight: 'bold', color: 'grey' }}
                      >
                        管理番号
                      </TableCell>
                    ) : (
                      <TableCell
                        component="td"
                        width="20%"
                        style={{ fontWeight: 'bold', color: 'gray' }}
                      >
                        備考
                      </TableCell>
                    )}
                  </TableRow>
                  <TableRow component="tr">
                    <TableCell component="td" colSpan={6}>
                      <Box
                        sx={{
                          height: '450px',
                          width: '100%',
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '20px',
                        }}
                      >
                        <Typography variant="h2" sx={{ marginBottom: '16px' }}>
                          査定内容がありません
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
      {/* モーダル一覧 */}
      {/* 新規買取ボタンを押した際に表示されるモーダル */}
      <NewPurchaseModalContainer
        open={isNewPurchaseModalOpen}
        onClose={handleCloseNewPurchaseModal}
        onFormSubmit={handleFormSubmit}
        customer={customer}
        // onBarcodeScan={handleScanCustomerButtonClick}
        fetchCustomerByMycaID={fetchCustomerByMycaID}
        fetchCustomerByCustomerID={fetchCustomerByCustomerID}
        otherTitle={newPurchaseModalTitle}
        otherActionButtonText="買取会計へ進む"
        otherAction={transitionUpdateAndToPurchasePage}
        isUnsubmitted={isUnsubmitted}
        isUnSubmittedPersonalInfo={isUnSubmittedPersonalInfo}
        transaction={transaction}
      />

      {/* 新規作成localStorage復元確認モーダル */}
      <ConfirmationDialog
        open={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        title="入力データ復元"
        message="入力中のデータがあります。復元しますか？"
        confirmButtonText="復元"
        onConfirm={() =>
          handleAppraisalInputClick(transaction.id, customer?.id)
        }
        cancelButtonText="復元しない"
        onCancel={handleRestoreModalCancel}
      />
    </CustomModalWithIcon>
  );
};
