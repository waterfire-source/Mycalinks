export interface TableData {
  id: number; // id(これは、productIdでも、itemIdでもないテーブル独自にrowを識別するためのもの)
  productName: string;
  displayNameWithMeta?: string;
  productId: number;
  productCode: bigint;
  unitPrice: number;
  quantity: number; // 数量
  totalPrice: number;
  category: string;
  discount: number;
  stockNumber: number;
  isBuyOnly: boolean;
  imageUrl?: string | null;
  sale?: {
    id: number;
    displayName: string;
    discountPrice: number;
    discountAmount: string | null;
    allowedItemCount: number;
  };
}
