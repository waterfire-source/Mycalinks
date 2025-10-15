//テーブル監視ロジックは現状これだけであるためクラス化等はしない
//基本的にoutbox監視サービスはスケーリングしない想定
//そのため、なるべくステートレスに、軽量な処理で

import { sleep } from 'common';
import { getPrisma } from 'backend-core';
import { productEcStockHistoriesPublisher } from './publishers/productStockHistory/main';
import { productUpdatePublisher } from './publishers/productUpdate/main';

const config = {
  pollingInterval: 5000, // 5秒（今後絞っていくかも）
};

const db = getPrisma();

const startMonitoring = async () => {
  console.log('Starting outbox monitoring...');

  while (true) {
    try {
      const [productStockHistories, productInfos] = await Promise.all([
        //Productの在庫変動記録
        db.outbox_Ec_Product_Stock_History.findMany({
          orderBy: {
            id: 'asc', //fifo
          },
        }),
        //Productの情報変動記録
        db.outbox_Product.findMany({
          orderBy: {
            id: 'asc', //fifo
          },
        }),
      ]);

      const none = [productStockHistories, productInfos].every(
        (v) => !v.length,
      );

      if (none) {
        // レコードがなかった場合は2秒待機
        console.log(`outboxレコードがないため2秒待機`);
        await sleep(config.pollingInterval);
        continue;
      }

      //処理を行う（優先度順）
      //1. 在庫変動記録
      if (productStockHistories.length) {
        try {
          await productEcStockHistoriesPublisher(productStockHistories);
          console.log(
            `outbox在庫変動記録: ${productStockHistories.length}件処理完了`,
          );
        } catch (error) {
          console.error('在庫変動記録の処理でエラーが発生しました:', error);
          // エラーが発生しても処理を継続
        }
      }

      //2. 在庫情報変動記録
      if (productInfos.length) {
        try {
          await productUpdatePublisher(productInfos);
          console.log(
            `outbox在庫情報変動記録: ${productInfos.length}件処理完了`,
          );
        } catch (error) {
          console.error('在庫情報変動記録の処理でエラーが発生しました:', error);
          // エラーが発生しても処理を継続
        }
      }
    } catch (error) {
      console.error(
        'outbox監視処理でエラーが発生しました. 5秒後に再試行します:',
        error,
      );
      // データベース接続エラーなどの場合は少し長めに待機
      await sleep(config.pollingInterval);
    }
  }
};

startMonitoring();
