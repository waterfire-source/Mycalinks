import {
  PurchaseTableFormat,
  TransactionKind,
  TransactionPaymentMethod,
  TransactionStatus,
  RegisterCashHistorySourceKind,
} from '@prisma/client';

export const mycaPosCommonConstants = {
  images: {
    logo: 'https://static.mycalinks.io/pos/general/logo/mycaposLogo.png',
  },
  brotherLabelPrinter: {
    lbxTemplateDir: process.env.NEXT_PUBLIC_ORIGIN + '/templates/lbx/',
    remoteTemplateDir: `https://static.mycalinks.io/pos/general/label-printer/templates/`,
  },
  systemAccountId: 100, //システムが実行するときに使うアカウントID

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
        } as Record<TransactionKind, string>,
      },
      status: {
        label: 'ステータス',
        enum: {
          draft: '下書き',
          completed: '完了',
          canceled: 'キャンセル済',
        } as Record<TransactionStatus, string>,
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
        } as Record<TransactionPaymentMethod, string>,
      },
      finished_at: {
        label: '取引日時',
      },
      point_discount_price: {
        label: '使用ポイント',
      },
      point_amount: { label: '付与ポイント' },
    },
    register: {
      cashHistory: {
        sourceKind: Object.assign({}, RegisterCashHistorySourceKind, {
          import: '入金',
          export: '出金',
        }),
      },
    },
  },
  conditions: {
    cardConditions: 'カードコンディション',
    standardConditionDisplayName: ['A', '新品'],
  },

  //買取表フォーマットの定義
  purchaseTableFormats: [
    {
      format: PurchaseTableFormat.HORIZONTAL_8,
      displayName: '横長8枚（縦2551px×3579px）',
      count: 8,
      templateUrl:
        'https://static.mycalinks.io/pos/general/purchase-table/templates/HORIZONTAL.jpg',
    },
    {
      format: PurchaseTableFormat.HORIZONTAL_18,
      displayName: '横長18枚（縦2551px×3579px）',
      count: 18,
      templateUrl:
        'https://static.mycalinks.io/pos/general/purchase-table/templates/HORIZONTAL.jpg',
    },
    {
      format: PurchaseTableFormat.HORIZONTAL_36,
      displayName: '横長36枚（縦2551px×3579px）',
      count: 36,
      templateUrl:
        'https://static.mycalinks.io/pos/general/purchase-table/templates/HORIZONTAL.jpg',
    },
    {
      format: PurchaseTableFormat.VERTICAL_4,
      displayName: '縦長4枚（縦3579px×2551px）',
      count: 4,
      templateUrl:
        'https://static.mycalinks.io/pos/general/purchase-table/templates/VERTICAL.jpg',
    },
    {
      format: PurchaseTableFormat.VERTICAL_9,
      displayName: '縦長9枚（縦3579px×2551px）',
      count: 9,
      templateUrl:
        'https://static.mycalinks.io/pos/general/purchase-table/templates/VERTICAL.jpg',
    },
    {
      format: PurchaseTableFormat.VERTICAL_16,
      displayName: '縦長16枚（縦3579px×2551px）',
      count: 16,
      templateUrl:
        'https://static.mycalinks.io/pos/general/purchase-table/templates/VERTICAL.jpg',
    },
    {
      format: PurchaseTableFormat.VERTICAL_25,
      displayName: '縦長25枚（縦3579px×2551px）',
      count: 25,
      templateUrl:
        'https://static.mycalinks.io/pos/general/purchase-table/templates/VERTICAL.jpg',
    },
    {
      format: PurchaseTableFormat.SQUARE_2,
      displayName: '正方形2枚（縦4000px×横4000px）',
      count: 2,
      templateUrl:
        'https://static.mycalinks.io/pos/general/purchase-table/templates/SQUARE.jpg',
    },
    {
      format: PurchaseTableFormat.SQUARE_6,
      displayName: '正方形6枚（縦4000px×横4000px）',
      count: 6,
      templateUrl:
        'https://static.mycalinks.io/pos/general/purchase-table/templates/SQUARE.jpg',
    },
    {
      format: PurchaseTableFormat.MONITOR_3,
      displayName: 'モニター3枚（縦1080px×横1920px）',
      count: 3,
      templateUrl:
        'https://static.mycalinks.io/pos/general/purchase-table/templates/MONITOR.jpg',
    },
    {
      format: PurchaseTableFormat.MONITOR_12,
      displayName: 'モニター12枚（縦1080px×横1920px）',
      count: 12,
      templateUrl:
        'https://static.mycalinks.io/pos/general/purchase-table/templates/MONITOR.jpg',
    },
    {
      format: PurchaseTableFormat.ENHANCED_1,
      displayName: '正方形1枚（縦4000px×横4000px）',
      count: 1,
      templateUrl:
        'https://static.mycalinks.io/pos/general/purchase-table/templates/SQUARE.jpg',
    },
    {
      format: PurchaseTableFormat.ENHANCED_2,
      displayName: '長方形2枚（縦1108px×横1477px）',
      count: 2,
      templateUrl:
        'https://static.mycalinks.io/pos/general/purchase-table/templates/HORIZONTAL2.jpg',
    },
  ],
  prodAvailableCorporationIds: [1], //本番環境で許可されている法人ID
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
};
