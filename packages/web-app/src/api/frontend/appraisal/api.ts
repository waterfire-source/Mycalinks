import {
  Account,
  Appraisal,
  Appraisal_Product,
  Condition_Option,
  Store,
  Product,
  Item_Allowed_Condition,
} from '@prisma/client';

export interface AppraisalAPI {
  createAppraisal: {
    request: {
      store_id: Store['id'];
      staff_account_id: Account['id'];
      appraisal_company_name: Appraisal['appraisal_company_name'];
      appraisal_fee: Appraisal['appraisal_fee'];
      products: Array<{
        product_id: Appraisal_Product['product_id'];
        item_count: number;
      }>;
    };
    response: Appraisal & {
      products: Array<Appraisal_Product>;
    };
  };

  inputAppraisalResult: {
    request: {
      store_id: Store['id'];
      appraisal_id: Appraisal['id'];
      staff_account_id: Account['id'];
      products: Array<{
        id: Appraisal_Product['id'];
        appraisal_result_tag_id: Appraisal_Product['appraisal_result_tag_id'];
        appraisal_number?: Appraisal_Product['appraisal_number'];
        sell_price?: Appraisal_Product['sell_price'];
        condition_option_id: Condition_Option['id'];
      }>;
    };
    response: Appraisal & {
      products: Array<Appraisal_Product>;
    };
  };

  getAppraisal: {
    request: {
      store_id: Store['id'];
      id?: Appraisal['id'];
      finished?: boolean;
    };
    response: {
      appraisals: Array<{
        id: Appraisal['id'];
        store_id: Appraisal['store_id'];
        shipping_date: Appraisal['shipping_date'];
        appraisal_fee: Appraisal['appraisal_fee'];
        appraisal_company_name: Appraisal['appraisal_company_name'];
        staff_account_id: Appraisal['staff_account_id'];
        finished: Appraisal['finished'];
        created_at: Appraisal['created_at'];
        updated_at: Appraisal['updated_at'];
        products: Array<{
          id: Appraisal_Product['id'];
          product_id: Appraisal_Product['product_id'];
          to_product_id: Appraisal_Product['to_product_id'];
          appraisal_number: Appraisal_Product['appraisal_number'];
          sell_price: Appraisal_Product['sell_price'];
          condition_option_id: Appraisal_Product['condition_option_id'];
          wholesale_price: Appraisal_Product['wholesale_price'];
          appraisal_fee: Appraisal_Product['appraisal_fee'];
          product: {
            display_name: Product['display_name'];
            displayNameWithMeta?: string;
            item_allowed_conditions: Item_Allowed_Condition[];
          };
        }>;
      }>;
    };
  };
}
