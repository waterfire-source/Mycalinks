'use client';

import { useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useItemSearch } from '@/feature/item/hooks/useItemSearch';
import { PATH } from '@/constants/paths';
import { useAlert } from '@/contexts/AlertContext';
import { createClientAPI, CustomError } from '@/api/implement';
import SearchFieldWithParams from '@/components/inputFields/SearchFieldWithParams';
import { ItemTable } from '@/app/auth/(dashboard)/item/components/itemTable/ItemTable';
import { useStore } from '@/contexts/StoreContext';
import { useMultipleParamsAsState } from '@/hooks/useMultipleParamsAsState';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import EditIcon from '@mui/icons-material/Edit';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import TertiaryButtonWithIcon from '@/components/buttons/TertiaryButtonWithIcon';
import SaveIcon from '@mui/icons-material/Save';
import { useUpdateItem } from '@/feature/item/hooks/useUpdateItem';
import { SimpleButtonWithIcon } from '@/components/buttons/SimpleButtonWithIcon';
import { ItemListMenu } from '@/app/auth/(dashboard)/item/components/ItemListMenu';
import { useLabelPrinterHistory } from '@/contexts/LabelPrinterContext';
import { LocalStorageItem, LocalStorageManager } from '@/utils/localStorage';
import { HiddenItemsModal } from '@/app/auth/(dashboard)/item/components/HiddenItemsModal';
import { HelpIcon } from '@/components/common/HelpIcon';
import { CsvDownloadModal } from '@/app/auth/(dashboard)/item/components/CsvDownloadModal';
import { useErrorAlert } from '@/hooks/useErrorAlert';

export default function ItemPage() {
  const { store } = useStore();
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [open, setOpen] = useState(false);
  const { handleError } = useErrorAlert();

  // 以下は商品検索用のロジック
  // 商品一覧画面ではisActiveはundefine
  // currentPageとitemPerPage以外の検索条件(商品名とか)はSearchFieldWithParamsに委託している。
  // 注意点として、初期化時には自動で検索は発火されない。検索の実行は全てSearchFieldWithParamsが管理してる。
  // 以下のurlのquery情報は、searchFieldWithParams側で読み取って使っています。ここではコンポーネントではsetだけ使ってる。ただし、SearchWithParamsでもsetを行ってる。
  const [_, setQueryParams] = useMultipleParamsAsState([
    'name',
    'rarity',
    'cardnumber',
    'categoryId',
    'genreId',
    // 以下二つの値は呼び出し元の、useItemSearchを初期化しているコンポーネントでurlにセットする処理を書いている。
    'currentPage',
    'itemsPerPage',
  ]);
  const {
    searchState,
    setSearchState,
    performSearch,
    selectedFindOption,
    handleChangeFindOption,
  } = useItemSearch(store.id);
  //ジャンル、カテゴリ、並び替え、オプションが変更されたときに再フェッチ
  useEffect(() => {
    performSearch();
  }, [
    searchState.selectedGenreId,
    searchState.selectedCategoryId,
    searchState.orderBy,
    selectedFindOption,
  ]);

  // ページが切り替わった時のハンドリング
  // カスタムフック側で変更を検知してreFetchをしてくれる。
  const handlePageChange = (newPage: number) => {
    setQueryParams({
      name: searchState.searchName ?? '',
      rarity: searchState.rarity ?? '',
      cardnumber: searchState.cardnumber ?? '',
      categoryId: searchState.selectedCategoryId?.toString() || '',
      genreId: searchState.selectedGenreId?.toString() || '',
      currentPage: newPage !== 0 ? newPage.toString() : '', // 検索ボタンが押された時は0にリセットされるから、queryから削除
      itemsPerPage:
        searchState.itemsPerPage !== 30
          ? searchState.itemsPerPage.toString()
          : '',
      isActive:
        searchState.isActive !== undefined
          ? searchState.isActive.toString()
          : '',
    });
    setSearchState((prevState) => ({ ...prevState, currentPage: newPage }));
  };

  // ページあたりの表示件数のハンドリング
  // カスタムフック側で変更を検知してreFetchをしてくれる。
  const handlePageSizeChange = (newSize: number) => {
    setQueryParams({
      name: searchState.searchName ?? '',
      rarity: searchState.rarity ?? '',
      cardnumber: searchState.cardnumber ?? '',
      categoryId: searchState.selectedCategoryId?.toString() || '',
      genreId: searchState.selectedGenreId?.toString() || '',
      department: searchState.selectedCategoryId?.toString() || '',
      currentPage: '',
      itemsPerPage: newSize !== 30 ? newSize.toString() : '',
      isActive:
        searchState.isActive !== undefined
          ? searchState.isActive.toString()
          : '',
    });
    setSearchState((prevState) => ({
      ...prevState,
      itemsPerPage: newSize,
      currentPage: 0,
    }));
  };

  // 以下は商品マスタダウンロード機能用のロジック
  const [isDownloading, setIsDownloading] = useState(false);
  const { setAlertState } = useAlert();
  const clientAPI = createClientAPI();
  const { updateMultipleItems } = useUpdateItem();

  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  // CSV種類選択用のstate
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);

  // CSVダウンロード選択画面を開く
  const handleClickDownload = () => {
    setCsvDialogOpen(true);
  };

  // 実際のCSVダウンロード処理
  const handleDownloadCsv = async () => {
    try {
      setIsDownloading(true);

      const res = await clientAPI.item.getCsvFile({
        storeID: store.id,
        genreId: selectedGenreId,
        categoryId: selectedCategoryId,
      });

      if (res instanceof CustomError) throw res;

      setAlertState({
        message: 'CSVダウンロードが完了しました',
        severity: 'success',
      });

      // ダウンロード実行
      window.location.href = res.fileUrl;
      setCsvDialogOpen(false);
    } catch (error) {
      handleError(error);
    } finally {
      setIsDownloading(false);
    }
  };

  //価格更新処理
  const [editedPrices, setEditedPrices] = useState<{
    [key: number]: { sellPrice: number; buyPrice: number };
  }>({});

  //メニュー関連
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleMenuClose = () => {
    setAnchorEl(null); // メニューを閉じる
  };

  const handleSubmitUpdateItem = async () => {
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
      performSearch();
      setIsEditMode(false);
      if (purchaseData) {
        const labelPrintProductIds = await checkSalePrice();
        printLabels(labelPrintProductIds || []);
        setPurchaseData(null);
      }
    }
  };

  // 買取ページから販売価格の更新のため遷移してきたときの処理
  const [purchaseData, setPurchaseData] = useState<LocalStorageItem | null>(
    null,
  );
  const { pushQueue: pushLabelPrinterQueue } = useLabelPrinterHistory();
  const storageManager = new LocalStorageManager('purchaseData');

  useEffect(() => {
    if (storageManager.getItem()) {
      setPurchaseData(storageManager.getItem());
      storageManager.removeItem();
      setIsEditMode(true);
    }
  }, []);

  const printLabels = (labelPrintProductIds: number[]) => {
    try {
      for (const eachProduct of purchaseData?.carts || []) {
        if (!eachProduct.isBuyOnly) {
          if (labelPrintProductIds.includes(eachProduct.productId)) {
            let currentStockNumber = eachProduct.stockNumber;

            //すべてプリント
            for (const variant of eachProduct.variants) {
              // itemCountの数だけラベルをプリント
              for (let count = 0; count < variant.itemCount; count++) {
                pushLabelPrinterQueue({
                  template: 'product',
                  data: eachProduct.productId,
                  meta: {
                    isFirstStock: currentStockNumber <= 0,
                    isManual: true,
                  },
                });

                currentStockNumber++;
              }
            }
          }
        }
      }
    } catch {
      setAlertState({
        message: 'ラベル印刷に失敗しました。',
        severity: 'error',
      });
    }
  };

  const checkSalePrice = async () => {
    if (
      purchaseData === null ||
      !purchaseData.zeroPriceItems ||
      purchaseData.carts === undefined
    ) {
      return;
    }
    const itemRes = await clientAPI.item.getAll({
      storeID: store.id,
      id: purchaseData.zeroPriceItems.map((item) => item.id),
      includesProducts: true,
    });
    if (itemRes instanceof CustomError) {
      setAlertState({
        message: `${itemRes.status}:${itemRes.message}`,
        severity: 'error',
      });
      return;
    }

    const labelPrintProductIds = itemRes.items
      .filter((item) => item.sell_price !== 0) // 価格が 0 でなくなった商品のみ取得
      .flatMap((item) =>
        (purchaseData.carts ?? []) // lintのエラー回避用の条件分岐
          .filter((cart) =>
            item.products.some((product) => cart.productId === product.id),
          )
          .map((cart) => cart.productId),
      );

    return labelPrintProductIds;
  };

  return (
    <ContainerLayout
      title="商品マスタ"
      helpArchivesNumber={1073}
      actions={
        <Box sx={{ width: '80%', display: 'flex', justifyContent: 'flex-end' }}>
          {isEditMode ? (
            <>
              <TertiaryButtonWithIcon
                onClick={() => {
                  setIsEditMode(false); // 編集モードを終了
                  setEditedPrices({}); // 価格情報をリセット
                }}
              >
                変更を保存しない
              </TertiaryButtonWithIcon>
              <PrimaryButtonWithIcon
                sx={{ ml: 2 }}
                onClick={() => handleSubmitUpdateItem()}
                icon={<SaveIcon />}
              >
                価格変更を保存
              </PrimaryButtonWithIcon>
            </>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SimpleButtonWithIcon onClick={() => setOpen(true)}>
                  非表示商品一覧
                </SimpleButtonWithIcon>
                <HelpIcon helpArchivesNumber={2373} />
              </Box>
              <SecondaryButtonWithIcon
                onClick={() => setIsEditMode(true)}
                icon={<EditIcon />}
                sx={{ ml: 2 }}
              >
                価格編集モード
              </SecondaryButtonWithIcon>
              <HelpIcon helpArchivesNumber={1049} />
              <PrimaryButtonWithIcon
                sx={{ ml: 2 }}
                onClick={(event) => setAnchorEl(event.currentTarget)} // メニューを開く処理を直接記述
                icon={<AddCircleOutlineIcon />}
              >
                新規商品登録
              </PrimaryButtonWithIcon>
              <HelpIcon helpArchivesNumber={176} />
            </>
          )}
        </Box>
      }
    >
      <Grid
        container
        columnSpacing={3}
        sx={{ height: '60px', alignItems: 'center' }}
      >
        <Grid item xs={8} sx={{ minWidth: 800 }}>
          <SearchFieldWithParams
            onSearch={performSearch}
            setSearchState={setSearchState}
            searchState={searchState}
          />
        </Grid>
        <Grid
          item
          xs={4}
          sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}
        >
          <SimpleButtonWithIcon
            onClick={handleClickDownload}
            loading={isDownloading}
          >
            ダウンロード
          </SimpleButtonWithIcon>
          <HelpIcon helpArchivesNumber={4167} />
          <SimpleButtonWithIcon
            onClick={() => router.push(PATH.STOCK.register.upload)}
          >
            CSVアップロード
          </SimpleButtonWithIcon>
          <HelpIcon helpArchivesNumber={2469} />
        </Grid>
      </Grid>

      <ItemTable
        items={purchaseData?.zeroPriceItems ?? searchState.searchResults}
        selectedStoreID={store.id}
        paginationModel={{
          page: searchState.currentPage,
          pageSize: searchState.itemsPerPage,
          totalCount: searchState.totalCount,
        }}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        isLoading={searchState.isLoading}
        refetchItemsAfterUpdate={performSearch}
        isEditMode={isEditMode}
        editedPrices={editedPrices}
        setEditedPrices={setEditedPrices}
        setSearchState={setSearchState}
        selectedGenreID={searchState.selectedGenreId}
        selectedFindOption={selectedFindOption}
        handleChangeFindOption={handleChangeFindOption}
      />

      {/* メニュー関連 */}
      <ItemListMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      />
      {/* 非表示商品一覧モーダル */}
      <HiddenItemsModal
        open={open}
        setOpen={setOpen}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
      {/* CSV種類選択モーダル */}
      <CsvDownloadModal
        open={csvDialogOpen}
        onClose={() => setCsvDialogOpen(false)}
        onDownload={handleDownloadCsv}
        selectedGenreId={selectedGenreId}
        setSelectedGenreId={setSelectedGenreId}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
        isDownloading={isDownloading}
      />
    </ContainerLayout>
  );
}
