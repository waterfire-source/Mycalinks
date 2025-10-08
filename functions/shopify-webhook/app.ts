//Emailを受け取ってwebhook化する
import { EventBridgeHandler } from 'aws-lambda';
import { ShopifyService } from './services/shopify';
import { TaskService } from './services/task';

export const handler: EventBridgeHandler<
  string,
  ShopifyService.WebhookEvent<any>,
  void
> = async (event) => {
  console.log(`Shopifyからイベントが来ました`);

  const type = event.detail.metadata['X-Shopify-Topic'];
  const shopDomain = event.detail.metadata['X-Shopify-Shop-Domain'];
  const payload = event.detail.payload;

  console.log('イベントタイプは', type);

  switch (type) {
    //注文支払い時 発送時
    case 'orders/paid':
    case 'orders/fulfilled': {
      const thisPayload = payload as ShopifyService.OrderEvent;

      const taskService = new TaskService('externalEc');
      const md5edShopDomain = taskService.md5(shopDomain);

      const messageId = await taskService.publish({
        groupId: `shopify-${md5edShopDomain}-order`,
        kind: 'shopifyOrder',
        body: [
          {
            task_item_id: 1,
            data: {
              shopify_shop_domain: shopDomain,
              order_id: thisPayload.admin_graphql_api_id,
              kind: type === 'orders/paid' ? 'ordered' : 'shipped',
            },
          },
        ],
      });

      console.log('messageIdは', messageId);

      break;
    }
  }
};
