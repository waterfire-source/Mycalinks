import React, { useEffect, useMemo, useState } from 'react';
import { Box, Tabs, Typography, Tooltip } from '@mui/material';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { ItemAPI } from '@/api/frontend/item/api';
import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
import { createClientAPI, CustomError } from '@/api/implement';
import { RegisterForm } from '@/app/auth/(dashboard)/item/components/RegisterForm';
import { FormattedItem } from '@/components/dataGrid/RightClickDataGrid';
import { ItemProductDetail } from '@/app/auth/(dashboard)/item/components/ItemProductDetail';
import { Item } from '@prisma/client';
import { InfoOutlined } from '@mui/icons-material';
import { SecondaryCustomTabTableStyle } from '@/components/tabs/CustomTabTableStyle';
import { HelpIcon } from '@/components/common/HelpIcon';

const TabPanel = ({
  children,
  value,
  index,
}: {
  children: React.ReactNode;
  value: number;
  index: number;
}) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
};

interface Props {
  open: boolean;
  onClose: () => void;
  item: FormattedItem | null;
  refetchItemsAfterUpdate?: (isPageSkip?: boolean) => Promise<void>;
  setProductId?: React.Dispatch<React.SetStateAction<number | undefined>>;
  setIsDetailModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

//独自商品登録の型型
export type RegisterItemFormData = {
  myca_item_id?: number;
  myca_pack_id?: number; //MycaデータベースにおけるパックID
  display_name?: Item['display_name'];
  display_name_ruby?: Item['display_name_ruby'];
  sell_price?: Item['sell_price'];
  buy_price?: Item['buy_price'];
  rarity?: Item['rarity'];
  expansion?: Item['expansion'];
  cardnumber?: Item['cardnumber'];
  keyword?: Item['keyword'];
  pack_name?: Item['pack_name'];
  description?: Item['description'];
  image_url?: Item['image_url'];
  category_id?: Item['category_id'];
  genre_id?: Item['genre_id'];
  is_buy_only?: Item['is_buy_only']; //買取専用商品かどうか
  order_number: Item['order_number']; //表示順
  readonly_product_code?: Item['readonly_product_code']; //JAN
  allow_auto_print_label?: Item['allow_auto_print_label']; //自動でラベル印刷させるかどうか
  hide?: boolean; //trueにするとこの商品マスタを非表示にすることができる、一応論理削除とは区別
  allow_round?: Item['allow_round']; //端数処理を有効にするかどうか
  infinite_stock?: Item['infinite_stock']; //在庫数を無限にするかどうか
  tablet_allowed?: Item['tablet_allowed']; //店舗タブレットに表示するかどうか
};

export const ItemRegisterModal: React.FC<Props> = ({
  open,
  onClose,
  item,
  refetchItemsAfterUpdate,
  setProductId,
  setIsDetailModalOpen,
}) => {
  const { store } = useStore();
  const [tabValue, setTabValue] = useState(0);
  const { setAlertState } = useAlert();
  const clientAPI = createClientAPI();
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  const [formData, setFormData] = useState<RegisterItemFormData>({
    //独自商品追加state
    myca_item_id: undefined,
    myca_pack_id: undefined,
    display_name: '',
    display_name_ruby: '',
    sell_price: undefined,
    buy_price: undefined,
    readonly_product_code: undefined,
    is_buy_only: false,
    order_number: 0, //表示順は必須かどうか確認中
    rarity: '',
    pack_name: '',
    description: '',
    image_url: '',
    allow_auto_print_label: true,
    hide: false,
    allow_round: true,
    infinite_stock: false,
    tablet_allowed: true,
  });

  // 送信できる状態かどうか
  const isFormValid = useMemo(() => {
    return Boolean(
      formData.display_name && formData.category_id, // それ以外については、部門選択も必須
    );
  }, [formData]);

  //更新するかしないか
  const isEdit = useMemo(() => {
    return Boolean(item);
  }, [item]);

  // `item` が渡された場合に `formData` をセットする処理
  useEffect(() => {
    if (item) {
      setFormData({
        myca_item_id: item.mycaItemId ?? undefined,
        myca_pack_id: undefined,
        display_name: item.displayName ?? '',
        display_name_ruby: item.displayNameRuby ?? '',
        sell_price: item.sellPrice ?? undefined,
        buy_price: item.buyPrice ?? undefined,
        readonly_product_code: item.readonlyProductCode ?? undefined,
        is_buy_only: item.isBuyOnly ?? false,
        order_number: item.orderNumber ?? undefined,
        rarity: item.rarity ?? '',
        pack_name: item.packName ?? '',
        description: item.description ?? '',
        image_url: item.imageUrl ?? '',
        genre_id: item.genreId,
        category_id: item.categoryId,
        keyword: item.keyword,
        expansion: item.expansion,
        cardnumber: item.cardnumber,
        allow_auto_print_label: item.allowAutoPrintLabel,
        hide: item.hide,
        allow_round: item.allowRound,
        infinite_stock: item.infiniteStock,
        tablet_allowed: item.tabletAllowed,
      });
    }
  }, [item]);

  //登録、更新処理
  const handleSubmit = async () => {
    if (isEdit) {
      // 更新処理
      if (!item) return;

      const requestData = {
        storeID: store.id,
        itemID: item.id, // 更新対象の商品ID
        body: {
          display_name: formData.display_name,
          display_name_ruby: formData.display_name_ruby,
          sell_price: Number(formData.sell_price),
          buy_price: Number(formData.buy_price),
          rarity: formData.rarity,
          pack_name: formData.pack_name,
          description: formData.description,
          image_url: formData.image_url,
          readonly_product_code: formData.readonly_product_code,
          expansion: formData.expansion,
          cardnumber: formData.cardnumber,
          order_number: Number(formData.order_number),
          keyword: formData.keyword,
          is_buy_only: formData.is_buy_only,
          allow_auto_print_label: formData.allow_auto_print_label,
          hide: formData.hide,
          allow_round: formData.allow_round,
          infinite_stock: formData.infinite_stock,
          tablet_allowed: formData.tablet_allowed,
        },
      };

      const response = await clientAPI.item.update(requestData);

      if (response instanceof CustomError) {
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        return;
      }

      setAlertState({
        message: '商品を更新しました。',
        severity: 'success',
      });

      // 更新後のリストを取得
      if (refetchItemsAfterUpdate) {
        await refetchItemsAfterUpdate(true); //ページネーションは保持させる
      }
    } else {
      // 新規登録処理
      const requestData: ItemAPI['create']['request'] = {
        storeID: store.id,
        ...formData,
      };

      const response = await clientAPI.item.create(requestData);

      if (response instanceof CustomError) {
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        return;
      }

      setAlertState({
        message: '商品登録しました。',
        severity: 'success',
      });

      // フォームをリセット
      setFormData({
        myca_item_id: undefined,
        myca_pack_id: undefined,
        display_name: '',
        display_name_ruby: '',
        sell_price: undefined,
        buy_price: undefined,
        readonly_product_code: undefined,
        order_number: 0,
        is_buy_only: false,
        rarity: '',
        pack_name: '',
        description: '',
        image_url: '',
        genre_id: null,
        category_id: undefined,
        allow_auto_print_label: true,
        hide: false,
        allow_round: true,
        infinite_stock: false,
        tablet_allowed: true,
      });

      // 新規登録後のリストを取得
      if (refetchItemsAfterUpdate) {
        await refetchItemsAfterUpdate();
      }
    }

    // モーダルを閉じる
    onClose();
  };

  return (
    <CustomModalWithIcon
      open={open}
      onClose={onClose}
      title={isEdit ? '商品詳細' : '商品登録'}
      titleInfo={
        !item?.mycaItemId && ( // `item.mycaItemId` がない場合のみ表示
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                backgroundColor: 'grey.300',
                padding: '4px 8px',
                borderRadius: '12px',
                color: 'black',
                fontSize: '0.8rem',
              }}
            >
              <Typography>Mycalinks未連携</Typography>
              <Tooltip
                title="Mycalinks未連携商品は絞り込み機能が制限される場合があります"
                arrow
              >
                <InfoOutlined sx={{ cursor: 'pointer', fontSize: 16 }} />
              </Tooltip>
            </Box>
            <Box>
              <HelpIcon helpArchivesNumber={176} />
            </Box>
          </>
        )
      }
      width="90%"
      height="90%"
      actionButtonText={isEdit ? '変更を保存する' : '登録'}
      onActionButtonClick={handleSubmit}
      isAble={isFormValid}
      onCancelClick={onClose}
      cancelButtonText="商品登録をやめる"
    >
      {/* タブ表示 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            margin: 0,
            padding: 0,
            minHeight: '31px',
          }}
        >
          <SecondaryCustomTabTableStyle label="商品情報" />
          {isEdit && <SecondaryCustomTabTableStyle label="在庫状況" />}
        </Tabs>
      </Box>

      {/* 商品情報タブ */}
      <TabPanel value={tabValue} index={0}>
        <RegisterForm
          formData={formData}
          setFormData={setFormData}
          item={item}
          isEdit={isEdit}
          stockNumber={item?.productsStockNumber}
        />
      </TabPanel>

      {/* 在庫状況タブ */}
      <TabPanel value={tabValue} index={1}>
        <ItemProductDetail
          products={item?.products}
          formData={formData}
          setFormData={setFormData}
          stockNumber={item?.productsStockNumber}
          isEdit={isEdit}
          setProductId={setProductId}
          setIsDetailModalOpen={setIsDetailModalOpen}
          infiniteStock={item?.infiniteStock}
        />
      </TabPanel>
    </CustomModalWithIcon>
  );
};
