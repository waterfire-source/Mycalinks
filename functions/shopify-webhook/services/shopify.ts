export class ShopifyService {
  public static gidByRestId(resourceType: 'location', resourceId: number) {
    switch (resourceType) {
      case 'location':
        return `gid://shopify/Location/${resourceId}`;
    }
  }
}

export namespace ShopifyService {
  export type WebhookEvent<T extends ShopifyService.WebhookEventPayload> = {
    payload: T;
    metadata: {
      'X-Shopify-Topic': 'orders/paid' | 'orders/fulfilled';
      'X-Shopify-Shop-Domain': string;
      'X-Shopify-Hmac-SHA256': string;
      'X-Shopify-Webhook-Id': string;
      'X-Shopify-API-Version': string;
      'X-Shopify-Event-Id': string;
      'X-Shopify-Triggered-At': string;
    };
  };

  export type WebhookEventPayload = OrderEvent;

  export type OrderEvent = {
    admin_graphql_api_id: string; //gid
    financial_status: 'paid';
    fulfillment_status: 'fulfilled';
  };
}
