import { Menu, MenuItem, Stack, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { useState, MouseEvent, useMemo, useEffect, useCallback } from 'react';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import {
  MarketFluctuationsList,
  MarketFluctuationsListByProduct,
  useMarketFluctuationsList,
} from '@/feature/marketFluctuationsModal/MarketFluctuationsList';
import {
  MarketFluctuationsItem,
  MarketFluctuationsProduct,
  MarketPriceUpdateHistory,
  SearchParams,
} from '@/feature/marketFluctuationsModal/type';
import { MatchMasterPriceToMarketPriceModal } from '@/feature/marketFluctuationsModal/MatchMasterPriceToMarketPriceModal';
import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
import { createClientAPI, CustomError } from '@/api/implement';
import { ItemGetAllOrderType } from '@/feature/products/components/searchTable/const';
import { ConfirmationListCloseModal } from '@/feature/marketFluctuationsModal/ConfirmationListCloseModal';
import { useUpdateItem } from '@/feature/item/hooks/useUpdateItem';
import dayjs from 'dayjs';
import { Product } from '@prisma/client';
import { useUpdateProduct } from '@/feature/products/hooks/useUpdateProduct';
import { formatApiResponseToFormattedItem } from '@/components/dataGrid/RightClickDataGrid';
import { PATH } from '@/constants/paths';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';

interface MarketFluctuationsModalProps {
  open: boolean;
  onClose: () => void;
}

export const MarketFluctuationsModal = ({
  open,
  onClose,
}: MarketFluctuationsModalProps) => {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const clientAPI = useMemo(() => createClientAPI(), []);

  // 何らかの変更処理が行われたかどうか
  const [hasChange, setHasChange] = useState(false);

  // ------------------------------------------
  // 相場価格の最終更新日時
  // ------------------------------------------
  const [lastUpdateMarketPrice, setLastUpdateMarketPrice] =
    useState<MarketPriceUpdateHistory>([]);
  const fetchMarketPriceUpdateHistory = useCallback(async () => {
    const response = await clientAPI.store.getItemMarketPriceHistory();
    // エラー時はアラートを出して早期return
    if (response instanceof CustomError) {
      setAlertState({
        message: `${response.status}:${response.message}`,
        severity: 'error',
      });
      return;
    }
    setLastUpdateMarketPrice(response.updatedHistory);
  }, [clientAPI.item, setAlertState]);

  // モーダル表示初期取得
  useEffect(() => {
    if (open) {
      fetchMarketPriceUpdateHistory();
    }
  }, [open]);

  // ------------------------------------------
  // テーブルデータ
  // ------------------------------------------

  // 相場価格とギャップがある商品一覧
  const [marketPriceGapItems, setMarketPriceGapItems] = useState<
    MarketFluctuationsItem[]
  >([]);
  // 相場価格とギャップがある商品一覧の取得Loading
  const [isLoadingGetMarketPriceGapItems, setIsLoadingGetMarketPriceGapItems] =
    useState(false);
  // 相場価格とギャップがある商品一覧フィルタリング用パラメータ
  const [searchParams, setSearchParams] = useState<SearchParams>({
    marketPriceUpdatedAtGte: dayjs().subtract(1, 'day').toISOString(),
    hasStock: true,
  });
  // 相場価格とギャップがある商品一覧取得してstateに保存
  const fetchMarketPriceGapItems = useCallback(
    async (storeID: number, take?: number) => {
      setIsLoadingGetMarketPriceGapItems(true);
      const response = await clientAPI.item.getAll({
        storeID: storeID,
        take: take ?? 1000, // 設定されていない場合1000件取得
        includesProducts: true,
        genreId: searchParams.genreId,
        categoryId: searchParams.categoryId,
        orderBy: searchParams.orderBy as ItemGetAllOrderType,
        displayName: searchParams.displayName,
        expansion: searchParams.expansion,
        cardnumber: searchParams.cardnumber,
        rarity: searchParams.rarity,
        ...(searchParams.findOption ?? {}),
        hasMarketPriceGap: true, // 相場価格（market_price）と商品マスタ販売価格（sell_price）の差があるもののみを取得
        includesMycaItemInfo: true,
        marketPriceUpdatedAtGte: searchParams.marketPriceUpdatedAtGte
          ? dayjs(searchParams.marketPriceUpdatedAtGte).toISOString()
          : undefined,
        hasStock: searchParams.hasStock,
      });
      setIsLoadingGetMarketPriceGapItems(false);
      // エラー時はアラートを出して早期return
      if (response instanceof CustomError) {
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        return;
      }
      setMarketPriceGapItems(response.items);
    },
    [clientAPI.item, searchParams, setAlertState],
  );

  // モーダル表示初期,フィルタリング条件が変更された場合に再取得
  useEffect(() => {
    if (open) {
      fetchMarketPriceGapItems(store.id);
    }
  }, [open, store.id, searchParams]);

  // ------------------------------------------
  // ジャンル取得、タブ変更時の処理、サーバーソート
  // ------------------------------------------
  const { genre, handleTabChange, handleSort } = useMarketFluctuationsList({
    setSearchParams,
  });

  // ------------------------------------------
  // 商品マスタ価格を編集
  // ------------------------------------------
  const {
    updateItem,
    updateMultipleItems,
    isLoading: isLoadingEditPrice,
  } = useUpdateItem();

  // [商品マスタ価格を編集(個別)]画面表示
  const [isEditPrice, setIsEditPrice] = useState(false);
  //価格更新処理
  const [editedPrices, setEditedPrices] = useState<{
    [key: number]: { sellPrice: number; buyPrice: number };
  }>({});
  // 価格の入力があるか
  const hasEditedPrices = useMemo(
    () => Object.keys(editedPrices).length !== 0,
    [editedPrices],
  );
  //適用ボタン押下状態管理
  const [alreadyUpdate, setAlreadyUpdate] = useState<number[]>([]);
  // 適用ボタンによる販売価格更新
  const handleSubmitUpdateItem = async (item: MarketFluctuationsItem) => {
    if (!store.id || !item || !item.market_price) {
      return;
    }
    const itemToUpdate = {
      ...formatApiResponseToFormattedItem(item),
      sellPrice: item.market_price,
    };

    const success = await updateItem(store.id, itemToUpdate);

    if (success) {
      setHasChange(true);
      setAlreadyUpdate((prev) => [...prev, item.id]);
    }
  };
  // モーダルの価格変更を保存ボタンによる価格更新
  const handleSubmitUpdateMultipleItems = async () => {
    if (!store.id) {
      return;
    }
    const itemsToUpdate = Object.keys(editedPrices).map((itemId) => {
      const numericItemId = Number(itemId);
      const { sellPrice, buyPrice } = editedPrices[numericItemId];
      return { itemId: numericItemId, sellPrice, buyPrice };
    });

    const success = await updateMultipleItems(store.id, itemsToUpdate);

    if (success) {
      setHasChange(true);
      setIsEditPrice(false);
      fetchMarketPriceGapItems(store.id);
      setAlreadyUpdate([]);
    }
  };

  // ------------------------------------------
  // 在庫価格を編集
  // ------------------------------------------
  const { updateProduct, isLoadingUpdateProduct } = useUpdateProduct();
  // [在庫価格を編集]画面表示
  const [isChangeInventoryPrice, setIsChangeInventoryPrice] = useState(false);
  // 買取価格（独自）/販売価格（独自）編集用
  const [formData, setFormData] = useState<Partial<Product>>();
  // 価格の入力があるか
  const hasChangeInventoryPrice = useMemo(() => !!formData, [formData]);
  // [在庫価格を編集]画面表示
  const [selectedProduct, setSelectedProduct] = useState<
    MarketFluctuationsProduct | undefined
  >(undefined);
  // 在庫価格変更確認モーダル
  const [isOpenConfirmationModal, setIsOpenConfirmationModal] = useState(false);
  const handleOpenConfirmationModal = () => {
    setIsOpenConfirmationModal(true);
  };
  const handleCloseConfirmationModal = () => {
    setIsOpenConfirmationModal(false);
  };

  const handleUpdateProduct = async () => {
    if (selectedProduct) {
      const success = await updateProduct(store.id, selectedProduct.id, {
        specificSellPrice: formData?.specific_sell_price ?? null,
        specificBuyPrice: formData?.specific_buy_price ?? null,
      });

      if (success) {
        setHasChange(true);
        setFormData(undefined);
        setSelectedProduct(undefined);
        setIsOpenConfirmationModal(false);
        fetchMarketPriceGapItems(store.id);
      }
    }
  };

  // ------------------------------------------
  // 相場価格に合わせる
  // ------------------------------------------

  // [相場価格に合わせる(全体)]モーダル表示
  const [isOpenMatchMasterPriceModal, setIsOpenMatchMasterPriceModal] =
    useState(false);
  // 販売価格を相場価格に変更Loading
  const [isLoadingMatchMasterPrice, setIsLoadingMatchMasterPrice] =
    useState(false);

  // [相場変動リストを閉じるか確認]モーダル表示
  const [isOpenConfirmation, setIsOpenConfirmation] = useState(false);

  // ------------------------------------------
  // モーダル
  // ------------------------------------------

  //商品マスタの一覧（/auth/item）の場合,ページをリロードする
  const reloadIfOnItemList = () => {
    if (
      typeof window !== 'undefined' &&
      window.location.pathname === PATH.ITEM.root
    ) {
      window.location.reload();
    }
  };

  // モーダル閉じる挙動
  const handleModalClose = () => {
    onClose();
    setLastUpdateMarketPrice([]);
    setSearchParams({});
    setMarketPriceGapItems([]);
    setIsEditPrice(false);
    setEditedPrices({});
    setIsChangeInventoryPrice(false);
    setSelectedProduct(undefined);
    setFormData(undefined);
    setAlreadyUpdate([]);
    if (hasChange) {
      reloadIfOnItemList();
      setHasChange(false);
    }
  };

  // ボタン以外の場所クリック
  const handleBackdropClick = (
    event: object,
    reason: 'backdropClick' | 'escapeKeyDown',
  ) => {
    if (reason === 'backdropClick') {
      setIsOpenConfirmation(true);
      return;
    }
    handleModalClose();
  };
  // モーダルタイトル
  const modalTitle = useMemo(() => {
    const uploadedAt = !lastUpdateMarketPrice.length
      ? ''
      : `${dayjs(lastUpdateMarketPrice[0]?.uploaded_at).format(
          'YYYY/MM/DD HH:mm',
        )}更新`;
    return `${
      isEditPrice || isChangeInventoryPrice ? '相場変動' : '相場変動リスト'
    } ${uploadedAt}`;
  }, [isEditPrice, isChangeInventoryPrice, lastUpdateMarketPrice]);
  // モーダルprimaryButton
  const modalActionButtonText = useMemo(() => {
    return `${
      isEditPrice || isChangeInventoryPrice ? '価格変更を保存' : '価格を編集'
    }`;
  }, [isEditPrice, isChangeInventoryPrice]);
  // primaryButtonボタン押下時のメニュー
  const [buttonListAnchor, setButtonListAnchor] = useState<null | HTMLElement>(
    null,
  );
  const isOpenButtonList = Boolean(buttonListAnchor);
  const handleButtonListAnchorClick = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    setButtonListAnchor(event.currentTarget);
  };
  const handleCloseButtonListAnchor = () => {
    setButtonListAnchor(null);
  };
  const primaryButtonAction = (event: MouseEvent<HTMLButtonElement>) => {
    if (isEditPrice) {
      return handleSubmitUpdateMultipleItems();
    }
    if (isChangeInventoryPrice) {
      return handleOpenConfirmationModal();
    }
    return handleButtonListAnchorClick(event);
  };
  const isLoadingList = useMemo(
    () =>
      isLoadingGetMarketPriceGapItems ||
      (isLoadingEditPrice && !alreadyUpdate) ||
      isLoadingMatchMasterPrice,
    [
      isLoadingGetMarketPriceGapItems,
      isLoadingEditPrice,
      alreadyUpdate,
      isLoadingMatchMasterPrice,
    ],
  );
  // モーダルcancelButton
  const cancelButtonText = useMemo(() => {
    return `${
      isEditPrice || isChangeInventoryPrice ? '変更を保存しない' : '閉じる'
    }`;
  }, [isEditPrice, isChangeInventoryPrice]);
  const cancelButtonAction = () => {
    if (selectedProduct && isChangeInventoryPrice) {
      setSelectedProduct(undefined);
      setFormData(undefined);
      return;
    }
    if (isChangeInventoryPrice) {
      setIsChangeInventoryPrice(false);
      setSelectedProduct(undefined);
      setFormData(undefined);
      return;
    }
    if (isEditPrice) {
      setIsEditPrice(false);
      setEditedPrices({});
      return;
    }
    return handleModalClose();
  };

  const [searchInput, setSearchInput] = useState({
    displayName: '',
    expansion: '',
    cardnumber: '',
    rarity: '',
  });

  useEffect(() => {
    // keep searchInput sync when modal opens with existing searchParams
    if (open) {
      setSearchInput({
        displayName: searchParams.displayName ?? '',
        expansion: searchParams.expansion ?? '',
        cardnumber: searchParams.cardnumber ?? '',
        rarity: searchParams.rarity ?? '',
      });
    }
  }, [open]);

  const handleSearchClick = () => {
    setSearchParams((prev) => ({
      ...prev,
      displayName: searchInput.displayName || undefined,
      expansion: searchInput.expansion || undefined,
      cardnumber: searchInput.cardnumber || undefined,
      rarity: searchInput.rarity || undefined,
    }));
  };

  return (
    <>
      <ConfirmationListCloseModal
        open={isOpenConfirmation}
        onClose={() => setIsOpenConfirmation(false)}
        onCloseMarketFluctuationsModal={handleModalClose}
      />
      <CustomModalWithIcon
        title={modalTitle}
        open={open}
        onClose={handleModalClose}
        handleBackdropClick={
          (isEditPrice && hasEditedPrices) ||
          (isChangeInventoryPrice && hasChangeInventoryPrice)
            ? handleBackdropClick
            : undefined
        }
        width="90%"
        height="85%"
        cancelButtonText={cancelButtonText}
        onCancelClick={cancelButtonAction}
        isCancelButtonDisabled={isEditPrice && isLoadingEditPrice}
        customActionButton={
          <>
            <PrimaryButton
              id="basic-button"
              onClick={primaryButtonAction}
              aria-controls={isOpenButtonList ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={isOpenButtonList ? 'true' : undefined}
              sx={{
                padding: '3px 30px',
                fontSize: '12px',
                position: 'relative',
              }}
              loading={isLoadingList}
              disabled={!marketPriceGapItems.length}
            >
              {modalActionButtonText}
            </PrimaryButton>

            <Menu
              id="basic-menu"
              anchorEl={buttonListAnchor}
              open={isOpenButtonList}
              onClose={() => handleCloseButtonListAnchor()}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
              slotProps={{
                paper: {
                  sx: {
                    mt: '-95px',
                    ml: '-90px',
                  },
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  handleCloseButtonListAnchor();
                  setIsEditPrice(true);
                  setIsChangeInventoryPrice(false);
                }}
              >
                商品マスタ価格を編集
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleCloseButtonListAnchor();
                  setIsChangeInventoryPrice(true);
                  setIsEditPrice(false);
                }}
              >
                在庫価格を編集
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleCloseButtonListAnchor();
                  setIsOpenMatchMasterPriceModal(true);
                }}
              >
                マスタ価格を相場価格に合わせる
              </MenuItem>
            </Menu>
          </>
        }
      >
        <Stack width="100%" sx={{ height: '100%' }}>
          <MatchMasterPriceToMarketPriceModal
            open={isOpenMatchMasterPriceModal}
            onClose={() => setIsOpenMatchMasterPriceModal(false)}
            isLoadingMatchMasterPrice={isLoadingMatchMasterPrice}
            setIsLoadingMatchMasterPrice={setIsLoadingMatchMasterPrice}
            marketPriceGapItems={marketPriceGapItems}
            storeId={store.id}
            searchParams={searchParams}
            fetchMarketPriceGapItems={fetchMarketPriceGapItems}
            setHasChange={setHasChange}
          />
          <Stack direction="row" gap="8px" marginBottom="8px">
            {/* 商品検索フィールド群 */}
            <TextField
              size="small"
              placeholder="商品名"
              value={searchInput.displayName}
              onChange={(e) =>
                setSearchInput((prev) => ({
                  ...prev,
                  displayName: e.target.value,
                }))
              }
              sx={{ minWidth: 180, backgroundColor: 'common.white' }}
            />
            <TextField
              size="small"
              placeholder="エキスパンション"
              value={searchInput.expansion}
              onChange={(e) =>
                setSearchInput((prev) => ({
                  ...prev,
                  expansion: e.target.value,
                }))
              }
              sx={{ minWidth: 140, backgroundColor: 'common.white' }}
            />
            <TextField
              size="small"
              placeholder="型番"
              value={searchInput.cardnumber}
              onChange={(e) =>
                setSearchInput((prev) => ({
                  ...prev,
                  cardnumber: e.target.value,
                }))
              }
              sx={{ minWidth: 100, backgroundColor: 'common.white' }}
            />
            <TextField
              size="small"
              placeholder="レアリティ"
              value={searchInput.rarity}
              onChange={(e) =>
                setSearchInput((prev) => ({ ...prev, rarity: e.target.value }))
              }
              sx={{ minWidth: 100, backgroundColor: 'common.white' }}
            />
            <PrimaryButtonWithIcon
              type="button"
              icon={<SearchIcon />}
              onClick={handleSearchClick}
            >
              検索
            </PrimaryButtonWithIcon>
          </Stack>
          <Stack sx={{ maxHeight: 'calc(100% - 60px)' }}>
            {isChangeInventoryPrice ? (
              // プロダクトごとの価格変動リスト
              <MarketFluctuationsListByProduct
                marketPriceGapItems={marketPriceGapItems}
                searchParams={searchParams}
                setSearchParams={setSearchParams}
                isLoadingList={isLoadingList}
                genre={genre}
                handleTabChange={handleTabChange}
                handleSort={handleSort}
                formData={formData}
                setFormData={setFormData}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                isOpenConfirmationModal={isOpenConfirmationModal}
                handleCloseConfirmationModal={handleCloseConfirmationModal}
                handleUpdateProduct={handleUpdateProduct}
                isLoadingUpdateProduct={isLoadingUpdateProduct}
              />
            ) : (
              // アイテムごとの価格変動リスト
              <MarketFluctuationsList
                marketPriceGapItems={marketPriceGapItems}
                searchParams={searchParams}
                setSearchParams={setSearchParams}
                isLoadingList={isLoadingList}
                genre={genre}
                handleTabChange={handleTabChange}
                handleSort={handleSort}
                isEditPrice={isEditPrice}
                editedPrices={editedPrices}
                setEditedPrices={setEditedPrices}
                alreadyUpdate={alreadyUpdate}
                handleSubmitUpdateItem={handleSubmitUpdateItem}
              />
            )}
          </Stack>
        </Stack>
      </CustomModalWithIcon>
    </>
  );
};
