import { ItemAPIRes } from '@/api/frontend/item/api';
import { PurchaseCartItem } from '@/feature/purchase/hooks/usePurchaseCart';

export interface LocalStorageItem {
  // 取引関連のデータ
  transactionId?: number;
  zeroPriceItems?: ItemAPIRes['getAll']['items'];
  carts?: PurchaseCartItem[];
  // 店舗関連のデータ
  storeId?: number;
}

export class LocalStorageManager {
  constructor(private storageKey: string) {}

  // データを保存
  setItem(value: Partial<LocalStorageItem>): void {
    const currentData = this.getItem() || {};
    const newData = { ...currentData, ...value };
    const serializedData = JSON.stringify(newData);
    localStorage.setItem(this.storageKey, serializedData);
  }

  // データを取得
  getItem(): LocalStorageItem | null {
    const item = localStorage.getItem(this.storageKey);
    if (!item) {
      return null;
    }

    try {
      return JSON.parse(item) as LocalStorageItem;
    } catch (error) {
      console.error('LocalStorageからのデータのパースに失敗しました:', error);
      return null;
    }
  }

  // 特定のデータを削除
  removeItem(): void {
    localStorage.removeItem(this.storageKey);
  }

  // LocalStorageのクリア
  clearAll(): void {
    localStorage.clear();
  }
}
