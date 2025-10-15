import { OpenAPIObjectConfigV31 } from '@asteasolutions/zod-to-openapi/dist/v3.1/openapi-generator';

export const apiGeneratorConstant = {
  globalSetting: {
    openapi: '3.1.0',
    info: {
      title: 'MycaPOS API',
      description:
        'MycaPOSプロジェクトで使うREST APIの定義 ※まだ5%くらいしかOpenAPI化できてないです',
      contact: {
        name: '齊田',
      },
      version: '1.0.0',
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_ORIGIN + '/api',
        description: 'dev server',
      },
    ],
    tags: [
      {
        name: 'account',
        description: 'アカウント関連のAPI',
      },
      {
        name: 'advertisement',
        description: '宣伝関連のAPI',
      },
      {
        name: 'appraisal',
        description: '鑑定関連のAPI',
      },
      {
        name: 'contract',
        description: '契約関連のAPI',
      },
      {
        name: 'corporation',
        description: '法人関連のAPI',
      },
      {
        name: 'customer',
        description: '顧客関連のAPI',
      },
      {
        name: 'ec',
        description: 'EC関連のAPI',
      },
      {
        name: 'inventory',
        description: '棚卸関連のAPI',
      },
      {
        name: 'item',
        description: '商品マスタ関連のAPI',
      },
      {
        name: 'myca-item',
        description: 'Mycaの商品マスタ関連のAPI',
      },
      {
        name: 'myca-user',
        description: 'Mycaのユーザー関連のAPI',
      },
      {
        name: 'launch',
        description: '起動関連のAPI',
      },
      {
        name: 'memo',
        description: 'メモ関連のAPI',
      },
      {
        name: 'product',
        description: '在庫関連のAPI',
      },
      {
        name: 'purchase-table',
        description: '買取表関連のAPI',
      },
      {
        name: 'template',
        description: 'テンプレート関連のAPI',
      },
      {
        name: 'register',
        description: 'レジ関連のAPI',
      },
      {
        name: 'square',
        description: 'Square連携関連のAPI',
      },
      {
        name: 'shopify',
        description: 'Shopify連携関連のAPI',
      },
      {
        name: 'stats',
        description: '統計関連のAPI',
      },
      {
        name: 'stocking',
        description: '仕入れ関連のAPI',
      },
      {
        name: 'store',
        description: '店舗関連のAPI',
      },
      {
        name: 'system',
        description: 'システム関連のAPI',
      },
      {
        name: 'transaction',
        description: '取引関連のAPI',
      },
      {
        name: 'ochanoko',
        description: 'おちゃのこ関連のAPI',
      },
      {
        name: 'reservation',
        description: '予約関連のAPI',
      },
      {
        name: 'consignment',
        description: '委託関連のAPI',
      },
      {
        name: 'task',
        description: 'タスク関連のAPI',
      },
      {
        name: 'loss',
        description: 'ロス関連のAPI',
      },
      {
        name: 'announcement',
        description: 'お知らせ関連のAPI',
      },
      {
        name: 'store-shipment',
        description: '店舗間在庫移動関連のAPI',
      },
      {
        name: 'location',
        description: 'ロケーション関連のAPI',
      },
      {
        name: 'device',
        description: '周辺機器関連のAPI',
      },
    ],
    components: {
      securitySchemes: {
        role: {
          type: 'http',
          description: '権限',
        },
      },
    },
  } as OpenAPIObjectConfigV31,
};
