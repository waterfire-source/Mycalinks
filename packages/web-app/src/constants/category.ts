const defaultConditions = ['新品', '未使用', '中古'];

interface Category {
  name: string;
  conditions?: string[];
}
export const defaultCategoriesConstants: Category[] = [
  {
    name: 'カード',
    conditions: defaultConditions,
  },
  {
    name: 'ボックス',
    conditions: defaultConditions,
  },
  {
    name: 'バンドル',
  },
  {
    name: 'ストレージ',
  },
  {
    name: 'cm買取',
  },
  {
    name: 'その他',
  },
];
