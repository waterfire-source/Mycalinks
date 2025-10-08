import * as ItemTask from './types/item';
import * as TransactionTask from './types/transaction';
import * as EcOrderTask from './types/ec-order';
import * as ExternalEcTask from './types/external-ec';
import * as ScheduledTask from './types/scheduled';
import * as NotificationTask from './types/notification';
import { posCommonConstants } from 'common';
export const workerDefs = {
  item: {
    topic: 'item', //タスク処理では基本的にSNSとSQSは1対1
    kinds: {
      createItem: {
        chunkSize: 100,
        specificGroup: 'item', //これが付いているもの同士の順序も保証させる
        body: <ItemTask.CreateItemData>{},
      },
      addConditionOption: {
        chunkSize: 200, //比較的処理が軽いため200件ずつ
        specificGroup: 'item', //これが付いているもの同士の順序も保証させる
        body: <ItemTask.AddConditionOptionData>{},
      },
      updateItem: {
        chunkSize: 100,
        body: <ItemTask.UpdateItemData>{},
      },
      updateMycaItem: {
        chunkSize: 100,
        body: <ItemTask.UpdateMycaItemData>{},
      },
    },
    queueUrl: process.env.ITEM_WORKER_QUEUE_URL,
    coolDownTime: {
      default: 2000,
      night: 500,
    },
  },
  product: {
    topic: 'product', //タスク処理では基本的にSNSとSQSは1対1
    kinds: {
      updateProduct: {
        chunkSize: 200,
        body: <ItemTask.UpdateProductData>{},
      },
      productStocking: {
        chunkSize: 50,
        body: <ItemTask.Stocking>{},
      },
    },
    queueUrl: process.env.PRODUCT_WORKER_QUEUE_URL,
    coolDownTime: {
      default: 3000,
      night: 500,
    },
  },
  transaction: {
    topic: 'transaction',
    kinds: {
      paymentTimeout: {
        chunkSize: 1,
        delaySeconds: 5 * 60, //5分後に実行
        body: <TransactionTask.TransactionPaymentTimeout>{},
      },
    },
    queueUrl: process.env.TRANSACTION_WORKER_QUEUE_URL,
    coolDownTime: {
      default: 100,
      night: 100,
    },
  },
  ecOrder: {
    topic: 'ecOrder',
    kinds: {
      paymentTimeout: {
        chunkSize: 1,
        delaySeconds: 5 * 60, //5分後に実行
        body: <EcOrderTask.EcOrderPaymentTimeout>{},
      },
    },
    queueUrl: process.env.EC_ORDER_WORKER_QUEUE_URL,
    coolDownTime: {
      default: 100,
      night: 100,
    },
  },
  externalEc: {
    topic: 'externalEc',
    kinds: {
      ochanokoOrder: {
        chunkSize: 1,
        body: <ExternalEcTask.OchanokoOrder>{},
      },
      ochanokoUpdatePrice: {
        //storeIdごとに処理する
        chunkSize: 800,
        body: <ExternalEcTask.OchanokoUpdatePrice>{},
      },
      ochanokoUpdateStockNumber: {
        //storeIdごとに処理する
        chunkSize: 800,
        body: <ExternalEcTask.OchanokoUpdateStockNumber>{},
      },

      //Shopify
      shopifyOrder: {
        chunkSize: 1,
        body: <ExternalEcTask.ShopifyOrder>{},
      },
      shopifyUpdateStockNumber: {
        chunkSize: 100, //100個ずつbulk処理
        body: <ExternalEcTask.ShopifyUpdateStockNumber>{},
      },
      shopifyUpdatePrice: {
        chunkSize: 10, //10件ずつで
        body: <ExternalEcTask.ShopifyUpdatePrice>{},
      },
    },
    queueUrl: process.env.EXTERNAL_EC_WORKER_QUEUE_URL,
    coolDownTime: {
      default: 0,
      night: 0,
    },
  },
  scheduled: {
    topic: 'scheduled',
    kinds: {
      updateSaleStatus: {
        chunkSize: 1,
        body: <ScheduledTask.UpdateSaleStatus>{},
      },
      updateBundleItemStatus: {
        chunkSize: 1,
        body: <ScheduledTask.UpdateBundleItemStatus>{},
      },
      updateSetDealStatus: {
        chunkSize: 1,
        body: <ScheduledTask.UpdateSetDealStatus>{},
      },
      payContractSubscription: {
        chunkSize: 1,
        body: <ScheduledTask.PayContractSubscription>{},
      },
      updateAnnouncementStatus: {
        chunkSize: 1,
        body: <ScheduledTask.UpdateAnnouncementStatus>{},
      },
      updateReservationStatus: {
        chunkSize: 1,
        body: <ScheduledTask.UpdateReservationStatus>{},
      },
    },
    queueUrl: process.env.SCHEDULED_WORKER_QUEUE_URL,
    coolDownTime: {
      default: 0,
      night: 0,
    },
  },
  notification: {
    topic: 'notification',
    kinds: {
      sendPushNotification: {
        chunkSize: 100,
        body: <NotificationTask.SendPushNotification>{},
      },
      sendEmail: {
        chunkSize: 50,
        body: <NotificationTask.SendEmail>{},
      },
    },
    queueUrl: process.env.NOTIFICATION_WORKER_QUEUE_URL,
    coolDownTime: {
      default: 0,
      night: 0,
    },
  },
};

export type TaskMetadata = Array<
  | TaskMetadataComponent.ItemCsvOption
  | TaskMetadataComponent.ProductCsvOption
  | TaskMetadataComponent.CsvFileName
  | TaskMetadataComponent.ConditionOptionInfo
  | TaskMetadataComponent.GenreInfo
  | TaskMetadataComponent.PackInfo
>;

export namespace TaskMetadataComponent {
  export type ItemCsvOption = {
    kind: 'itemCsvOption';
  } & Partial<
    Record<
      keyof typeof posCommonConstants.csvTemplateKinds.item.options,
      boolean
    >
  >;
  export type ProductCsvOption = {
    kind: 'productCsvOption';
  } & Partial<
    Record<
      keyof typeof posCommonConstants.csvTemplateKinds.product.options,
      boolean
    >
  >;
  export type CsvFileName = {
    kind: 'csvFileName';
    fileName: string;
  };
  //追加する状態選択肢
  export type ConditionOptionInfo = {
    kind: 'conditionOptionInfo';
    conditionOptionId: number;
    conditionOptionName: string;
  };
  //追加するジャンル
  export type GenreInfo = {
    kind: 'genreInfo';
    genreId: number;
    genreName: string;
  };
  //パック開封
  export type PackInfo = {
    kind: 'packInfo';
    mycaPackId: number;
    mycaPackName: string;
  };
}
