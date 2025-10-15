/**
 * Test data for product search tests in purchase
 */
export interface PurchaseSearchTestCase {
  genre?: string;
  category?: string;
  searchText?: string;
  expectedProductCode: string;
  description: string;
}

/**
 * Purchase product search test cases
 */
export const testSearchCases: PurchaseSearchTestCase[] = [
  {
    genre: '五等分の花嫁',
    expectedProductCode: 'GYC_PR GYC-PR-025',
    description:
      'ジャンル「五等分の花嫁」を選択して商品コード「GYC_PR GYC-PR-025」の商品が表示されること',
  },
  {
    genre: 'OP',
    category: 'カード',
    expectedProductCode: 'OP09-043',
    description:
      'ジャンル「OP」とカテゴリ「カード」を選択して商品コード「OP09-043」の商品が表示されること',
  },
  {
    searchText: '伝えたい気持ち 中野 三玖',
    expectedProductCode: 'GYC_PR GYC-PR-025',
    description:
      '「伝えたい気持ち 中野 三玖」で検索して商品コード「GYC_PR GYC-PR-025」の商品が表示されること',
  },
];
