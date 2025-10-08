import { EcItem } from '@/app/ec/(core)/hooks/useEcItem';

/**
 * ECページのセッションストレージ管理クラス
 *
 * 主な機能:
 * - ページの状態(商品一覧、スクロール位置など)の保存と復元
 * - 10分間のデータ保持
 * - ページ遷移時の状態維持
 */

/**
 * ECページの状態データ型定義
 */
export type EcPageState = {
  key: string;
  scrollPosition: number;
  items: EcItem[];
  itemsCount: number;
  timestamp: number;
};

/**
 * ECセッションストレージ型定義
 */
export type EcSessionStorage = {
  currentState?: EcPageState;
};

/**
 * 復元用状態データ型定義
 */
export type RestoredState = {
  items?: EcItem[];
  page?: number;
  scrollPosition?: number;
};

/**
 * ECアプリケーション用のsessionStorage管理クラス
 */
export class EcSessionStorageManager {
  private static readonly STORAGE_KEY = 'ec';
  private static readonly EXPIRY_DURATION = 10 * 60 * 1000; // 10分

  /**
   * ECストレージからデータを取得
   */
  private static getEcStorage(): EcSessionStorage {
    try {
      const storageStr = sessionStorage.getItem(this.STORAGE_KEY);
      return storageStr ? JSON.parse(storageStr) : {};
    } catch (error) {
      console.error('Failed to get EC storage:', error);
      return {};
    }
  }

  /**
   * ECストレージにデータを保存
   */
  private static setEcStorage(data: EcSessionStorage): void {
    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to set EC storage:', error);
      // 容量オーバーの場合は一度クリアして再保存
      try {
        sessionStorage.clear();
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      } catch (clearError) {
        console.error('Failed to clear and save EC storage:', clearError);
      }
    }
  }

  /**
   * パスが /ec/items/genre/〇〇 の形式かチェック
   */
  private static isGenreItemsPath(pathname: string): boolean {
    return /^\/ec\/items\/genre\/[^/]+$/.test(pathname);
  }

  /**
   * 現在のページ状態を保存
   */
  static savePageState(
    pathname: string,
    search: string,
    scrollPosition: number,
    items: EcItem[],
  ): void {
    // /ec/items/genre/〇〇 以外では保存しない
    if (!this.isGenreItemsPath(pathname)) {
      return;
    }

    const stateKey = `${pathname}${search}`;
    const newState: EcPageState = {
      key: stateKey,
      scrollPosition,
      items,
      itemsCount: items.length,
      timestamp: Date.now(),
    };

    const ecStorage: EcSessionStorage = {
      currentState: newState,
    };

    this.setEcStorage(ecStorage);
  }

  /**
   * ページ状態を復元
   */
  static restorePageState(
    pathname: string,
    search: string,
  ): RestoredState | null {
    const currentPath = `${pathname}${search}`;
    const ecStorage = this.getEcStorage();

    if (!ecStorage.currentState || ecStorage.currentState.key !== currentPath) {
      return null;
    }

    const state = ecStorage.currentState;

    // 期限切れチェック
    if (Date.now() - state.timestamp > this.EXPIRY_DURATION) {
      return null;
    }

    return {
      items: state.items,
      page: Math.floor(state.itemsCount / 18), // ページ数を計算
      scrollPosition: state.scrollPosition,
    };
  }

  /**
   * 保存されたデータをクリア
   */
  static clear(): void {
    try {
      sessionStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear EC storage:', error);
    }
  }

  /**
   * デバッグ用：現在の保存状態を取得
   */
  static getDebugInfo(): EcSessionStorage {
    return this.getEcStorage();
  }
}
