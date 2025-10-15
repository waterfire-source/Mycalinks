//POS共通

export const posCommonConstants = {
  productCodePrefix: 4280000000000,
  csvTemplateKinds: {
    item: {
      label: '商品マスタ',
      options: {
        changeDisplayName: '商品名',
        changeDisplayNameRuby: '商品名カナ',
        changeExpansion: 'エキスパンション',
        changeCardNumber: 'カード番号',
        changeRarity: 'レアリティ',
        changePackName: 'パック名',
        changeKeyword: 'キーワード',
        changeReadOnlyProductCode: 'JANコード',
        changeOrderNumber: '表示順',
        changeSellPrice: '販売価格',
        changeBuyPrice: '買取価格',
        changeIsBuyOnly: '買取専用',
        changeTabletAllowed: 'タブレットで販売可能',
        changeInfiniteStock: '在庫無限',
        changeDisallowRound: '端数処理無効設定',
        changeHidden: '非表示',
      },
    },
    product: {
      label: '在庫',
      options: {
        changeDisplayName: '商品名',
        changeSpecificSellPrice: '独自販売価格',
        changeSpecificBuyPrice: '独自買取価格',
        stocking: '仕入れを行う',
        changeReadOnlyProductCode: 'JANコード',
        changeTabletAllowed: 'タブレットで販売可能',
        printLabel: 'ラベル印刷',
        mycalinksEcEnabled: 'Mycalinks Mall出品',
        ochanokoProductId: 'おちゃのこ在庫ID',
        shopifyProduct: 'Shopify在庫連携を行う',
      },
    },
  },
  displayNameDict: {
    item: {
      display_name: '商品名',
      display_name_ruby: '商品名カナ',
      sell_price: '販売価格',
      buy_price: '買取価格',
      rarity: 'レアリティ',
      pack_name: 'パック名',
      description: '概要',
      readonly_product_code: 'JANコード（カンマ区切りで複数）',
      is_buy_only: '買取専用',
      // jan_code_as_product_code: 'JANコードを商品コードとして使う',
      order_number: '表示順（番号が高い順に表示、規定値は0）',
    },
    transaction: {
      id: {
        label: 'ID',
      },
      transaction_kind: {
        label: '取引種類',
        enum: {
          sell: '販売',
          buy: '買取',
        } as Record<string, string>,
      },
      status: {
        label: 'ステータス',
        enum: {
          draft: '下書き',
          completed: '完了',
          canceled: 'キャンセル済',
        } as Record<string, string>,
      },
      is_return: {
        label: '返品取引',
        enum: {
          true: '返品',
          false: '',
        } as Record<string, string>,
      },
      total_price: {
        label: '合計金額',
      },
      payment_method: {
        label: '支払い方法',
        enum: {
          square: 'カード',
          felica: '電子マネー',
          paypay: 'QR決済',
          cash: '現金',
          bank: '銀行振込',
        } as Record<string, string>,
      },
      finished_at: {
        label: '取引日時',
      },
    },
  },
  account: {
    specialAccountGroup: {
      //特殊権限グループのID
      corp: {
        id: 100,
      },
      store: {
        id: 101,
      },
    },
  },
  infiniteItemDefaultStockNumber: 1000000,
};

export type ItemCsvUploadOptions = Partial<
  Record<keyof typeof posCommonConstants.csvTemplateKinds.item.options, boolean>
>;

export type ProductCsvUploadOptions = Partial<
  Record<
    keyof typeof posCommonConstants.csvTemplateKinds.product.options,
    boolean
  >
>;
